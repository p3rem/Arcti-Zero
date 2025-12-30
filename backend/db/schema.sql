-- Enable UUID extension if needed (optional, keeping it simple with SERIAL/INTEGER for now as per plan, or UUID as per prompt "sqlid"? Prompt said "sqlid" but typically that means generated ID. I'll use SERIAL for simplicity unless UUID is strictly better. College team -> SERIAL is easier to debug. I'll stick to SERIAL or UUID if it looks "modern". Let's use SERIAL for now for simplicity, or standard "id" column.)

CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  industry_sector VARCHAR(255),
  size VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  parent_id INTEGER REFERENCES departments(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user', -- admin, manager, user, viewer
  organization_id INTEGER REFERENCES organizations(id),
  department_id INTEGER REFERENCES departments(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emission_factors (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL, -- electricity, transport, etc.
  subcategory VARCHAR(100),
  region VARCHAR(100),
  factor_value DECIMAL(10, 4) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  source VARCHAR(100),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emission_records (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  department_id INTEGER REFERENCES departments(id),
  user_id INTEGER REFERENCES users(id),
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(100),
  activity_data DECIMAL(12, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  emission_factor DECIMAL(10, 4),
  calculated_co2e DECIMAL(12, 2), -- Storing calculated value for simpler analytics
  date DATE NOT NULL,
  source VARCHAR(50) DEFAULT 'manual', -- manual, upload, api
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  target_reduction_percent DECIMAL(5, 2),
  baseline_year INTEGER,
  target_year INTEGER,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  category VARCHAR(50),
  title VARCHAR(255),
  description TEXT,
  potential_reduction DECIMAL(12, 2),
  cost_estimate DECIMAL(12, 2),
  difficulty VARCHAR(20), -- high, medium, low
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  user_id INTEGER REFERENCES users(id),
  report_type VARCHAR(50),
  date_range_start DATE,
  date_range_end DATE,
  file_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
