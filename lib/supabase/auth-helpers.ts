import { supabase } from './client';

export async function getUserFromSupabase(userId: string) {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user from Supabase:', error);
    return null;
  }

  return data;
}

export async function createUserInSupabase(userData: {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  const { data, error } = await supabase
    .from('user')
    .insert([userData])
    .select()
    .single();

  if (error) {
    console.error('Error creating user in Supabase:', error);
    return null;
  }

  return data;
}

export async function updateUserInSupabase(
  userId: string,
  updates: {
    name?: string;
    email?: string;
    image?: string;
    username?: string;
  }
) {
  const { data, error } = await supabase
    .from('user')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user in Supabase:', error);
    return null;
  }

  return data;
}
