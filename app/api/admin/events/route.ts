import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TÜM ETKİNLİKLERİ GETİR
export async function GET() {
  try {
    const events = await prisma.examEvent.findMany({
      orderBy: { date: "asc" },
    });
    return NextResponse.json(events, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Etkinlikler alınırken hata:", error);
    return NextResponse.json({ error: "Etkinlikler alınamadı" }, { status: 500 });
  }
}

// YENİ ETKİNLİK / SINAV EKLE
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, committee, date, type, time, location } = body;

    if (!title || !committee || !date || !type) {
      return NextResponse.json({ error: "Eksik alanlar var" }, { status: 400 });
    }

    const newEvent = await prisma.examEvent.create({
      data: {
        title,
        committee,
        date,
        type,
        time: time || null,
        location: location || null,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Ekleme hatası:", error);
    return NextResponse.json({ error: "Ekleme başarısız" }, { status: 500 });
  }
}

// ETKİNLİK SİL
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    await prisma.examEvent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Silme hatası:", error);
    return NextResponse.json({ error: "Silme başarısız" }, { status: 500 });
  }
}