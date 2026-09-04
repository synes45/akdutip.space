import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — Tüm raporları video + kullanıcı bilgisiyle listele
export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Raporlardaki video ve kullanıcı ID'lerini topla
    const videoIds = [...new Set(reports.map((r) => r.videoId))];
    const userIds = [...new Set(reports.map((r) => r.userId).filter(Boolean))] as string[];

    const [videos, users] = await Promise.all([
      prisma.video.findMany({
        where: { id: { in: videoIds } },
        include: { lesson: { include: { committee: true } } },
      }),
      prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      }),
    ]);

    const videoMap = new Map(videos.map((v) => [v.id, v]));
    const userMap = new Map(users.map((u) => [u.id, u]));

    const enriched = reports.map((r) => {
      const video = videoMap.get(r.videoId);
      const user = r.userId ? userMap.get(r.userId) : null;
      return {
        id: r.id,
        note: r.note,
        status: r.status,
        createdAt: r.createdAt,
        video: video
          ? {
              id: video.id,
              title: video.title,
              committeeTitle: video.lesson.committee.title,
              lessonName: video.lesson.name,
            }
          : { id: r.videoId, title: "Silinmiş Video", committeeTitle: "", lessonName: "" },
        reporter: user
          ? { id: user.id, name: user.name, email: user.email }
          : { id: null, name: "Anonim", email: "" },
      };
    });

    return NextResponse.json({ reports: enriched });
  } catch (error) {
    console.error("Raporlar çekilirken hata:", error);
    return NextResponse.json({ error: "Raporlar alınamadı." }, { status: 500 });
  }
}

// PATCH — Rapor durumunu güncelle (PENDING → RESOLVED)
export async function PATCH(req: NextRequest) {
  try {
    const { reportId, status } = await req.json();
    if (!reportId || !["PENDING", "RESOLVED"].includes(status)) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }
    const updated = await prisma.report.update({ where: { id: reportId }, data: { status } });
    return NextResponse.json({ success: true, report: updated });
  } catch (error) {
    console.error("Rapor güncellenirken hata:", error);
    return NextResponse.json({ error: "Rapor güncellenemedi." }, { status: 500 });
  }
}

// DELETE — Raporu sil
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("reportId");
    if (!reportId) return NextResponse.json({ error: "reportId gerekli." }, { status: 400 });
    await prisma.report.delete({ where: { id: reportId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Rapor silinirken hata:", error);
    return NextResponse.json({ error: "Rapor silinemedi." }, { status: 500 });
  }
}
