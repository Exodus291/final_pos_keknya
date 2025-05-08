import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const products = await prisma.product.findMany()
        return NextResponse.json(products)
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const body = await request.json()
        const product = await prisma.product.create({
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
