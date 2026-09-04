import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — Kullanıcıları istatistikleriyle birlikte listele
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
    });

    const userIds = users.map((u) => u.id);

    // Tüm istatistikleri paralel çek
    const [progressCounts, noteCounts, playlistCounts] = await Promise.all([
      prisma.progress.groupBy({ by: ["userId"], where: { userId: { in: userIds } }, _count: { id: true } }),
      prisma.note.groupBy({ by: ["userId"], where: { userId: { in: userIds } }, _count: { id: true } }),
      prisma.playlist.groupBy({ by: ["userId"], where: { userId: { in: userIds } }, _count: { id: true } }),
    ]);

    const progressMap = new Map(progressCounts.map((p) => [p.userId, p._count.id]));
    const noteMap = new Map(noteCounts.map((n) => [n.userId, n._count.id]));
    const playlistMap = new Map(playlistCounts.map((pl) => [pl.userId, pl._count.id]));

    const enriched = users.map((u) => ({
      ...u,
      stats: {
        watchCount: progressMap.get(u.id) ?? 0,
        noteCount: noteMap.get(u.id) ?? 0,
        playlistCount: playlistMap.get(u.id) ?? 0,
      },
    }));

    return NextResponse.json({ users: enriched });
  } catch (error) {
    console.error("Üyeler çekilirken hata:", error);
    return NextResponse.json({ error: "Üyeler getirilemedi." }, { status: 500 });
  }
}

// PATCH — Rol değiştir
export async function PATCH(req: NextRequest) {
  try {
    const { userId, role } = await req.json();
    if (!userId || !["STUDENT", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }
    const updated = await prisma.user.update({ where: { id: userId }, data: { role } });
    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Rol güncellenirken hata:", error);
    return NextResponse.json({ error: "Rol güncellenemedi." }, { status: 500 });
  }
}

// DELETE — Kullanıcıyı ve tüm ilgili kayıtları sil
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId gerekli." }, { status: 400 });

    // İlgili kayıtları sil (cascade yok, manuel temizlik)
    await Promise.all([
      prisma.progress.deleteMany({ where: { userId } }),
      prisma.note.deleteMany({ where: { userId } }),
      prisma.playlist.deleteMany({ where: { userId } }),
    ]);
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Kullanıcı silinirken hata:", error);
    return NextResponse.json({ error: "Kullanıcı silinemedi." }, { status: 500 });
  }
}