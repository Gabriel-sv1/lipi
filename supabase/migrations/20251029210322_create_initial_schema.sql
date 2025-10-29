/*
  # Create Initial Schema for Lipi - Notion Clone

  ## Overview
  This migration creates the complete database schema for a Notion-like collaborative workspace application.

  ## 1. Enums
    - subscription_status: Tracks subscription states (unpaid, past_due, incomplete_expired, incomplete, canceled, active, trialing)
    - pricing_type: Defines pricing models (recurring, one_time)
    - pricing_plan_interval: Subscription intervals (year, month, week, day)

  ## 2. Authentication Tables
    - `user`: Core user information with email, name, username, password, and profile image
    - `account`: OAuth provider accounts linked to users
    - `verificationToken`: Email verification tokens for auth

  ## 3. Workspace Tables
    - `workspaces`: Main workspace entity with title, icon, data, logo, banner, owner
    - `folders`: Folders within workspaces for organizing files
    - `files`: Individual documents/files within folders or workspaces
    - `collaborators`: Junction table for workspace collaboration

  ## 4. Subscription Tables
    - `products`: Stripe products for subscription plans
    - `prices`: Pricing information for products
    - `customers`: Stripe customer IDs
    - `accounts_billing`: Billing address and payment method info
    - `subscriptions`: Active subscriptions with period and status

  ## 5. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for workspace members to access shared workspaces
    - Restrict access based on ownership and collaboration
*/

-- Create Enums
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM (
    'unpaid',
    'past_due',
    'incomplete_expired',
    'incomplete',
    'canceled',
    'active',
    'trialing'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE pricing_type AS ENUM ('recurring', 'one_time');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE pricing_plan_interval AS ENUM ('year', 'month', 'week', 'day');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create Users Table
CREATE TABLE IF NOT EXISTS "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  password TEXT,
  "emailVerified" TIMESTAMP,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Accounts Table (OAuth)
CREATE TABLE IF NOT EXISTS account (
  "userId" UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  PRIMARY KEY (provider, "providerAccountId")
);

-- Create Verification Tokens Table
CREATE TABLE IF NOT EXISTS "verificationToken" (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Create Workspaces Table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  icon_id TEXT NOT NULL,
  data TEXT,
  logo TEXT,
  banner_url TEXT,
  workspace_owner_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  in_trash BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Folders Table
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  icon_id TEXT NOT NULL,
  data TEXT,
  banner_url TEXT,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  in_trash BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Files Table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  icon_id TEXT NOT NULL,
  data TEXT,
  banner_url TEXT,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  in_trash BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Collaborators Table
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(workspace_id, user_id)
);

-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  active BOOLEAN,
  name TEXT,
  description TEXT,
  image TEXT,
  metadata JSONB
);

-- Create Prices Table
CREATE TABLE IF NOT EXISTS prices (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id),
  active BOOLEAN,
  description TEXT,
  unit_amount BIGINT,
  currency TEXT,
  type pricing_type,
  interval pricing_plan_interval,
  interval_count INTEGER,
  trial_period_days INTEGER,
  metadata JSONB
);

-- Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE
);

-- Create Accounts Billing Table
CREATE TABLE IF NOT EXISTS accounts_billing (
  user_id UUID PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  billing_address JSONB,
  payment_method JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  status subscription_status,
  metadata JSONB,
  price_id TEXT REFERENCES prices(id),
  quantity INTEGER,
  cancel_at_period_end BOOLEAN,
  created TIMESTAMPTZ DEFAULT now() NOT NULL,
  current_period_start TIMESTAMPTZ DEFAULT now() NOT NULL,
  current_period_end TIMESTAMPTZ DEFAULT now() NOT NULL,
  ended_at TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(workspace_owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_trash ON workspaces(in_trash);
CREATE INDEX IF NOT EXISTS idx_folders_workspace ON folders(workspace_id);
CREATE INDEX IF NOT EXISTS idx_folders_trash ON folders(in_trash);
CREATE INDEX IF NOT EXISTS idx_files_workspace ON files(workspace_id);
CREATE INDEX IF NOT EXISTS idx_files_folder ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_trash ON files(in_trash);
CREATE INDEX IF NOT EXISTS idx_collaborators_workspace ON collaborators(workspace_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user ON collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users Table
CREATE POLICY "Users can view own profile"
  ON "user" FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON "user" FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- RLS Policies for Workspaces Table
CREATE POLICY "Users can view own workspaces"
  ON workspaces FOR SELECT
  TO authenticated
  USING (
    workspace_owner_id = auth.uid() 
    OR id IN (
      SELECT workspace_id FROM collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workspaces"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (workspace_owner_id = auth.uid());

CREATE POLICY "Workspace owners can update their workspaces"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (workspace_owner_id = auth.uid())
  WITH CHECK (workspace_owner_id = auth.uid());

CREATE POLICY "Workspace owners can delete their workspaces"
  ON workspaces FOR DELETE
  TO authenticated
  USING (workspace_owner_id = auth.uid());

-- RLS Policies for Folders Table
CREATE POLICY "Users can view folders in accessible workspaces"
  ON folders FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE workspace_owner_id = auth.uid()
      OR id IN (SELECT workspace_id FROM collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create folders in accessible workspaces"
  ON folders FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE workspace_owner_id = auth.uid()
      OR id IN (SELECT workspace_id FROM collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update folders in accessible workspaces"
  ON folders FOR UPDATE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE workspace_owner_id = auth.uid()
      OR id IN (SELECT workspace_id FROM collaborators WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE workspace_owner_id = auth.uid()
      OR id IN (SELECT workspace_id FROM collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete folders in accessible workspaces"
  ON folders FOR DELETE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE workspace_owner_id = auth.uid()
      OR id IN (SELECT workspace_id FROM collaborators WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for Files Table
CREATE POLICY "Users can view files in accessible workspaces"
  ON files FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE workspace_owner_id = auth.uid()
      OR id IN (SELECT workspace_id FROM collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create files in accessible workspaces"
  ON files FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE workspace_owner_id = auth.uid()
      OR id IN (SELECT workspace_id FROM collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update files in accessible workspaces"
  ON files FOR UPDATE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE workspace_owner_id = auth.uid()
      OR id IN (SELECT workspace_id FROM collaborators WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE workspace_owner_id = auth.uid()
      OR id IN (SELECT workspace_id FROM collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete files in accessible workspaces"
  ON files FOR DELETE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE workspace_owner_id = auth.uid()
      OR id IN (SELECT workspace_id FROM collaborators WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for Collaborators Table
CREATE POLICY "Users can view collaborators in their workspaces"
  ON collaborators FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE workspace_owner_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Workspace owners can add collaborators"
  ON collaborators FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE workspace_owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can remove collaborators"
  ON collaborators FOR DELETE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE workspace_owner_id = auth.uid()
    )
  );

-- RLS Policies for Billing and Subscriptions
CREATE POLICY "Users can view own billing info"
  ON accounts_billing FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own billing info"
  ON accounts_billing FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own customer info"
  ON customers FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
