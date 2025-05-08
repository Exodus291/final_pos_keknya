import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function PUT(request, { params }) {
    try {
        const body = await request.json()
        const product = await prisma.product.update({
            where: { id: parseInt(params.id) },
            data: {
                name: body.name,
                price: body.price,
            },
        })
        return NextResponse.json(product)
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        await prisma.product.delete({
            where: { id: parseInt(params.id) },
        })
        return NextResponse.json({ message: 'Product deleted' })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
