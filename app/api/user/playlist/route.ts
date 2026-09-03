import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    // Eğer belirli bir videoId sorgulanıyorsa, listemde olup olmadığını dön
    if (videoId) {
      const exists = await prisma.playlist.findUnique({
        where: {
          userId_videoId: { userId, videoId },
        },
      });
      return NextResponse.json({ inPlaylist: !!exists });
    }

    // Aksi halde tüm listenin detaylarını çek (profil sayfası için)
    const playlistItems = await prisma.playlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const videoIds = playlistItems.map((item) => item.videoId);

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

    // Videoları sıralamayı koruyacak şekilde haritalayalım
    const mappedVideos = playlistItems.map((item) => {
      const v = videos.find((video) => video.id === item.videoId);
      if (!v) return null;
      return {
        id: v.id,
        title: v.title,
        committeeTitle: v.lesson.committee.title,
        duration: "20dk", // Standart gösterim süresi
      };
    }).filter(Boolean);

    return NextResponse.json(mappedVideos);
  } catch (error) {
    console.error("Playlist GET Hatası:", error);
    return NextResponse.json({ error: "Playlist yüklenemedi." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    const body = await req.json();
    const { videoId, action } = body;

    if (!videoId) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    if (action === "add") {
      await prisma.playlist.upsert({
        where: {
          userId_videoId: { userId, videoId },
        },
        create: { userId, videoId },
        update: {},
      });
    } else if (action === "remove") {
      await prisma.playlist.deleteMany({
        where: { userId, videoId },
      });
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("Playlist POST Hatası:", error);
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
