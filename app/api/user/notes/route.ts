import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Öğrenci Ders Notlarını Getir
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (videoId) {
      const notes = await prisma.note.findMany({
        where: { userId, videoId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(notes);
    }

    // Profil sayfası için tüm notları video detaylarıyla birlikte çek
    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const videoIds = [...new Set(notes.map((n) => n.videoId))];
    const videos = await prisma.video.findMany({
      where: { id: { in: videoIds } },
      include: {
        lesson: {
          include: {
            committee: true,
          },
        },
      },
    });

    const mappedNotes = notes.map((note) => {
      const v = videos.find((video) => video.id === note.videoId);
      return {
        id: note.id,
        videoId: note.videoId,
        content: note.content,
        timestamp: note.timestamp,
        videoTitle: v?.title || "Ders",
        committeeTitle: v?.lesson.committee.title || "Komite",
        lessonName: v?.lesson.name || "Ders Branşı",
        createdAt: new Date(note.createdAt).toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };
    });

    return NextResponse.json(mappedNotes);
  } catch (error) {
    console.error("Notes GET Hatası:", error);
    return NextResponse.json({ error: "Notlar alınamadı." }, { status: 500 });
  }
}

// Yeni Ders Notu Kaydet
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    const body = await req.json();
    const { videoId, content, timestamp } = body;

    if (!videoId || !content?.trim()) {
      return NextResponse.json({ error: "Not içeriği boş olamaz." }, { status: 400 });
    }

    const newNote = await prisma.note.create({
      data: {
        userId,
        videoId,
        content: content.trim(),
        timestamp: typeof timestamp === "number" ? timestamp : null,
      },
    });

    return NextResponse.json({ success: true, note: newNote });
  } catch (error) {
    console.error("Notes POST Hatası:", error);
    return NextResponse.json({ error: "Not kaydedilemedi." }, { status: 500 });
  }
}

// Not Sil
export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Not ID gereklidir." }, { status: 400 });
    }

    await prisma.note.deleteMany({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notes DELETE Hatası:", error);
    return NextResponse.json({ error: "Not silinemedi." }, { status: 500 });
  }
}
