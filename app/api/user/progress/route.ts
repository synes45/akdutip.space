// app/api/user/progress/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// ⚠️ Not: Projende Prisma / DB istemcini (örn: lib/db.ts) kurduğunda alt satırı aktifleştirebilirsin:
// import { db } from "@/lib/db";

// 🔍 İlerleme Verisini Getir (GET)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "videoId parametresi zorunludur." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    // DB istemcisi hazır olana kadar geçici dönen yanıt
    return NextResponse.json({
      currentTime: 0,
      duration: 0,
      isCompleted: false,
    });
  } catch (error) {
    console.error("Progress GET Hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

// 💾 İlerlemeyi Kaydet / Güncelle (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoId, currentTime, duration } = body;

    if (!videoId || typeof currentTime !== "number") {
      return NextResponse.json(
        { error: "Gerekli veriler eksik veya hatalı." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const isCompleted = duration > 0 ? currentTime >= duration - 10 : false;

    // DB istemcisi hazır olana kadar geçici dönen yanıt
    return NextResponse.json({
      success: true,
      data: { videoId, currentTime, duration, isCompleted },
    });
  } catch (error) {
    console.error("Progress POST Hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}