import { supabase } from './supabase'

const BUCKET = 'avatars'
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024 // keep in sync with supabase_setup.sql
const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

/** Returns an error message, or '' when the file is OK to upload. */
export function validateAvatar(file) {
  if (!file) return ''
  if (!ALLOWED_TYPES[file.type]) return 'Photo must be a JPG, PNG, WEBP or GIF image.'
  if (file.size > MAX_AVATAR_BYTES) return 'Photo must be 2 MB or smaller.'
  return ''
}

async function listUserFiles(userId) {
  const { data, error } = await supabase.storage.from(BUCKET).list(userId, { limit: 100 })
  if (error) throw error
  return (data || []).filter(f => f.name && f.id).map(f => `${userId}/${f.name}`)
}

/**
 * Uploads a new avatar under `<userId>/` and removes the user's older avatar files.
 * Needs a logged-in session (storage RLS only lets a user write to their own folder).
 * Returns the public URL.
 */
export async function uploadAvatar(userId, file) {
  const ext = ALLOWED_TYPES[file.type] || 'jpg'
  // A new file name each time: no CDN cache problems and no upsert needed.
  const path = `${userId}/avatar-${Date.now()}.${ext}`

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: '3600' })
  if (upErr) throw upErr

  // Clean up previous avatars so storage does not fill with orphans.
  try {
    const old = (await listUserFiles(userId)).filter(p => p !== path)
    if (old.length) await supabase.storage.from(BUCKET).remove(old)
  } catch (err) {
    console.warn('Could not clean up old avatars:', err)
  }

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

/** Removes every file in the user's avatar folder. */
export async function removeAllAvatars(userId) {
  const files = await listUserFiles(userId)
  if (files.length) {
    const { error } = await supabase.storage.from(BUCKET).remove(files)
    if (error) throw error
  }
}
