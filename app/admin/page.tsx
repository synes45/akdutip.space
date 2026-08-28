"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import CoursesTab from "./components/CoursesTab";
import CalendarTab from "./components/CalendarTab";
import MembersTab from "./components/MembersTab";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"courses" | "calendar" | "members">("courses");

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col md:flex-row font-sans">
      {/* Sol Navigasyon */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Sağ İçerik Ekranı */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === "courses" && <CoursesTab />}
        {activeTab === "calendar" && <CalendarTab />}
        {activeTab === "members" && <MembersTab />}
      </main>
    </div>
  );
}