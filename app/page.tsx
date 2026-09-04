// app/page.tsx — Server Component
import { prisma } from "@/lib/prisma";
import HomeClient from "./components/HomeClient";

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

  return <HomeClient initialCommittees={committees as any} />;
}