import { NextRequest, NextResponse } from 'next/server'
import { getAllAdmins, signUpAdmin, getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify admin is logged in
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Brak dostępu' },
        { status: 401 }
      )
    }

    const admins = await getAllAdmins()
    return NextResponse.json({ admins })
  } catch (error: any) {
    console.error('Get admins error:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin is logged in
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Brak dostępu' },
        { status: 401 }
      )
    }

    // Only main admin can create new admins
    if (!session.is_main_admin) {
      return NextResponse.json(
        { error: 'Tylko główny administrator może tworzyć nowe konta' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email i hasło są wymagane' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Hasło musi mieć co najmniej 8 znaków' },
        { status: 400 }
      )
    }

    const result = await signUpAdmin(email, password)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Błąd podczas tworzenia konta' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Administrator został utworzony',
        userId: result.userId,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}
