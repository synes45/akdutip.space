// app/loading.tsx
import Loader from "@/app/components/Loader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
      <Loader text="Yükleniyor..." />
    </div>
  );
}