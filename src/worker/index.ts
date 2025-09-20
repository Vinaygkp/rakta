import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { getCookie, setCookie } from "hono/cookie";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import {
  HospitalSchema,
  BloodInventorySchema,
  BloodRequestSchema,
  BloodDonationSchema,
  SearchQuery,
  BLOOD_TYPES
} from "@/shared/types";
import z from "zod";

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use("*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// Auth endpoints
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", zValidator("json", z.object({ code: z.string() })), async (c) => {
  const { code } = c.req.valid("json");

  const sessionToken = await exchangeCodeForSessionToken(code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Hospital management endpoints
app.get("/api/hospitals/my", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM hospitals WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(user.id).all();

  return c.json(results);
});

app.post("/api/hospitals", authMiddleware, zValidator("json", HospitalSchema.omit({ id: true, user_id: true })), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const hospitalData = c.req.valid("json");

  // Check if user already has a hospital
  const { results: existing } = await c.env.DB.prepare(
    "SELECT id FROM hospitals WHERE user_id = ?"
  ).bind(user.id).all();

  if (existing.length > 0) {
    return c.json({ error: "User already has a registered hospital" }, 400);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO hospitals (user_id, name, address, city, state, district, zip_code, phone, email, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    user.id,
    hospitalData.name,
    hospitalData.address,
    hospitalData.city,
    hospitalData.state,
    hospitalData.district || null,
    hospitalData.zip_code,
    hospitalData.phone,
    hospitalData.email,
    hospitalData.latitude || null,
    hospitalData.longitude || null
  ).run();

  // Initialize blood inventory for all blood types
  for (const bloodType of BLOOD_TYPES) {
    await c.env.DB.prepare(`
      INSERT INTO blood_inventory (hospital_id, blood_type, units_available)
      VALUES (?, ?, 0)
    `).bind(result.meta.last_row_id, bloodType).run();
  }

  return c.json({ id: result.meta.last_row_id, ...hospitalData }, 201);
});

app.put("/api/hospitals/:id", authMiddleware, zValidator("json", HospitalSchema.omit({ id: true, user_id: true })), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const hospitalId = c.req.param("id");
  const hospitalData = c.req.valid("json");

  // Verify ownership
  const { results } = await c.env.DB.prepare(
    "SELECT id FROM hospitals WHERE id = ? AND user_id = ?"
  ).bind(hospitalId, user.id).all();

  if (results.length === 0) {
    return c.json({ error: "Hospital not found or unauthorized" }, 404);
  }

  await c.env.DB.prepare(`
    UPDATE hospitals 
    SET name = ?, address = ?, city = ?, state = ?, district = ?, zip_code = ?, phone = ?, email = ?, latitude = ?, longitude = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    hospitalData.name,
    hospitalData.address,
    hospitalData.city,
    hospitalData.state,
    hospitalData.district || null,
    hospitalData.zip_code,
    hospitalData.phone,
    hospitalData.email,
    hospitalData.latitude || null,
    hospitalData.longitude || null,
    hospitalId
  ).run();

  return c.json({ id: hospitalId, ...hospitalData });
});

// Blood inventory endpoints
app.get("/api/hospitals/:id/inventory", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const hospitalId = c.req.param("id");

  // Verify ownership
  const { results: hospital } = await c.env.DB.prepare(
    "SELECT id FROM hospitals WHERE id = ? AND user_id = ?"
  ).bind(hospitalId, user.id).all();

  if (hospital.length === 0) {
    return c.json({ error: "Hospital not found or unauthorized" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM blood_inventory WHERE hospital_id = ? ORDER BY blood_type"
  ).bind(hospitalId).all();

  return c.json(results);
});

app.put("/api/hospitals/:id/inventory", authMiddleware, zValidator("json", z.array(BloodInventorySchema.omit({ id: true, hospital_id: true }))), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const hospitalId = c.req.param("id");
  const inventoryData = c.req.valid("json");

  // Verify ownership
  const { results: hospital } = await c.env.DB.prepare(
    "SELECT id FROM hospitals WHERE id = ? AND user_id = ?"
  ).bind(hospitalId, user.id).all();

  if (hospital.length === 0) {
    return c.json({ error: "Hospital not found or unauthorized" }, 404);
  }

  // Update inventory for each blood type
  for (const item of inventoryData) {
    await c.env.DB.prepare(`
      UPDATE blood_inventory 
      SET units_available = ?, last_updated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE hospital_id = ? AND blood_type = ?
    `).bind(item.units_available, hospitalId, item.blood_type).run();
  }

  return c.json({ success: true });
});

// Get available districts
app.get("/api/districts", async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT DISTINCT district 
    FROM hospitals 
    WHERE district IS NOT NULL AND district != '' AND is_active = 1
    ORDER BY district
  `).all();

  return c.json(results.map((row: any) => row.district));
});

// Donor search endpoint
app.get("/api/donor-search", async (c) => {
  const blood_type = c.req.query("blood_type");
  const lat = parseFloat(c.req.query("lat") || "0");
  const lng = parseFloat(c.req.query("lng") || "0");
  const radius = parseFloat(c.req.query("radius") || "50");
  const district = c.req.query("district");
  const hospital_name = c.req.query("hospital_name");

  let query = `
    SELECT 
      h.id, h.name, h.address, h.city, h.state, h.district, h.phone, h.email, h.latitude, h.longitude, h.updated_at,
      (SELECT COUNT(*) FROM blood_donations bd WHERE bd.hospital_id = h.id AND bd.created_at >= datetime('now', '-30 days')) as recent_donations,
      (SELECT COUNT(*) FROM blood_requests br WHERE br.hospital_id = h.id AND br.status = 'fulfilled' AND br.updated_at >= datetime('now', '-30 days')) as recent_fulfillments
    FROM hospitals h
    WHERE h.is_active = 1
  `;

  const params: any[] = [];

  // Add district filter if provided
  if (district) {
    query += " AND LOWER(h.district) = LOWER(?)";
    params.push(district);
  }

  // Add hospital name filter if provided
  if (hospital_name) {
    query += " AND LOWER(h.name) LIKE LOWER(?)";
    params.push(`%${hospital_name}%`);
  }

  // Add distance calculation if coordinates provided
  if (lat && lng && lat !== 0 && lng !== 0) {
    query += ` AND (
      6371 * acos(
        cos(radians(?)) * cos(radians(h.latitude)) * 
        cos(radians(h.longitude) - radians(?)) + 
        sin(radians(?)) * sin(radians(h.latitude))
      )
    ) <= ?`;
    params.push(lat, lng, lat, radius);
  }

  query += " ORDER BY h.name";

  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  // Calculate distance for each result if coordinates provided
  const resultsWithDistance = results.map((row: any) => {
    let distance = undefined;
    if (lat && lng && lat !== 0 && lng !== 0 && row.latitude && row.longitude) {
      const R = 6371; // Earth's radius in km
      const dLat = (row.latitude - lat) * Math.PI / 180;
      const dLon = (row.longitude - lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat * Math.PI / 180) * Math.cos(row.latitude * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distance = R * c;
    }

    // Get blood inventory summary for this hospital
    const bloodNeeds = [];
    if (blood_type) {
      // If specific blood type requested, show if they need it
      bloodNeeds.push({
        blood_type: blood_type,
        units_available: 'checking',
        priority: 'medium'
      });
    }

    return { 
      ...row, 
      distance,
      blood_needs: bloodNeeds,
      last_updated_at: row.updated_at
    };
  });

  return c.json(resultsWithDistance);
});

// Public search endpoints
app.get("/api/search", zValidator("query", SearchQuery), async (c) => {
  const { blood_type, lat, lng, radius = 50, district, hospital_name } = c.req.valid("query");

  let query = `
    SELECT 
      h.id, h.name, h.address, h.city, h.state, h.district, h.phone, h.email, h.latitude, h.longitude,
      bi.blood_type, bi.units_available, bi.last_updated_at,
      (SELECT COUNT(*) FROM blood_donations bd WHERE bd.hospital_id = h.id AND bd.created_at >= datetime('now', '-30 days')) as recent_donations,
      (SELECT COUNT(*) FROM blood_requests br WHERE br.hospital_id = h.id AND br.status = 'fulfilled' AND br.updated_at >= datetime('now', '-30 days')) as recent_fulfillments
    FROM hospitals h
    JOIN blood_inventory bi ON h.id = bi.hospital_id
    WHERE h.is_active = 1 AND bi.blood_type = ? AND bi.units_available > 0
  `;

  const params: any[] = [blood_type];

  // Add district filter if provided
  if (district) {
    query += " AND LOWER(h.district) = LOWER(?)";
    params.push(district);
  }

  // Add hospital name filter if provided
  if (hospital_name) {
    query += " AND LOWER(h.name) LIKE LOWER(?)";
    params.push(`%${hospital_name}%`);
  }

  // Add distance calculation if coordinates provided
  if (lat && lng) {
    query += ` AND (
      6371 * acos(
        cos(radians(?)) * cos(radians(h.latitude)) * 
        cos(radians(h.longitude) - radians(?)) + 
        sin(radians(?)) * sin(radians(h.latitude))
      )
    ) <= ?`;
    params.push(lat, lng, lat, radius);
  }

  query += " ORDER BY bi.last_updated_at DESC, bi.units_available DESC";

  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  // Calculate distance for each result if coordinates provided
  const resultsWithDistance = results.map((row: any) => {
    let distance = undefined;
    if (lat && lng && row.latitude && row.longitude) {
      const R = 6371; // Earth's radius in km
      const dLat = (row.latitude - lat) * Math.PI / 180;
      const dLon = (row.longitude - lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat * Math.PI / 180) * Math.cos(row.latitude * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distance = R * c;
    }
    return { ...row, distance };
  });

  return c.json(resultsWithDistance);
});

// Blood request endpoints
app.post("/api/blood-requests", zValidator("json", BloodRequestSchema.omit({ id: true, status: true })), async (c) => {
  const requestData = c.req.valid("json");

  // Verify hospital exists and has the requested blood type available
  const { results: inventory } = await c.env.DB.prepare(`
    SELECT bi.units_available, h.name as hospital_name
    FROM blood_inventory bi
    JOIN hospitals h ON h.id = bi.hospital_id
    WHERE bi.hospital_id = ? AND bi.blood_type = ?
  `).bind(requestData.hospital_id, requestData.blood_type).all();

  if (inventory.length === 0) {
    return c.json({ error: "Hospital or blood type not found" }, 404);
  }

  const availableUnits = inventory[0].units_available as number;
  if (availableUnits < requestData.units_needed) {
    return c.json({ 
      error: `Insufficient blood units available. Only ${availableUnits} units available.` 
    }, 400);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO blood_requests (requester_name, requester_phone, requester_email, blood_type, units_needed, urgency, hospital_id, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    requestData.requester_name,
    requestData.requester_phone,
    requestData.requester_email,
    requestData.blood_type,
    requestData.units_needed,
    requestData.urgency,
    requestData.hospital_id,
    requestData.notes || null
  ).run();

  return c.json({ id: result.meta.last_row_id, ...requestData, status: 'pending' }, 201);
});

app.get("/api/hospitals/:id/requests", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const hospitalId = c.req.param("id");

  // Verify ownership
  const { results: hospital } = await c.env.DB.prepare(
    "SELECT id FROM hospitals WHERE id = ? AND user_id = ?"
  ).bind(hospitalId, user.id).all();

  if (hospital.length === 0) {
    return c.json({ error: "Hospital not found or unauthorized" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM blood_requests WHERE hospital_id = ? ORDER BY created_at DESC"
  ).bind(hospitalId).all();

  return c.json(results);
});

app.put("/api/blood-requests/:id/status", authMiddleware, zValidator("json", z.object({ status: z.enum(['approved', 'fulfilled', 'cancelled']) })), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const requestId = c.req.param("id");
  const { status } = c.req.valid("json");

  // Verify the user owns the hospital for this request
  const { results: request } = await c.env.DB.prepare(`
    SELECT br.*, h.user_id
    FROM blood_requests br
    JOIN hospitals h ON h.id = br.hospital_id
    WHERE br.id = ?
  `).bind(requestId).all();

  if (request.length === 0 || request[0].user_id !== user.id) {
    return c.json({ error: "Request not found or unauthorized" }, 404);
  }

  await c.env.DB.prepare(
    "UPDATE blood_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(status, requestId).run();

  return c.json({ success: true });
});

// Blood donation endpoints
app.post("/api/hospitals/:id/donations", authMiddleware, zValidator("json", BloodDonationSchema.omit({ id: true, hospital_id: true })), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const hospitalId = c.req.param("id");
  const donationData = c.req.valid("json");

  // Verify ownership
  const { results: hospital } = await c.env.DB.prepare(
    "SELECT id FROM hospitals WHERE id = ? AND user_id = ?"
  ).bind(hospitalId, user.id).all();

  if (hospital.length === 0) {
    return c.json({ error: "Hospital not found or unauthorized" }, 404);
  }

  // Insert donation record
  const result = await c.env.DB.prepare(`
    INSERT INTO blood_donations (hospital_id, donor_name, donor_phone, donor_email, blood_type, units_donated, donation_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    hospitalId,
    donationData.donor_name || null,
    donationData.donor_phone || null,
    donationData.donor_email || null,
    donationData.blood_type,
    donationData.units_donated,
    donationData.donation_date,
    donationData.notes || null
  ).run();

  // Update blood inventory
  await c.env.DB.prepare(`
    UPDATE blood_inventory 
    SET units_available = units_available + ?, last_updated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE hospital_id = ? AND blood_type = ?
  `).bind(donationData.units_donated, hospitalId, donationData.blood_type).run();

  return c.json({ id: result.meta.last_row_id, ...donationData, hospital_id: parseInt(hospitalId) }, 201);
});

app.get("/api/hospitals/:id/donations", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const hospitalId = c.req.param("id");

  // Verify ownership
  const { results: hospital } = await c.env.DB.prepare(
    "SELECT id FROM hospitals WHERE id = ? AND user_id = ?"
  ).bind(hospitalId, user.id).all();

  if (hospital.length === 0) {
    return c.json({ error: "Hospital not found or unauthorized" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM blood_donations WHERE hospital_id = ? ORDER BY donation_date DESC, created_at DESC LIMIT 50"
  ).bind(hospitalId).all();

  return c.json(results);
});

const handler = {
  fetch: app.fetch.bind(app),
};

export default handler;
