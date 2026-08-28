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

  // Veritabanından (API üzerinden) komiteleri ve dersleri çekiyoruz
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
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <div>
        <Header />

        <main className="pb-20">
          <HeroBanner />

          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 space-y-12 pt-6 relative z-30">
            {loading ? (
              <div className="p-10 text-center text-yellow-400 font-bold">Veriler Yükleniyor...</div>
            ) : committees.length === 0 ? (
              <div className="p-10 text-center text-neutral-400 border border-dashed border-neutral-800 rounded-2xl">
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

      {/* Modern Footer */}
      <Footer />
    </div>
  );
}