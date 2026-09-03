"use client";

import React from "react";
import { Committee } from "../data/courses";

interface Props {
  committees: Committee[];
  selectedCommitteeId: string;
  onSelect: (committee: Committee) => void;
}

export default function CommitteeCards({ committees, selectedCommitteeId, onSelect }: Props) {
  return (
    <div className="w-full space-y-4 py-4" id="committees">
      {/* Üst Başlık */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
          Komiteler
        </h3>
        <span className="text-xs font-mono text-zinc-400">
          {committees.length} Komite
        </span>
      </div>

      {/* Grid Yapısı */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 w-full">
        {committees.map((committee) => {
          const isSelected = committee.id === selectedCommitteeId;

          return (
            <button
              key={committee.id}
              onClick={() => onSelect(committee)}
              type="button"
              className={`group relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden text-left cursor-pointer transition-all duration-300 focus:outline-none bg-zinc-900 ${
                isSelected
                  ? "opacity-100 scale-[1.02] shadow-xl shadow-black/50"
                  : "opacity-70 hover:opacity-100 active:scale-95"
              }`}
            >
              {/* Arka Plan Görseli */}
              {committee.bgImage ? (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url('${committee.bgImage}')` }}
                />
              ) : (
                <div className="absolute inset-0 bg-zinc-900" />
              )}

              {/* Karartma Maskesi */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 pointer-events-none" />

              {/* Seçili İndikatör Çubuğu (Sol Kenar Vurgusu) */}
              {isSelected && (
                <div className="absolute top-4 left-0 w-1 h-8 bg-amber-400 rounded-r-full z-20 shadow-sm shadow-amber-400/50" />
              )}

              {/* Kart İçi Sol Alt Metin Alanı */}
              <div className="relative z-10 p-4 h-full flex flex-col justify-end gap-1">
                <h4 className={`font-semibold text-xs sm:text-sm leading-tight line-clamp-2 drop-shadow-sm transition-colors duration-200 ${
                  isSelected ? "text-amber-300" : "text-white"
                }`}>
                  {committee.title}
                </h4>
                {committee.subtitle && (
                  <p className="text-[11px] sm:text-xs text-zinc-300 font-normal leading-snug line-clamp-2 drop-shadow-sm">
                    {committee.subtitle}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}