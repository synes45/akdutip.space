// app/akis/components/CommitteeProgress.tsx
"use client";

import { MockCommittee, countCommitteeVideos, countCommitteeCompleted } from "../lib/mockData";

interface Props {
  committee: MockCommittee | null;
  completedIds: Set<string>;
}

export default function CommitteeProgress({ committee, completedIds }: Props) {
  if (!committee) return null;

  const total = countCommitteeVideos(committee);
  const completed = countCommitteeCompleted(committee, completedIds);
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-neutral-300 truncate">
            {committee.title.split(" — ")[0]}
          </span>
          <span
            className={`text-xs font-black tabular-nums shrink-0 ${
              pct === 100 ? "text-emerald-400" : "text-yellow-400"
            }`}
          >
            {pct}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-neutral-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct === 100
                ? "bg-emerald-400"
                : "bg-gradient-to-r from-yellow-500 to-amber-400"
            }`}
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        <p className="text-[10px] text-neutral-500 font-medium">
          {completed} / {total} video tamamlandı
        </p>
      </div>
    </div>
  );
}
