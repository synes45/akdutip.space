// app/akis/lib/mockData.ts
// Mock data for the streaming dashboard.
// Mirrors the Committee > Lesson > Video hierarchy from the real API.
// Replace or augment with live API data in StreamingDashboard.tsx.

export interface MockVideo {
  id: string;
  title: string;
  professor: string;
  telegramId: string;
  pdfUrl?: string | null;
  duration: string; // e.g. "48:20"
  order: number;
}

export interface MockLesson {
  id: string;
  name: string;
  videos: MockVideo[];
}

export interface MockCommittee {
  id: string;
  title: string;
  subtitle: string;
  lessons: MockLesson[];
}

export interface MockDonem {
  id: string;
  name: string; // e.g. "Dönem 1"
  committees: MockCommittee[];
}

export const MOCK_DATA: MockDonem[] = [
  {
    id: "donem-1",
    name: "Dönem 1",
    committees: [
      {
        id: "k1",
        title: "Komite 1 — Hücre Biyolojisi",
        subtitle: "Temel Bilimler",
        lessons: [
          {
            id: "k1-anatomi",
            name: "Anatomi",
            videos: [
              {
                id: "k1-anat-1",
                title: "Genel Anatomi Terminolojisi ve Vücut Bölümleri",
                professor: "Prof. Dr. Ayşe Kaya",
                telegramId: "1001",
                pdfUrl: "/slides/k1-anat-1.pdf",
                duration: "52:14",
                order: 1,
              },
              {
                id: "k1-anat-2",
                title: "Lokomotor Sistem — Kemikler ve Eklemler",
                professor: "Prof. Dr. Ayşe Kaya",
                telegramId: "1002",
                pdfUrl: "/slides/k1-anat-2.pdf",
                duration: "1:04:38",
                order: 2,
              },
              {
                id: "k1-anat-3",
                title: "Kas Sistemi — Giriş ve Sınıflandırma",
                professor: "Doç. Dr. Murat Demir",
                telegramId: "1003",
                pdfUrl: null,
                duration: "44:05",
                order: 3,
              },
            ],
          },
          {
            id: "k1-histoloji",
            name: "Histoloji",
            videos: [
              {
                id: "k1-hist-1",
                title: "Histoloji'ye Giriş — Mikroskopi Teknikleri",
                professor: "Prof. Dr. Leyla Öztürk",
                telegramId: "1004",
                pdfUrl: "/slides/k1-hist-1.pdf",
                duration: "38:50",
                order: 1,
              },
              {
                id: "k1-hist-2",
                title: "Epitel Doku — Sınıflandırma ve Fonksiyon",
                professor: "Prof. Dr. Leyla Öztürk",
                telegramId: "1005",
                pdfUrl: "/slides/k1-hist-2.pdf",
                duration: "46:22",
                order: 2,
              },
              {
                id: "k1-hist-3",
                title: "Bağ Dokusu — Fibriler ve Hücresel Bileşenler",
                professor: "Prof. Dr. Leyla Öztürk",
                telegramId: "1006",
                pdfUrl: null,
                duration: "55:17",
                order: 3,
              },
            ],
          },
          {
            id: "k1-biyokimya",
            name: "Biyokimya",
            videos: [
              {
                id: "k1-bio-1",
                title: "Amino Asitler ve Proteinlerin Yapısı",
                professor: "Prof. Dr. Serkan Yılmaz",
                telegramId: "1007",
                pdfUrl: "/slides/k1-bio-1.pdf",
                duration: "1:02:44",
                order: 1,
              },
              {
                id: "k1-bio-2",
                title: "Enzim Kinetiği — Michaelis-Menten",
                professor: "Prof. Dr. Serkan Yılmaz",
                telegramId: "1008",
                pdfUrl: "/slides/k1-bio-2.pdf",
                duration: "58:09",
                order: 2,
              },
            ],
          },
        ],
      },
      {
        id: "k2",
        title: "Komite 2 — Sinir Sistemi",
        subtitle: "Temel Bilimler",
        lessons: [
          {
            id: "k2-anatomi",
            name: "Anatomi",
            videos: [
              {
                id: "k2-anat-1",
                title: "Merkezi Sinir Sistemi — Beyin Anatomisi",
                professor: "Prof. Dr. Ahmet Çelik",
                telegramId: "2001",
                pdfUrl: "/slides/k2-anat-1.pdf",
                duration: "1:14:30",
                order: 1,
              },
              {
                id: "k2-anat-2",
                title: "Spinal Kord ve Spinal Sinirler",
                professor: "Prof. Dr. Ahmet Çelik",
                telegramId: "2002",
                pdfUrl: "/slides/k2-anat-2.pdf",
                duration: "49:55",
                order: 2,
              },
            ],
          },
          {
            id: "k2-fizyoloji",
            name: "Fizyoloji",
            videos: [
              {
                id: "k2-fiz-1",
                title: "Aksiyon Potansiyeli ve Sinir İletimi",
                professor: "Prof. Dr. Fatma Arslan",
                telegramId: "2003",
                pdfUrl: "/slides/k2-fiz-1.pdf",
                duration: "1:08:22",
                order: 1,
              },
              {
                id: "k2-fiz-2",
                title: "Sinaptik İletim — Nörotransmitterler",
                professor: "Prof. Dr. Fatma Arslan",
                telegramId: "2004",
                pdfUrl: "/slides/k2-fiz-2.pdf",
                duration: "53:40",
                order: 2,
              },
              {
                id: "k2-fiz-3",
                title: "Duyu Fizyolojisi — Somatosensöriyal Sistem",
                professor: "Prof. Dr. Fatma Arslan",
                telegramId: "2005",
                pdfUrl: null,
                duration: "1:00:15",
                order: 3,
              },
            ],
          },
          {
            id: "k2-noropatoloji",
            name: "Nöropatoloji",
            videos: [
              {
                id: "k2-np-1",
                title: "Nöronal Hasar Mekanizmaları",
                professor: "Doç. Dr. Kemal Şahin",
                telegramId: "2006",
                pdfUrl: "/slides/k2-np-1.pdf",
                duration: "42:18",
                order: 1,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "donem-2",
    name: "Dönem 2",
    committees: [
      {
        id: "k3",
        title: "Komite 3 — Kardiyovasküler Sistem",
        subtitle: "Klinik Bilimler",
        lessons: [
          {
            id: "k3-anatomi",
            name: "Anatomi",
            videos: [
              {
                id: "k3-anat-1",
                title: "Kalp Anatomisi — Odacıklar ve Kapakçıklar",
                professor: "Prof. Dr. Zeynep Koç",
                telegramId: "3001",
                pdfUrl: "/slides/k3-anat-1.pdf",
                duration: "1:22:10",
                order: 1,
              },
              {
                id: "k3-anat-2",
                title: "Koroner Arterler ve Venöz Drenaj",
                professor: "Prof. Dr. Zeynep Koç",
                telegramId: "3002",
                pdfUrl: "/slides/k3-anat-2.pdf",
                duration: "56:48",
                order: 2,
              },
            ],
          },
          {
            id: "k3-fizyoloji",
            name: "Fizyoloji",
            videos: [
              {
                id: "k3-fiz-1",
                title: "Kardiyak Siklus ve Basınç-Hacim İlişkileri",
                professor: "Prof. Dr. Hasan Polat",
                telegramId: "3003",
                pdfUrl: "/slides/k3-fiz-1.pdf",
                duration: "1:18:05",
                order: 1,
              },
              {
                id: "k3-fiz-2",
                title: "Frank-Starling Kanunu ve Kalp Debisi",
                professor: "Prof. Dr. Hasan Polat",
                telegramId: "3004",
                pdfUrl: null,
                duration: "47:30",
                order: 2,
              },
            ],
          },
          {
            id: "k3-farmakoloji",
            name: "Farmakoloji",
            videos: [
              {
                id: "k3-farm-1",
                title: "Antihipertansif İlaçlar — ACE İnhibitörleri",
                professor: "Doç. Dr. Selin Aydın",
                telegramId: "3005",
                pdfUrl: "/slides/k3-farm-1.pdf",
                duration: "1:05:22",
                order: 1,
              },
              {
                id: "k3-farm-2",
                title: "Beta Blokerler ve Kalsiyum Kanal Blokerleri",
                professor: "Doç. Dr. Selin Aydın",
                telegramId: "3006",
                pdfUrl: "/slides/k3-farm-2.pdf",
                duration: "58:55",
                order: 2,
              },
              {
                id: "k3-farm-3",
                title: "Antiaritmik İlaçlar — Sınıflandırma",
                professor: "Doç. Dr. Selin Aydın",
                telegramId: "3007",
                pdfUrl: null,
                duration: "51:40",
                order: 3,
              },
            ],
          },
        ],
      },
      {
        id: "k4",
        title: "Komite 4 — Solunum Sistemi",
        subtitle: "Klinik Bilimler",
        lessons: [
          {
            id: "k4-anatomi",
            name: "Anatomi",
            videos: [
              {
                id: "k4-anat-1",
                title: "Akciğer Anatomisi ve Bronş Ağacı",
                professor: "Prof. Dr. Burcu Yıldız",
                telegramId: "4001",
                pdfUrl: "/slides/k4-anat-1.pdf",
                duration: "1:10:44",
                order: 1,
              },
            ],
          },
          {
            id: "k4-fizyoloji",
            name: "Fizyoloji",
            videos: [
              {
                id: "k4-fiz-1",
                title: "Pulmoner Ventilasyon — Hacimler ve Kapasiteler",
                professor: "Prof. Dr. Emre Güneş",
                telegramId: "4002",
                pdfUrl: "/slides/k4-fiz-1.pdf",
                duration: "1:03:18",
                order: 1,
              },
              {
                id: "k4-fiz-2",
                title: "Gaz Değişimi — O₂ ve CO₂ Taşınması",
                professor: "Prof. Dr. Emre Güneş",
                telegramId: "4003",
                pdfUrl: "/slides/k4-fiz-2.pdf",
                duration: "55:00",
                order: 2,
              },
            ],
          },
        ],
      },
    ],
  },
];

/** Flatten all videos across all dönem/komite/lesson for search */
export interface FlatVideo {
  id: string;
  title: string;
  professor: string;
  telegramId: string;
  pdfUrl?: string | null;
  duration: string;
  order: number;
  lessonId: string;
  lessonName: string;
  committeeId: string;
  committeeTitle: string;
  donemId: string;
  donemName: string;
}

export function flattenVideos(data: MockDonem[]): FlatVideo[] {
  const result: FlatVideo[] = [];
  for (const donem of data) {
    for (const committee of donem.committees) {
      for (const lesson of committee.lessons) {
        for (const video of lesson.videos) {
          result.push({
            ...video,
            lessonId: lesson.id,
            lessonName: lesson.name,
            committeeId: committee.id,
            committeeTitle: committee.title,
            donemId: donem.id,
            donemName: donem.name,
          });
        }
      }
    }
  }
  return result;
}

/** Count total videos in a committee */
export function countCommitteeVideos(committee: MockCommittee): number {
  return committee.lessons.reduce((acc, l) => acc + l.videos.length, 0);
}

/** Count completed videos in a committee given a set of completed IDs */
export function countCommitteeCompleted(
  committee: MockCommittee,
  completedIds: Set<string>
): number {
  return committee.lessons.reduce(
    (acc, l) => acc + l.videos.filter((v) => completedIds.has(v.id)).length,
    0
  );
}
