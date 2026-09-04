// app/dersler/page.tsx — Server Component
// Veri sunucu tarafında çekiliyor; kullanıcı sayfayı açtığında
// tüm dersler HTML içinde hazır geliyor, loading spinner yok.
import { prisma } from "@/lib/prisma";
import DerslerClient from "../components/DerslerClient";

export const revalidate = 60;

export default async function DerslerPage() {
  const committees = await prisma.committee.findMany({
    include: {
      lessons: {
        include: {
          videos: { orderBy: { order: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const committeeList: { id: string; title: string }[] = [];
  const lessonSet = new Set<string>();
  const videos: {
    id: string;
    title: string;
    telegramId: string;
    pdfUrl?: string | null;
    order: number;
    lessonName: string;
    committeeTitle: string;
    committeeId: string;
  }[] = [];

  for (const committee of committees) {
    committeeList.push({ id: committee.id, title: committee.title });
    for (const lesson of committee.lessons ?? []) {
      lessonSet.add(lesson.name);
      for (const video of lesson.videos ?? []) {
        videos.push({
          id: video.id,
          title: video.title,
          telegramId: video.telegramId,
          pdfUrl: video.pdfUrl,
          order: video.order,
          lessonName: lesson.name,
          committeeTitle: committee.title,
          committeeId: committee.id,
        });
      }
    }
  }

  return (
    <DerslerClient
      initialVideos={videos}
      initialCommittees={committeeList}
      initialLessons={Array.from(lessonSet)}
    />
  );
}