// app/page.tsx — Server Component
// Komiteler artık sunucu tarafında çekiliyor; kullanıcı sayfayı açtığında
// HTML hazır geliyor, "Veriler Yükleniyor..." ekranı artık yok.
import { prisma } from "@/lib/prisma";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeClient from "./components/HomeClient";

// 60 saniye boyunca önbellekle, arka planda yenile (stale-while-revalidate)
export const revalidate = 60;

export default async function Home() {
  const committees = await prisma.committee.findMany({
    include: {
      lessons: {
        include: {
          videos: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-black flex flex-col justify-between">
      <div className="w-full">
        <Header />
        <main className="w-full pb-20">
          <HomeClient initialCommittees={committees as any} />
        </main>
      </div>
      <Footer />
    </div>
  );
}