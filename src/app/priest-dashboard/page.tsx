"use client";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Priest {
  name: string;
}

interface UserProfile {
  fullName?: string;
  phone?: string;
  birthDate?: string;
}

interface Booking {
  _id: string;
  queueNumber?: number;
  userProfile?: UserProfile;
  date: string;
  status: string;
}

interface RegisteredUser {
  _id: string;
  fullName: string;
  phone: string;
  birthDate?: string;
}

export default function PriestDashboard() {
  const [priest, setPriest] = useState<Priest | null>(null);
  const [activeTab, setActiveTab] = useState<"current" | "all-history">("current");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [registeredUsersList, setRegisteredUsersList] = useState<RegisteredUser[]>([]);
  const [search, setSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let currentPriest: Priest | null = null;
    const p = localStorage.getItem("priest");
    if (p) {
      try {
        currentPriest = JSON.parse(p);
      } catch (e) {
        currentPriest = null;
      }
    }

    if (!currentPriest || !currentPriest.name) {
      currentPriest = { name: "أبونا مقار" };
      localStorage.setItem("priest", JSON.stringify(currentPriest));
    }

    setPriest(currentPriest);
    if (currentPriest) {
      loadData(currentPriest.name);
    }
  }, []);

  async function loadData(name: string) {
    setLoading(true);
    await Promise.all([fetchBookings(name), fetchRegisteredUsers(name)]);
    setLoading(false);
  }

  async function fetchBookings(name: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${encodeURIComponent(name)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
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
      console.error("Error fetching registered users:", err);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok && priest) {
        fetchBookings(priest.name);
        fetchRegisteredUsers(priest.name);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  }

  const filteredBookings = bookings.filter(b => {
    const userName = b.userProfile?.fullName || "";
    return userName.toLowerCase().includes(search.toLowerCase());
  });

  const filteredHistory = registeredUsersList.filter(u => {
    const name = u.fullName || "";
    const phone = u.phone || "";
    return name.toLowerCase().includes(historySearch.toLowerCase()) || phone.includes(historySearch);
  });

  return (
    <div dir="rtl" className="relative min-h-screen flex flex-col md:flex-row overflow-hidden bg-slate-950 text-white">
      <div 
        className="absolute inset-0 bg-cover bg-center filter brightness-[0.35] scale-105 pointer-events-none"
        style={{ backgroundImage: "url('/background.png')" }}
      />
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
              <h2 className="font-extrabold text-base truncate">{priest?.name || "أبانا"}</h2>
              <p className="text-xs text-gray-400 truncate">لوحة الكاهن</p>
            </div>
          </div>

          <nav className="flex md:flex-col gap-2">
            <button
              onClick={() => setActiveTab("current")}
              className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${
                activeTab === "current" ? "bg-white text-slate-950 shadow-lg" : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              <span>الحجوزات الحالية</span>
            </button>
            <button
              onClick={() => setActiveTab("all-history")}
              className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${
                activeTab === "all-history" ? "bg-white text-slate-950 shadow-lg" : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              <span>سجل المترددين</span>
            </button>
          </nav>
        </div>

        <button 
          onClick={() => { localStorage.clear(); window.location.href = "/"; }}
          className="hidden md:flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition"
        >
          <span>تسجيل الخروج</span>
        </button>
      </aside>

      <main className="relative z-10 flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/[0.08] border border-white/15 backdrop-blur-2xl p-6 sm:p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] gap-4">
            <div>
              <span className="text-xs font-semibold text-amber-300 tracking-wider uppercase">لوحة التحكم الإدارية</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">أهلاً بك، {priest?.name || "أبانا العزيز"}</h1>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm text-gray-200">
              إجمالي العدد: <span className="font-bold text-white">{activeTab === "current" ? bookings.length : registeredUsersList.length}</span>
            </div>
          </div>

          <div className="bg-white/[0.08] border border-white/15 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-6">
            {loading ? (
              <div className="text-center py-12 text-gray-400 text-sm">جاري تحميل البيانات...</div>
            ) : activeTab === "current" ? (
              <>
                <input 
                  type="text" 
                  placeholder="ابحث باسم الشخص..." 
                  className="w-full sm:w-72 rounded-2xl bg-white/10 border border-white/20 px-5 py-3.5 text-white text-sm outline-none transition focus:border-white/50 focus:bg-white/15 shadow-inner placeholder-gray-400"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />

                <div className="flex flex-col gap-4">
                  {filteredBookings.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm">لا توجد طلبات حجز مطابقة للبحث الحالي.</div>
                  ) : (
                    filteredBookings.map((b) => (
                      <div key={b._id} className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition hover:bg-white/[0.07]">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg text-white">{b.userProfile?.fullName || "مستخدم"}</h3>
                            {b.queueNumber && (
                              <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-300 shadow">
                                رقم الدور: {b.queueNumber}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-300">رقم الهاتف: <span className="font-semibold text-white">{b.userProfile?.phone || "-"}</span></p>
                          <p className="text-xs text-gray-300">التاريخ المختار للحجز: <span className="font-semibold text-white">{b.date}</span></p>
                        </div>

                        {b.status === "pending" && (
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => updateStatus(b._id, "accepted")} className="flex-1 sm:flex-none bg-emerald-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition hover:bg-emerald-400">قبول</button>
                            <button onClick={() => updateStatus(b._id, "rejected")} className="flex-1 sm:flex-none bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold px-5 py-2.5 rounded-xl text-sm transition hover:bg-rose-500/30">رفض</button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <input 
                  type="text" 
                  placeholder="ابحث في سجل المترددين بالاسم أو الهاتف..." 
                  className="w-full sm:w-72 rounded-2xl bg-white/10 border border-white/20 px-5 py-3.5 text-white text-sm outline-none transition focus:border-white/50 focus:bg-white/15 shadow-inner placeholder-gray-400"
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                />

                <div className="flex flex-col gap-4">
                  {filteredHistory.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm">لا يوجد مترددين مسجلين في السجل.</div>
                  ) : (
                    filteredHistory.map((u) => (
                      <div key={u._id} className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition hover:bg-white/[0.07]">
                        <div className="flex flex-col gap-1.5">
                          <h3 className="font-bold text-lg text-white">{u.fullName}</h3>
                          <p className="text-xs text-gray-300">رقم الهاتف: <span className="font-semibold text-white">{u.phone}</span></p>
                          <p className="text-xs text-gray-300">تاريخ الميلاد: <span className="font-semibold text-white">{u.birthDate || "-"}</span></p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}