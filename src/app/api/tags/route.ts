import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/tags - Get all tags for the current user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tags = await prisma.tag.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { decks: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return NextResponse.json(tags)
}

// POST /api/tags - Create a new tag
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, color } = await request.json()

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })
  }

  // Check if tag already exists for this user
  const existing = await prisma.tag.findFirst({
    where: {
      name: name.trim(),
      userId: session.user.id
    }
  })

  if (existing) {
    return NextResponse.json({ error: 'Tag already exists' }, { status: 400 })
  }

  const tag = await prisma.tag.create({
    data: {
      name: name.trim(),
      color: color || '#ec4899',
      userId: session.user.id
    }
  })

  return NextResponse.json(tag, { status: 201 })
}

// DELETE /api/tags - Delete a tag (requires tagId in body)
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tagId } = await request.json()

  if (!tagId) {
    return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 })
  }

  // Verify ownership
  const tag = await prisma.tag.findFirst({
    where: {
      id: tagId,
      userId: session.user.id
    }
  })

  if (!tag) {
    return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
  }

  await prisma.tag.delete({
    where: { id: tagId }
  })

  return NextResponse.json({ success: true })
}
