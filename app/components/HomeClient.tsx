"use client";

import { useState } from "react";
import HeroBanner from "./HeroBanner";
import CommitteeCards from "./CommitteeCards";
import VideoGrid from "./VideoGrid";
import { Committee } from "../data/courses";

interface Props {
  initialCommittees: Committee[];
}

export default function HomeClient({ initialCommittees }: Props) {
  const [committees] = useState<Committee[]>(initialCommittees);
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(
    initialCommittees[0] ?? null
  );
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);

  const currentCommittee = selectedCommittee || committees[0];

  if (committees.length === 0) {
    return (
      <div className="p-10 text-center text-zinc-400 border border-dashed border-zinc-800 rounded-2xl">
        Henüz veritabanına komite eklenmemiş. Admin panelinden ekleyebilirsin.
      </div>
    );
  }

  return (
    <>
      <HeroBanner selectedCommittee={currentCommittee} />

      <div className="w-full px-4 sm:px-8 space-y-12 mt-8">
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
      </div>
    </>
  );
}
