import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    const body = await req.json();
    const { videoId, note } = body;

    if (!videoId || !note) {
      return NextResponse.json({ error: "Video ID ve açıklama gereklidir." }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        videoId,
        userId: userId || null,
        note: note.trim(),
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Report POST Hatası:", error);
    return NextResponse.json({ error: "Bildirim iletilemedi." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reports);
  } catch (error) {
    console.error("Report GET Hatası:", error);
    return NextResponse.json({ error: "Bildirimler alınamadı." }, { status: 500 });
  }
}
