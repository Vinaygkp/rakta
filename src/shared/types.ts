import z from "zod";

// Blood types enum
export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export const REQUEST_URGENCY = ['low', 'medium', 'high', 'critical'] as const;
export const REQUEST_STATUS = ['pending', 'approved', 'fulfilled', 'cancelled'] as const;

export const BloodDonationSchema = z.object({
  id: z.number().optional(),
  hospital_id: z.number(),
  donor_name: z.string().optional(),
  donor_phone: z.string().optional(),
  donor_email: z.string().email().optional().or(z.literal("")),
  blood_type: z.enum(BLOOD_TYPES),
  units_donated: z.number().min(1, "At least 1 unit is required"),
  donation_date: z.string(),
  notes: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

// Zod schemas for validation
export const HospitalSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  name: z.string().min(1, "Hospital name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().optional(),
  zip_code: z.string().min(1, "ZIP code is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  is_active: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const BloodInventorySchema = z.object({
  id: z.number().optional(),
  hospital_id: z.number(),
  blood_type: z.enum(BLOOD_TYPES),
  units_available: z.number().min(0, "Units must be non-negative"),
  last_updated_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const BloodRequestSchema = z.object({
  id: z.number().optional(),
  requester_name: z.string().min(1, "Name is required"),
  requester_phone: z.string().min(1, "Phone is required"),
  requester_email: z.string().email("Valid email is required"),
  blood_type: z.enum(BLOOD_TYPES),
  units_needed: z.number().min(1, "At least 1 unit is required"),
  urgency: z.enum(REQUEST_URGENCY),
  hospital_id: z.number(),
  status: z.enum(REQUEST_STATUS).optional(),
  notes: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const SearchQuery = z.object({
  blood_type: z.enum(BLOOD_TYPES),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radius: z.number().min(1).max(100).optional(), // km
  district: z.string().optional(),
  hospital_name: z.string().optional()
});

// Derived types
export type HospitalType = z.infer<typeof HospitalSchema>;
export type BloodInventoryType = z.infer<typeof BloodInventorySchema>;
export type BloodRequestType = z.infer<typeof BloodRequestSchema>;
export type BloodDonationType = z.infer<typeof BloodDonationSchema>;
export type SearchQueryType = z.infer<typeof SearchQuery>;

// Extended types with relations
export type HospitalWithInventory = HospitalType & {
  inventory: BloodInventoryType[];
};

export type BloodInventoryWithHospital = BloodInventoryType & {
  hospital: HospitalType;
  distance?: number;
};
