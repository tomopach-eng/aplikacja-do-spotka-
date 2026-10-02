import { NextRequest, NextResponse } from 'next/server'
import { deleteAdmin, getSession } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin is logged in
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Brak dostępu' },
        { status: 401 }
      )
    }

    // Only main admin can delete admins
    if (!session.is_main_admin) {
      return NextResponse.json(
        { error: 'Tylko główny administrator może usuwać konta' },
        { status: 403 }
      )
    }

    const adminId = params.id

    // Prevent deleting self
    if (adminId === session.id) {
      return NextResponse.json(
        { error: 'Nie możesz usunąć swojego własnego konta' },
        { status: 400 }
      )
    }

    const result = await deleteAdmin(adminId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Błąd podczas usuwania administratora' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Administrator został usunięty',
    })
  } catch (error: any) {
    console.error('Delete admin error:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}
