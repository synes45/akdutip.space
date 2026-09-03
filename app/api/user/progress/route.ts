import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// 🔍 İlerleme Verisini Getir (GET)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    // 1. Belirli bir videonun ilerlemesini getir (Ders izleme sayfası için)
    if (videoId) {
      const progress = await prisma.progress.findUnique({
        where: {
          userId_videoId: { userId, videoId },
        },
      });

      if (!progress) {
        return NextResponse.json({
          currentTime: 0,
          duration: 0,
          isCompleted: false,
        });
      }

      return NextResponse.json({
        currentTime: progress.currentTime,
        duration: progress.duration,
        isCompleted: progress.isCompleted,
      });
    }

    // 2. Kullanıcının tüm izleme geçmişini getir (Profil sayfası için)
    const progressList = await prisma.progress.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    const videoIds = progressList.map((p) => p.videoId);

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

    const mappedHistory = progressList.map((p) => {
      const v = videos.find((video) => video.id === p.videoId);
      if (!v) return null;

      const dur = p.duration > 0 ? p.duration : 1200;
      const percent = Math.min(100, Math.max(0, Math.round((p.currentTime / dur) * 100)));

      return {
        videoId: p.videoId,
        videoTitle: v.title,
        committeeTitle: v.lesson.committee.title,
        lessonName: v.lesson.name,
        currentTime: p.currentTime,
        duration: p.duration,
        percent,
        isCompleted: p.isCompleted || percent >= 90,
        updatedAt: new Date(p.updatedAt).toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    }).filter(Boolean);

    return NextResponse.json(mappedHistory);
  } catch (error) {
    console.error("Progress GET Hatası:", error);
    return NextResponse.json(
      { error: "İlerleme bilgileri alınamadı." },
      { status: 500 }
    );
  }
}

// 💾 İlerlemeyi Kaydet / Güncelle (POST)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const body = await request.json();
    const { videoId, currentTime, duration, isCompleted: manualCompleted } = body;

    if (!videoId || typeof currentTime !== "number") {
      return NextResponse.json(
        { error: "Gerekli veriler eksik veya hatalı." },
        { status: 400 }
      );
    }

    const safeDuration = typeof duration === "number" && duration > 0 ? duration : 0;
    const completed = manualCompleted ?? (safeDuration > 0 && currentTime >= safeDuration * 0.9);

    const savedProgress = await prisma.progress.upsert({
      where: {
        userId_videoId: { userId, videoId },
      },
      create: {
        userId,
        videoId,
        currentTime,
        duration: safeDuration,
        isCompleted: completed,
      },
      update: {
        currentTime,
        duration: safeDuration,
        isCompleted: completed,
      },
    });

    return NextResponse.json({
      success: true,
      data: savedProgress,
    });
  } catch (error) {
    console.error("Progress POST Hatası:", error);
    return NextResponse.json(
      { error: "İlerleme kaydedilemedi." },
      { status: 500 }
    );
  }
}

// 🗑️ İzleme Geçmişini Temizle (DELETE)
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (videoId) {
      await prisma.progress.deleteMany({
        where: { userId, videoId },
      });
    } else {
      await prisma.progress.deleteMany({
        where: { userId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Progress DELETE Hatası:", error);
    return NextResponse.json(
      { error: "İlerleme geçmişi silinemedi." },
      { status: 500 }
    );
  }
}