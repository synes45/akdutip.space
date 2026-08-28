import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Bütün Komiteleri, Dersleri ve Videoları (Sıralı) Getir
export async function GET() {
  try {
    const committees = await prisma.committee.findMany({
      include: {
        lessons: {
          include: {
            videos: {
              orderBy: { order: "asc" }, // Videoları sıra numarasına göre getir
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(committees);
  } catch (error) {
    return NextResponse.json({ error: "Veri çekilemedi" }, { status: 500 });
  }
}

// Ekleme İşlemleri (Komite, Ders veya Video)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, title, subtitle, bgImage, committeeId, lessonName, lessonId, videoTitle, telegramId, pdfUrl } = body;

    // 1. KOMİTE EKLE
    if (type === "committee") {
      const newCommittee = await prisma.committee.create({
        data: { title, subtitle, bgImage },
      });
      return NextResponse.json(newCommittee);
    }

    // 2. DERS EKLE
    if (type === "lesson") {
      const newLesson = await prisma.lesson.create({
        data: { name: lessonName, committeeId },
      });
      return NextResponse.json(newLesson);
    }

    // 3. VİDEO & PDF EKLE
    if (type === "video") {
      // Dersetki son video sırasını bul
      const lastVideo = await prisma.video.findFirst({
        where: { lessonId },
        orderBy: { order: "desc" },
      });
      const nextOrder = lastVideo ? lastVideo.order + 1 : 0;

      const newVideo = await prisma.video.create({
        data: {
          title: videoTitle,
          telegramId,
          pdfUrl: pdfUrl || null,
          lessonId,
          order: nextOrder,
        },
      });
      return NextResponse.json(newVideo);
    }

    return NextResponse.json({ error: "Geçersiz tür" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}

// Güncelleme İşlemi (Videolar İçin Edit)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { videoId, videoTitle, telegramId, pdfUrl } = body;

    if (!videoId) {
      return NextResponse.json({ error: "Video ID gerekli" }, { status: 400 });
    }

    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        title: videoTitle,
        telegramId,
        pdfUrl: pdfUrl || null,
      },
    });

    return NextResponse.json(updatedVideo);
  } catch (error) {
    return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
  }
}

// Silme İşlemleri
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const committeeId = searchParams.get("committeeId");
    const lessonId = searchParams.get("lessonId");
    const videoId = searchParams.get("videoId");

    if (committeeId) {
      await prisma.committee.delete({ where: { id: committeeId } });
    } else if (lessonId) {
      await prisma.lesson.delete({ where: { id: lessonId } });
    } else if (videoId) {
      await prisma.video.delete({ where: { id: videoId } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}