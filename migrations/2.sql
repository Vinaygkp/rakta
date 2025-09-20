
CREATE TABLE blood_donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hospital_id INTEGER NOT NULL,
  donor_name TEXT,
  donor_phone TEXT,
  donor_email TEXT,
  blood_type TEXT NOT NULL,
  units_donated INTEGER NOT NULL,
  donation_date DATE NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blood_donations_hospital ON blood_donations(hospital_id);
CREATE INDEX idx_blood_donations_date ON blood_donations(donation_date);
