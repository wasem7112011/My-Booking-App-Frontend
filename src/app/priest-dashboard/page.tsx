"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PriestDashboard() {
  const [activeTab, setActiveTab] = useState<"current" | "all-history">("current");
  const [bookings, setBookings] = useState<any[]>([]);
  const [registeredUsersList, setRegisteredUsersList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const router = useRouter();
  const [priestName, setPriestName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");

    if (!name) {
      router.replace("/");
      return;
    }

    setPriestName(name);
  }, [router]);

  useEffect(() => {
    if (!priestName) return;

    fetchBookings(priestName);
    fetchRegisteredUsers(priestName);
  }, [priestName]);

  async function fetchBookings(name: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${encodeURIComponent(name)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchRegisteredUsers(name: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/priest-users/${encodeURIComponent(name)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRegisteredUsersList(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchBookings(priestName);
      fetchRegisteredUsers(priestName);
    } catch (err) {
      console.error(err);
    }
  }

  const filteredBookings = bookings.filter(b => (b.userProfile?.fullName || "").toLowerCase().includes(search.toLowerCase()));
  const filteredHistory = registeredUsersList.filter(u => (u.fullName || "").toLowerCase().includes(historySearch.toLowerCase()) || (u.phone || "").includes(historySearch));

  return (
    <div dir="rtl" className="relative min-h-screen flex flex-col md:flex-row overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-cover bg-center filter brightness-[0.35] scale-105 pointer-events-none" style={{ backgroundImage: "url('/background.png')" }} />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-slate-900/40 pointer-events-none" />

      <aside className="relative z-10 w-full md:w-72 bg-white/[0.06] border-b md:border-b-0 md:border-l border-white/10 backdrop-blur-2xl p-6 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="overflow-hidden">
              <h2 className="font-extrabold text-base truncate">{priestName}</h2>
              <p className="text-xs text-gray-400 truncate">لوحة الكاهن</p>
            </div>
          </div>

          <nav className="flex md:flex-col gap-2">
            <button onClick={() => setActiveTab("current")} className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === "current" ? "bg-white text-slate-950" : "bg-white/5 text-gray-300"}`}>
              <span>الحجوزات الحالية</span>
            </button>
            <button onClick={() => setActiveTab("all-history")} className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === "all-history" ? "bg-white text-slate-950" : "bg-white/5 text-gray-300"}`}>
              <span>سجل المترددين</span>
            </button>
          </nav>
        </div>

        <button
          onClick={() => {
            router.replace("/");
          }}
          className="hidden md:flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20"
        >
          <span>تسجيل الخروج</span>
        </button>
      </aside>

      <main className="relative z-10 flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
          <div className="bg-white/[0.08] border border-white/15 backdrop-blur-2xl p-6 sm:p-8 rounded-[2rem]">
            <span className="text-xs font-semibold text-amber-300 tracking-wider uppercase">لوحة التحكم الإدارية</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">أهلاً بك، {priestName}</h1>
          </div>

          <div className="bg-white/[0.08] border border-white/15 backdrop-blur-2xl p-6 rounded-[2.5rem]">
            {activeTab === "current" ? (
              <div className="flex flex-col gap-4">
                <input type="text" placeholder="ابحث باسم الشخص..." className="w-full sm:w-72 rounded-2xl bg-white/10 border border-white/20 px-5 py-3.5 text-white text-sm outline-none" value={search} onChange={e => setSearch(e.target.value)} />
                {filteredBookings.map((b: any) => (
                  <div key={b._id} className="p-5 rounded-2xl bg-white/5 border border-white/15 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-white">{b.userProfile?.fullName || "مستخدم"}</h3>
                      <p className="text-xs text-gray-300">التاريخ: {b.date}</p>
                    </div>
                    {b.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(b._id, "accepted")} className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm">قبول</button>
                        <button onClick={() => updateStatus(b._id, "rejected")} className="bg-rose-500/20 text-rose-300 font-bold px-4 py-2 rounded-xl text-sm">رفض</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <input type="text" placeholder="ابحث في سجل المترددين..." className="w-full sm:w-72 rounded-2xl bg-white/10 border border-white/20 px-5 py-3.5 text-white text-sm outline-none" value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
                {filteredHistory.map((u: any) => (
                  <div key={u._id} className="p-5 rounded-2xl bg-white/5 border border-white/15">
                    <h3 className="font-bold text-lg text-white">{u.fullName}</h3>
                    <p className="text-xs text-gray-300">الهاتف: {u.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}