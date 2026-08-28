// app/api/admin/courses/reorder/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { lessonId, videoId, direction } = await req.json();

    const videos = await prisma.video.findMany({
      where: { lessonId },
      orderBy: { order: "asc" },
    });

    const currentIndex = videos.findIndex((v) => v.id === videoId);
    if (currentIndex === -1) {
      return NextResponse.json({ error: "Video bulunamadı" }, { status: 404 });
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < videos.length) {
      const currentVideo = videos[currentIndex];
      const targetVideo = videos[targetIndex];

      // Veritabanında iki videonun order alanlarını birbiriyle değiştir
      await prisma.$transaction([
        prisma.video.update({
          where: { id: currentVideo.id },
          data: { order: targetVideo.order },
        }),
        prisma.video.update({
          where: { id: targetVideo.id },
          data: { order: currentVideo.order },
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Sıralama değiştirilemedi" }, { status: 500 });
  }
}