// app/ders/[id]/page.tsx — Server Component
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DersClient from "@/app/components/DersClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: PageProps) {
  const { id } = await params;

  // Videoyu komite ve ders bilgisiyle birlikte tek sorguda çek
  let video = await prisma.video.findUnique({
    where: { id },
    include: {
      lesson: {
        include: {
          committee: true,
          videos: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, order: true },
          },
        },
      },
    },
  });

  // Eğer id ile bulunamadıysa telegramId olarak da ara
  if (!video) {
    video = await prisma.video.findFirst({
      where: { telegramId: id },
      include: {
        lesson: {
          include: {
            committee: true,
            videos: {
              orderBy: { order: "asc" },
              select: { id: true, title: true, order: true },
            },
          },
        },
      },
    });
  }

  if (!video) {
    notFound();
  }

  // Önceki ve sonraki videoları belirle
  const siblingVideos = video.lesson.videos || [];
  const currentIndex = siblingVideos.findIndex((v) => v.id === id);
  const prevVideo = currentIndex > 0 ? siblingVideos[currentIndex - 1] : null;
  const nextVideo =
    currentIndex < siblingVideos.length - 1 ? siblingVideos[currentIndex + 1] : null;

  // Kullanıcı oturumu kontrol et
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_session")?.value;

  let initialUser = null;
  let initialSavedTime: number | null = null;
  let initialIsCompleted = false;
  let initialInPlaylist = false;
  let initialNotes: {
    id: string;
    content: string;
    timestamp: number | null;
    createdAt: string;
  }[] = [];

  if (userId) {
    const [user, progress, playlistItem, notes] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true, name: true },
      }),
      prisma.progress.findUnique({
        where: { userId_videoId: { userId, videoId: id } },
      }),
      prisma.playlist.findUnique({
        where: { userId_videoId: { userId, videoId: id } },
      }),
      prisma.note.findMany({
        where: { userId, videoId: id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (user) {
      initialUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name ?? undefined,
      };
    }

    if (progress) {
      initialSavedTime = progress.currentTime > 0 ? progress.currentTime : null;
      initialIsCompleted = progress.isCompleted;
    }

    if (playlistItem) {
      initialInPlaylist = true;
    }

    if (notes) {
      initialNotes = notes.map((n) => ({
        id: n.id,
        content: n.content,
        timestamp: n.timestamp,
        createdAt: new Date(n.createdAt).toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      }));
    }
  }

  return (
    <DersClient
      video={{
        id: video.id,
        title: video.title,
        telegramId: video.telegramId,
        pdfUrl: video.pdfUrl,
        lessonName: video.lesson.name,
        committeeTitle: video.lesson.committee.title,
      }}
      prevVideo={prevVideo}
      nextVideo={nextVideo}
      initialUser={initialUser}
      initialSavedTime={initialSavedTime}
      initialIsCompleted={initialIsCompleted}
      initialInPlaylist={initialInPlaylist}
      initialNotes={initialNotes}
    />
  );
}
