/*
  # Add Real-time Presence Tracking

  ## Overview
  This migration adds infrastructure for real-time collaboration features including presence tracking and document viewing.

  ## 1. New Tables
    - `document_presence`: Tracks active users viewing/editing documents in real-time
      - `id` (uuid, primary key): Unique identifier
      - `file_id` (uuid): Reference to the file being viewed
      - `user_id` (uuid): User viewing the document
      - `workspace_id` (uuid): Workspace context
      - `cursor_position` (jsonb): Editor cursor position data
      - `last_seen_at` (timestamptz): Last activity timestamp
      - `is_editing` (boolean): Whether user is actively editing
      - `user_color` (text): Color for cursor/presence indicator
      - `created_at` (timestamptz): When user joined

  ## 2. Indexes
    - Index on file_id for fast lookups of who's viewing a document
    - Index on workspace_id for workspace-wide presence
    - Index on last_seen_at for cleanup of stale presence records

  ## 3. Security
    - Enable RLS on document_presence
    - Users can view presence in accessible workspaces
    - Users can manage their own presence records
    - Auto-cleanup function for stale presence (>5 minutes)

  ## 4. Realtime Configuration
    - Enable realtime for workspaces, folders, files tables
    - Enable realtime for document_presence table
*/

-- Create Document Presence Table
CREATE TABLE IF NOT EXISTS document_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  cursor_position JSONB DEFAULT '{}'::jsonb,
  last_seen_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_editing BOOLEAN DEFAULT false NOT NULL,
  user_color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(file_id, user_id)
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_document_presence_file ON document_presence(file_id);
CREATE INDEX IF NOT EXISTS idx_document_presence_workspace ON document_presence(workspace_id);
CREATE INDEX IF NOT EXISTS idx_document_presence_user ON document_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_document_presence_last_seen ON document_presence(last_seen_at);

-- Enable Row Level Security
ALTER TABLE document_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Document Presence
CREATE POLICY "Users can view presence in accessible workspaces"
  ON document_presence FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE workspace_owner_id = auth.uid()
      OR id IN (SELECT workspace_id FROM collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create own presence records"
  ON document_presence FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own presence records"
  ON document_presence FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own presence records"
  ON document_presence FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to clean up stale presence records (older than 5 minutes)
CREATE OR REPLACE FUNCTION cleanup_stale_presence()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM document_presence
  WHERE last_seen_at < NOW() - INTERVAL '5 minutes';
END;
$$;

-- Add updated_at column to files for change tracking
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'files' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE files ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now() NOT NULL;
  END IF;
END $$;

-- Create trigger to update files.updated_at on changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_files_updated_at'
  ) THEN
    CREATE TRIGGER update_files_updated_at
      BEFORE UPDATE ON files
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add updated_at to folders and workspaces too
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'folders' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE folders ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now() NOT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workspaces' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now() NOT NULL;
  END IF;
END $$;

-- Create triggers for folders and workspaces
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_folders_updated_at'
  ) THEN
    CREATE TRIGGER update_folders_updated_at
      BEFORE UPDATE ON folders
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_workspaces_updated_at'
  ) THEN
    CREATE TRIGGER update_workspaces_updated_at
      BEFORE UPDATE ON workspaces
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable Realtime for tables (Supabase specific)
ALTER PUBLICATION supabase_realtime ADD TABLE workspaces;
ALTER PUBLICATION supabase_realtime ADD TABLE folders;
ALTER PUBLICATION supabase_realtime ADD TABLE files;
ALTER PUBLICATION supabase_realtime ADD TABLE document_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE collaborators;
