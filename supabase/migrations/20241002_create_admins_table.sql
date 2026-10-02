-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  is_main_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Add RLS policies
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read their own data
CREATE POLICY "Admins can read their own data"
  ON admins FOR SELECT
  USING (auth.uid() = id);

-- Policy: Admins can update their own data
CREATE POLICY "Admins can update their own data"
  ON admins FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Only main admin can create new admins (enforce via app logic)
-- This is checked in the application code, not via RLS

-- Create index for faster queries
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_created_at ON admins(created_at DESC);

-- Add comment
COMMENT ON TABLE admins IS 'Stores administrator accounts for the booking app';
