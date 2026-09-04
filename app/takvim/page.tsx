// app/takvim/page.tsx — Server Component
import { prisma } from "@/lib/prisma";
import TakvimClient from "../components/TakvimClient";

export const revalidate = 60;

export default async function TakvimPage() {
  const events = await prisma.examEvent.findMany({
    orderBy: { date: "asc" },
  });

  return <TakvimClient initialEvents={events as any} />;
}