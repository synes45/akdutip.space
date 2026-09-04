"use client";

import { useState, useEffect } from "react";
import Header from "./components/Header";
import HeroBanner from "./components/HeroBanner";
import CommitteeCards from "./components/CommitteeCards";
import VideoGrid from "./components/VideoGrid";
import Footer from "./components/Footer";
import { Committee } from "./data/courses";

export default function Home() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommittees() {
      try {
        const res = await fetch("/api/admin/courses");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCommittees(data);
          setSelectedCommittee(data[0]);
        }
      } catch (err) {
        console.error("Komiteler yüklenirken hata oluştu:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCommittees();
  }, []);

  const currentCommittee = selectedCommittee || committees[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-black flex flex-col justify-between">
      <div className="w-full">
        <Header />

        <main className="w-full pb-20">
          {/* Seçili komiteyi HeroBanner'a aktardık */}
          <HeroBanner selectedCommittee={currentCommittee} />

          {/* max-w-7xl kaldırıldı, genişletilmiş padding (px-4 sm:px-8) ile uçlara yanaştırıldı */}
          <div className="w-full px-4 sm:px-8 space-y-12 mt-8">
            {loading ? (
              <div className="p-10 text-center text-amber-400 font-bold">Veriler Yükleniyor...</div>
            ) : committees.length === 0 ? (
              <div className="p-10 text-center text-zinc-400 border border-dashed border-zinc-800 rounded-2xl">
                Henüz veritabanına komite eklenmemiş. Admin panelinden ekleyebilirsin.
              </div>
            ) : (
              <>
                <CommitteeCards
                  committees={committees}
                  selectedCommitteeId={currentCommittee?.id}
                  onSelect={(committee) => {
                    setSelectedCommittee(committee);
                    setSelectedLesson(null);
                  }}
                />

                {currentCommittee && (
                  <VideoGrid
                    selectedCommittee={currentCommittee}
                    selectedLesson={selectedLesson}
                    onSelectLesson={setSelectedLesson}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}