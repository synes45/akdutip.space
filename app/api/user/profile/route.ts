// app/api/user/profile/route.ts
// Profil sayfası için tek bir endpoint — progress, playlist ve notes
// aynı anda paralel olarak çekilir, toplu döndürülür.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    // Tüm sorguları paralel çalıştır
    const [user, progressList, playlistItems, notes] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true, name: true },
      }),
      prisma.progress.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.playlist.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.note.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    // İlgili video ID'lerini topla, tek sorguda çek
    const allVideoIds = [
      ...new Set([
        ...progressList.map((p) => p.videoId),
        ...playlistItems.map((p) => p.videoId),
        ...notes.map((n) => n.videoId),
      ]),
    ];

    const videos = await prisma.video.findMany({
      where: { id: { in: allVideoIds } },
      include: {
        lesson: {
          include: { committee: true },
        },
      },
    });

    const videoMap = new Map(videos.map((v) => [v.id, v]));

    // Progress geçmişi
    const history = progressList
      .map((p) => {
        const v = videoMap.get(p.videoId);
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
      })
      .filter(Boolean);

    // Playlist
    const playlist = playlistItems
      .map((item) => {
        const v = videoMap.get(item.videoId);
        if (!v) return null;
        return {
          id: v.id,
          title: v.title,
          committeeTitle: v.lesson.committee.title,
          duration: "20dk",
        };
      })
      .filter(Boolean);

    // Notlar
    const mappedNotes = notes.map((note) => {
      const v = videoMap.get(note.videoId);
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

    return NextResponse.json(
      { user, history, playlist, notes: mappedNotes },
      {
        headers: {
          // Kişisel veri, önbelleğe alınmasın ama bağlantı hızlandırılsın
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("Profile GET Hatası:", error);
    return NextResponse.json({ error: "Profil yüklenemedi." }, { status: 500 });
  }
}
