"use client";

import { Committee } from "../data/courses"; // <- Burayı güncelledik

interface Props {
  committees: Committee[];
  selectedCommitteeId: string;
  onSelect: (committee: Committee) => void;
}

export default function CommitteeCards({ committees, selectedCommitteeId, onSelect }: Props) {
  return (
    <div className="space-y-4">
      {/* Üst Başlık */}
      <div className="flex items-center gap-2.5">
        <div className="h-5 w-1 bg-yellow-500 rounded-full" />
        <h3 className="text-lg font-bold tracking-tight text-white">Komiteler</h3>
      </div>

      {/* Grid Yapısı */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 w-full">
        {committees.map((committee) => {
          const isSelected = committee.id === selectedCommitteeId;

          return (
            <div
              key={committee.id}
              onClick={() => onSelect(committee)}
              className={`group relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 bg-neutral-900 ${
                isSelected ? "opacity-100 ring-1 ring-yellow-500/50" : "opacity-60 hover:opacity-100"
              }`}
            >
              {/* 1. Arka Plan Görseli */}
              {committee.bgImage && (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${committee.bgImage}')` }}
                />
              )}

              {/* 2. Arka Plan Ince Grid Deseni */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px'
                }}
              />

              {/* 3. Okunabilirlik İçin Karartma Maskesi */}
              <div
                className={`absolute inset-0 transition-colors duration-300 ${
                  isSelected
                    ? "bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent"
                    : "bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-black/30 group-hover:via-neutral-950/40"
                }`}
              />

              {/* 4. Kart İçi İçerik */}
              <div className="relative z-10 p-5 h-full flex flex-col justify-end">
                <div className="space-y-1.5">
                  <span
                    className={`text-xs font-black tracking-wider uppercase transition-colors block ${
                      isSelected ? "text-yellow-400" : "text-yellow-400/80 group-hover:text-yellow-400"
                    }`}
                  >
                    {committee.title}
                  </span>

                  <h4 className="font-extrabold text-sm lg:text-base text-white tracking-tight leading-snug line-clamp-2">
                    {committee.subtitle}
                  </h4>
                </div>
              </div>

              {/* Seçili Nokta */}
              {isSelected && (
                <div className="absolute top-4 right-4 z-10 w-3 h-3 rounded-full bg-yellow-400 shadow-md shadow-yellow-500/50" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}