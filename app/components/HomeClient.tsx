"use client";

import { useState } from "react";
import Header from "./Header";
import HeroBanner from "./HeroBanner";
import CommitteeCards from "./CommitteeCards";
import VideoGrid from "./VideoGrid";
import Footer from "./Footer";
import { Committee } from "../data/courses";

interface Props {
  initialCommittees: Committee[];
}

export default function HomeClient({ initialCommittees }: Props) {
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(
    initialCommittees[0] || null
  );
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);

  const currentCommittee = selectedCommittee || initialCommittees[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-black flex flex-col justify-between">
      <div className="w-full">
        <Header />

        <main className="w-full pb-20">
          <HeroBanner selectedCommittee={currentCommittee} />

          <div className="w-full px-4 sm:px-8 space-y-12 mt-8">
            {initialCommittees.length === 0 ? (
              <div className="p-10 text-center text-zinc-400 border border-dashed border-zinc-800 rounded-2xl">
                Henüz veritabanına komite eklenmemiş. Admin panelinden ekleyebilirsin.
              </div>
            ) : (
              <>
                <CommitteeCards
                  committees={initialCommittees}
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
