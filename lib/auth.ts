import { supabaseAdmin } from './supabase'
import { cookies } from 'next/headers'

export interface Admin {
  id: string
  email: string
  is_main_admin: boolean
  created_at: string
  last_login: string | null
}

/**
 * Sign up a new admin (only main admin can do this)
 */
export async function signUpAdmin(email: string, password: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) throw error

    // Create admin record in admins table
    const { error: dbError } = await supabaseAdmin
      .from('admins')
      .insert([
        {
          id: data.user.id,
          email: data.user.email,
          is_main_admin: false,
          created_at: new Date().toISOString(),
        },
      ])

    if (dbError) {
      // Delete the auth user if we can't create the admin record
      await supabaseAdmin.auth.admin.deleteUser(data.user.id)
      throw dbError
    }

    return { success: true, userId: data.user.id }
  } catch (error: any) {
    console.error('Error signing up admin:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Authenticate admin with email and password
 */
export async function signInAdmin(email: string, password: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Update last login
    await supabaseAdmin
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id)

    // Create session
    const sessionCookie = await createSessionCookie(data.session.access_token)

    return {
      success: true,
      token: data.session.access_token,
      user: data.user,
      sessionCookie,
    }
  } catch (error: any) {
    console.error('Error signing in admin:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Sign out admin
 */
export async function signOutAdmin() {
  try {
    const { error } = await supabaseAdmin.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Error signing out:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Verify admin token
 */
export async function verifyAdminToken(token: string) {
  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) return null

    // Check if user is in admins table
    const { data: admin } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('id', user.id)
      .single()

    return admin as Admin | null
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}

/**
 * Get admin by ID
 */
export async function getAdmin(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as Admin
  } catch (error) {
    console.error('Error getting admin:', error)
    return null
  }
}

/**
 * Get all admins
 */
export async function getAllAdmins() {
  try {
    const { data, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return []
    return data as Admin[]
  } catch (error) {
    console.error('Error getting admins:', error)
    return []
  }
}

/**
 * Delete admin (only if not main admin)
 */
export async function deleteAdmin(adminId: string) {
  try {
    // Check if admin is main admin
    const admin = await getAdmin(adminId)
    if (admin?.is_main_admin) {
      return { success: false, error: 'Cannot delete main admin' }
    }

    // Delete from admins table
    const { error: dbError } = await supabaseAdmin
      .from('admins')
      .delete()
      .eq('id', adminId)

    if (dbError) throw dbError

    // Delete auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      adminId
    )

    if (authError) throw authError

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting admin:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Create session cookie
 */
async function createSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  return token
}

/**
 * Get session from cookie
 */
export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) return null

  return await verifyAdminToken(token)
}

/**
 * Clear session cookie
 */
export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}
