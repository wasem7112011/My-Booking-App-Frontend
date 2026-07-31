"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "@/app/lib/socket";
import { authFetch, clearToken } from "@/app/lib/auth";
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiSearch,
  FiTrash2,
  FiPlus,
  FiLogOut,
  FiCheck,
  FiX,
  FiUser,
  FiPhone,
  FiMapPin,
  FiBookOpen,
  FiBriefcase,
  FiHome,
  FiXCircle
} from "react-icons/fi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ---------- Presentational helpers (visual only) ---------- */

function GlobalStyle() {
  return (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Tajawal:wght@300;400;500;700;800&display=swap');

      :root {
        --ink: #090c14;
        --panel: #12182a;
        --gold: #c9a66b;
        --gold-bright: #ecd6a3;
        --wine: #8b3a42;
        --sage: #4f9e8c;
        --parchment: #f3ede1;
        --mist: #97a0b8;
      }
      .font-display { font-family: 'Aref Ruqaa', 'Tajawal', serif; }
      .font-body { font-family: 'Tajawal', system-ui, sans-serif; }

      @keyframes candle-glow {
        0%, 100% { opacity: 0.45; transform: scale(1); }
        50% { opacity: 0.9; transform: scale(1.14); }
      }
      .animate-candle { animation: candle-glow 4.5s ease-in-out infinite; }

      ::selection { background: var(--gold); color: #10121b; }

      * { scrollbar-width: thin; scrollbar-color: var(--gold) transparent; }
      *::-webkit-scrollbar { width: 8px; height: 8px; }
      *::-webkit-scrollbar-thumb { background: linear-gradient(180deg, var(--gold), var(--wine)); border-radius: 8px; }
      *::-webkit-scrollbar-track { background: transparent; }
    `}</style>
  );
}

function CornerFrame({ tone = "gold" as "gold" | "wine" | "sage" }) {
  const color =
    tone === "gold" ? "border-[var(--gold)]/45" : tone === "sage" ? "border-[var(--sage)]/45" : "border-[var(--wine)]/45";
  return (
    <>
      <span className={`pointer-events-none absolute -top-[1px] -right-[1px] w-4 h-4 border-t-2 border-r-2 rounded-tr-xl ${color}`} />
      <span className={`pointer-events-none absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 rounded-tl-xl ${color}`} />
      <span className={`pointer-events-none absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 rounded-br-xl ${color}`} />
      <span className={`pointer-events-none absolute -bottom-[1px] -left-[1px] w-4 h-4 border-b-2 border-l-2 rounded-bl-xl ${color}`} />
    </>
  );
}

function FlameBadge() {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
      <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle,var(--gold)_0%,transparent_70%)] opacity-50 blur-md animate-candle" />
      <div className="relative w-12 h-12 rounded-xl bg-white/10 border border-[var(--gold)]/30 flex items-center justify-center backdrop-blur-sm">
        <svg className="w-6 h-6 text-[var(--gold-bright)]" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/8 last:border-0">
      <div className="w-9 h-9 rounded-lg bg-[var(--gold)]/12 border border-[var(--gold)]/25 flex items-center justify-center text-[var(--gold-bright)] shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-[var(--mist)] tracking-wide">{label}</p>
        <p className="text-sm font-bold text-[var(--parchment)] truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

type Toast = { id: number; text: string; tone: "gold" | "sage" | "wine" };

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-[92%] max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            onClick={() => onDismiss(t.id)}
            className={`pointer-events-auto cursor-pointer rounded-2xl border backdrop-blur-xl px-4 py-3 text-sm font-bold shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] ${
              t.tone === "sage"
                ? "bg-[var(--sage)]/15 border-[var(--sage)]/40 text-[var(--sage)]"
                : t.tone === "wine"
                ? "bg-[var(--wine)]/20 border-[var(--wine)]/40 text-[#e08893]"
                : "bg-[var(--gold)]/15 border-[var(--gold)]/40 text-[var(--gold-bright)]"
            }`}
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function PriestDashboard() {
  const [activeTab, setActiveTab] = useState<"current" | "confessors">("current");
  const [bookings, setBookings] = useState<any[]>([]);
  const [confessors, setConfessors] = useState<any[]>([]);
  const [selectedConfessor, setSelectedConfessor] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [confessorSearch, setConfessorSearch] = useState("");
  const router = useRouter();
  const [priestName, setPriestName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [slotsCount, setSlotsCount] = useState(20);
  const [mySlots, setMySlots] = useState<any[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function pushToast(text: string, tone: Toast["tone"] = "gold") {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }

  function dismissToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

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
    fetchConfessors(priestName);
    fetchMySlots(priestName);
  }, [priestName]);

  // اتصال Socket.io: تحديثات لحظية للحجوزات والمواعيد وسجل المعترفين
  useEffect(() => {
    if (!priestName) return;

    socket.connect();
    socket.emit("join", `priest:${priestName}`);

    function handleNewBooking(payload: any) {
      pushToast(`طلب حجز جديد من ${payload?.fullName || "شخص"} بتاريخ ${payload?.date || ""}`, "gold");
      fetchBookings(priestName);
    }

    function handleBookingsUpdated() {
      fetchBookings(priestName);
    }

    function handleSlotsUpdated() {
      fetchMySlots(priestName);
    }

    function handleConfessorsUpdated() {
      fetchConfessors(priestName);
    }

    function handleCleanup() {
      fetchBookings(priestName);
      fetchMySlots(priestName);
      fetchConfessors(priestName);
    }

    socket.on("new-booking", handleNewBooking);
    socket.on("bookings-updated", handleBookingsUpdated);
    socket.on("slots-updated", handleSlotsUpdated);
    socket.on("confessors-updated", handleConfessorsUpdated);
    socket.on("cleanup", handleCleanup);

    return () => {
      socket.off("new-booking", handleNewBooking);
      socket.off("bookings-updated", handleBookingsUpdated);
      socket.off("slots-updated", handleSlotsUpdated);
      socket.off("confessors-updated", handleConfessorsUpdated);
      socket.off("cleanup", handleCleanup);
      socket.emit("leave", `priest:${priestName}`);
      socket.disconnect();
    };
  }, [priestName]);

  async function fetchBookings(name: string) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/bookings/${encodeURIComponent(name)}`);
      if (res.status === 401 || res.status === 403) {
        clearToken();
        router.replace("/");
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchConfessors(name: string) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/confessors/${encodeURIComponent(name)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setConfessors(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await authFetch(`${API_BASE_URL}/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchBookings(priestName);
      fetchMySlots(priestName);
    } catch (err) {
      console.error(err);
    }
  }

  async function confessAction(id: string, confessed: boolean) {
    try {
      await authFetch(`${API_BASE_URL}/api/bookings/${id}/confession`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confessed })
      });
      fetchBookings(priestName);
      fetchConfessors(priestName);
      fetchMySlots(priestName);
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteConfessor(id: string) {
    if (!confirm("حذف هذا المعترف من السجل نهائيًا؟")) return;

    try {
      await authFetch(`${API_BASE_URL}/api/confessors/${id}`, {
        method: "DELETE"
      });
      if (selectedConfessor?._id === id) {
        setSelectedConfessor(null);
      }
      fetchConfessors(priestName);
    } catch (err) {
      console.error(err);
    }
  }

  async function addSlot() {
    if (!newDate || !startTime) {
      alert("أدخل التاريخ ووقت البداية");
      return;
    }

    const res = await authFetch(`${API_BASE_URL}/api/priest-slots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        date: newDate,
        startTime,
        slotsLeft: Number(slotsCount)
      })
    });

    const data = await res.json();

    if (data.success) {
      pushToast("تم إضافة الموعد بنجاح", "sage");
    } else {
      alert(data.error);
    }
  }

  async function fetchMySlots(name: string) {
    const res = await authFetch(
      `${API_BASE_URL}/api/priest-slots/${encodeURIComponent(name)}`
    );

    const data = await res.json();

    setMySlots(data);
  }

  async function deleteSlot(id: string) {
    if (!confirm("حذف هذا الموعد؟")) return;

    await authFetch(`${API_BASE_URL}/api/priest-slots/${id}`, {
      method: "DELETE"
    });

    fetchMySlots(priestName);
  }

  const filteredBookings = bookings.filter(b => (b.userProfile?.fullName || "").toLowerCase().includes(search.toLowerCase()));
  const filteredConfessors = confessors.filter(c => (c.fullName || "").toLowerCase().includes(confessorSearch.toLowerCase()) || (c.phone || "").includes(confessorSearch));

  const searchInputStyle =
    "w-full sm:w-72 rounded-2xl bg-white/[0.05] border border-white/10 px-5 py-3.5 pr-11 text-[var(--parchment)] text-sm outline-none transition-colors focus:border-[var(--gold)]/60";

  return (
    <div dir="rtl" className="font-body relative min-h-screen flex flex-col md:flex-row overflow-hidden bg-[var(--ink)] text-[var(--parchment)]">
      <GlobalStyle />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="absolute inset-0 bg-cover bg-center filter brightness-[0.28] scale-105 pointer-events-none" style={{ backgroundImage: "url('/background.png')" }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(201,166,107,0.08),transparent_50%),linear-gradient(180deg,#070a11_0%,#0a0e18_60%,#070a11_100%)] pointer-events-none" />

      {/* Sidebar */}
      <aside className="relative z-10 w-full md:w-72 bg-white/[0.045] border-b md:border-b-0 md:border-l border-white/10 backdrop-blur-2xl p-6 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <FlameBadge />
            <div className="overflow-hidden">
              <h2 className="font-display font-bold text-lg truncate">{priestName}</h2>
              <p className="text-[11px] tracking-wider text-[var(--gold)] truncate uppercase">لوحة الكاهن</p>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-l from-transparent via-white/15 to-transparent" />

          <nav className="flex md:flex-col gap-2">
            <button
              onClick={() => setActiveTab("current")}
              className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                activeTab === "current"
                  ? "bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] text-[#151016] shadow-[0_8px_20px_-6px_rgba(201,166,107,0.5)]"
                  : "bg-white/[0.04] text-[var(--mist)] hover:text-[var(--parchment)] hover:bg-white/[0.07]"
              }`}
            >
              <FiCalendar className="w-4 h-4" />
              <span>الحجوزات الحالية</span>
            </button>
            <button
              onClick={() => setActiveTab("confessors")}
              className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                activeTab === "confessors"
                  ? "bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] text-[#151016] shadow-[0_8px_20px_-6px_rgba(201,166,107,0.5)]"
                  : "bg-white/[0.04] text-[var(--mist)] hover:text-[var(--parchment)] hover:bg-white/[0.07]"
              }`}
            >
              <FiUsers className="w-4 h-4" />
              <span>سجل المعترفين</span>
            </button>
          </nav>
        </div>

        <button
          onClick={() => {
            clearToken();
            router.replace("/");
          }}
          className="hidden md:flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-[#e08893] bg-[var(--wine)]/15 border border-[var(--wine)]/30 hover:bg-[var(--wine)]/25 transition-colors"
        >
          <FiLogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </aside>

      <main className="relative z-10 flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative bg-white/[0.045] border border-white/10 backdrop-blur-2xl p-6 sm:p-9 rounded-[2rem] overflow-hidden"
          >
            <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-[var(--gold)]/10 blur-[90px] pointer-events-none" />
            <span className="relative text-[11px] font-semibold text-[var(--gold)] tracking-[0.2em] uppercase">لوحة التحكم الإدارية</span>
            <h1 className="relative font-display text-2xl sm:text-3xl font-bold text-[var(--parchment)] mt-1.5">أهلاً بك، {priestName}</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white/[0.045] border border-white/10 backdrop-blur-2xl p-6 sm:p-8 rounded-[2rem]"
          >
            {activeTab === "current" ? (
              <div className="flex flex-col gap-8">

                {/* Add slot */}
                <div>
                  <h2 className="font-display text-lg font-bold text-[var(--parchment)] mb-4">إضافة موعد جديد</h2>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="flex-1 rounded-xl bg-white/[0.05] border border-white/10 p-3 text-sm outline-none focus:border-[var(--gold)]/60 transition-colors"
                    />

                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="flex-1 rounded-xl bg-white/[0.05] border border-white/10 p-3 text-sm outline-none focus:border-[var(--gold)]/60 transition-colors"
                    />

                    <input
                      type="number"
                      value={slotsCount}
                      onChange={(e) => setSlotsCount(Number(e.target.value))}
                      className="sm:w-36 rounded-xl bg-white/[0.05] border border-white/10 p-3 text-sm outline-none focus:border-[var(--gold)]/60 transition-colors"
                      placeholder="عدد الأماكن"
                    />

                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={addSlot}
                      className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold text-sm text-[#0f1a17] bg-gradient-to-b from-[#7fd6bf] to-[var(--sage)] shadow-[0_8px_20px_-6px_rgba(79,158,140,0.55)] transition-shadow hover:shadow-[0_10px_26px_-4px_rgba(79,158,140,0.7)]"
                    >
                      <FiPlus className="w-4 h-4" />
                      إضافة موعد
                    </motion.button>
                  </div>
                </div>

                {/* My slots */}
                <div>
                  <h2 className="font-display text-lg font-bold text-[var(--parchment)] mb-4">
                    المواعيد المضافة
                  </h2>

                  {mySlots.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/15 py-8 text-center">
                      <p className="text-sm text-[var(--mist)]">لم تُضف أي مواعيد بعد.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <AnimatePresence initial={false}>
                        {mySlots.map((slot) => (
                          <motion.div
                            key={slot._id}
                            layout
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex justify-between items-center hover:bg-white/[0.05] hover:border-white/20 transition-colors"
                          >
                            <CornerFrame tone="gold" />
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-[var(--gold)]/12 border border-[var(--gold)]/25 flex items-center justify-center text-[var(--gold-bright)] shrink-0">
                                <FiClock className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-[var(--parchment)]">{slot.date}</p>
                                <p className="text-xs text-[var(--mist)] mt-0.5">
                                  الأماكن المتبقية: {slot.slotsLeft}
                                </p>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => deleteSlot(slot._id)}
                              className="flex items-center gap-1.5 text-xs font-bold text-[#e08893] bg-[var(--wine)]/15 border border-[var(--wine)]/30 px-3.5 py-2 rounded-lg hover:bg-[var(--wine)]/25 transition-colors"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                              حذف
                            </motion.button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Bookings */}
                <div>
                  <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                    <h2 className="font-display text-lg font-bold text-[var(--parchment)]">الحجوزات الحالية</h2>
                    <div className="relative">
                      <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mist)]" />
                      <input
                        type="text"
                        placeholder="ابحث باسم الشخص..."
                        className={searchInputStyle}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {filteredBookings.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/15 py-8 text-center">
                        <p className="text-sm text-[var(--mist)]">لا توجد حجوزات مطابقة.</p>
                      </div>
                    ) : (
                      <AnimatePresence initial={false}>
                        {filteredBookings.map((b: any) => (
                          <motion.div
                            key={b._id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.2 }}
                            className="relative p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:bg-white/[0.05] hover:border-white/20 transition-colors"
                          >
                            <CornerFrame tone={b.status === "accepted" ? "sage" : "gold"} />
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[var(--gold)]/12 border border-[var(--gold)]/25 flex items-center justify-center text-[var(--gold-bright)] shrink-0">
                                <FiUser className="w-4.5 h-4.5" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-[var(--parchment)]">
                                  {b.userProfile?.fullName || "مستخدم"}
                                </h3>
                                <p className="text-xs text-[var(--mist)] mt-0.5">
                                  التاريخ: {b.date}
                                  {b.status === "accepted" && b.queueNumber ? ` · الدور رقم ${b.queueNumber}` : ""}
                                </p>
                              </div>
                            </div>

                            {b.status === "pending" && (
                              <div className="flex gap-2">
                                <motion.button
                                  whileHover={{ y: -2 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => updateStatus(b._id, "accepted")}
                                  className="flex items-center gap-1.5 bg-gradient-to-b from-[#7fd6bf] to-[var(--sage)] text-[#0f1a17] font-bold px-4 py-2 rounded-xl text-sm shadow-[0_6px_16px_-4px_rgba(79,158,140,0.5)]"
                                >
                                  <FiCheck className="w-4 h-4" />
                                  قبول
                                </motion.button>

                                <motion.button
                                  whileHover={{ y: -2 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => updateStatus(b._id, "rejected")}
                                  className="flex items-center gap-1.5 bg-[var(--wine)]/20 border border-[var(--wine)]/40 text-[#e08893] font-bold px-4 py-2 rounded-xl text-sm hover:bg-[var(--wine)]/30 transition-colors"
                                >
                                  <FiX className="w-4 h-4" />
                                  رفض
                                </motion.button>
                              </div>
                            )}

                            {b.status === "accepted" && (
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-[var(--mist)] whitespace-nowrap">هل اعترف؟</span>
                                <div className="flex gap-2">
                                  <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => confessAction(b._id, true)}
                                    className="flex items-center gap-1.5 bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] text-[#151016] font-bold px-4 py-2 rounded-xl text-sm shadow-[0_6px_16px_-4px_rgba(201,166,107,0.5)]"
                                  >
                                    <FiCheck className="w-4 h-4" />
                                    نعم
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => confessAction(b._id, false)}
                                    className="flex items-center gap-1.5 bg-[var(--wine)]/20 border border-[var(--wine)]/40 text-[#e08893] font-bold px-4 py-2 rounded-xl text-sm hover:bg-[var(--wine)]/30 transition-colors"
                                  >
                                    <FiX className="w-4 h-4" />
                                    لا
                                  </motion.button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="font-display text-lg font-bold text-[var(--parchment)]">سجل المعترفين</h2>
                  <div className="relative">
                    <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mist)]" />
                    <input
                      type="text"
                      placeholder="ابحث في سجل المعترفين..."
                      className={searchInputStyle}
                      value={confessorSearch}
                      onChange={e => setConfessorSearch(e.target.value)}
                    />
                  </div>
                </div>

                {filteredConfessors.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 py-10 text-center">
                    <p className="text-sm text-[var(--mist)]">لا يوجد سجل مطابق.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AnimatePresence initial={false}>
                      {filteredConfessors.map((c: any) => (
                        <motion.div
                          key={c._id}
                          layout
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          whileHover={{ y: -3 }}
                          className="relative p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-[var(--gold)]/40 transition-colors"
                        >
                          <CornerFrame tone="gold" />
                          <div
                            onClick={() => setSelectedConfessor(c)}
                            className="flex items-center gap-3 cursor-pointer pr-8"
                          >
                            <div className="w-10 h-10 rounded-full bg-[var(--gold)]/12 border border-[var(--gold)]/25 flex items-center justify-center text-[var(--gold-bright)] shrink-0">
                              <FiUser className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-[var(--parchment)] truncate">{c.fullName}</h3>
                              <p className="text-xs text-[var(--mist)] mt-0.5 truncate">
                                {c.lastConfessionDate ? `آخر اعتراف: ${c.lastConfessionDate}` : "لم يعترف بعد"}
                              </p>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConfessor(c._id);
                            }}
                            className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-[var(--wine)]/15 border border-[var(--wine)]/30 flex items-center justify-center text-[#e08893] hover:bg-[var(--wine)]/25 transition-colors"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Confessor detail modal */}
      <AnimatePresence>
        {selectedConfessor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedConfessor(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-[var(--panel)]/95 border border-white/10 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
            >
              <CornerFrame tone="gold" />

              <button
                onClick={() => setSelectedConfessor(null)}
                className="absolute top-5 left-5 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[var(--mist)] hover:text-[var(--parchment)] hover:bg-white/10 transition-colors"
              >
                <FiXCircle className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-[var(--gold)]/15 border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold-bright)]">
                  <FiUser className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[var(--gold)] tracking-[0.2em] uppercase">بيانات المعترف</span>
                  <h3 className="font-display text-xl font-bold text-[var(--parchment)]">{selectedConfessor.fullName}</h3>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white/[0.03] border border-white/10 px-4">
                <DetailRow icon={<FiPhone className="w-4 h-4" />} label="رقم الهاتف" value={selectedConfessor.phone} />
                <DetailRow icon={<FiCalendar className="w-4 h-4" />} label="تاريخ الميلاد" value={selectedConfessor.birthDate} />
                <DetailRow icon={<FiMapPin className="w-4 h-4" />} label="العنوان" value={selectedConfessor.address} />
                <DetailRow icon={<FiBookOpen className="w-4 h-4" />} label="المرحلة الدراسية" value={selectedConfessor.educationStage} />
                <DetailRow icon={<FiUsers className="w-4 h-4" />} label="الاجتماع" value={selectedConfessor.churchGroup} />
                <DetailRow icon={<FiBriefcase className="w-4 h-4" />} label="الوظيفة" value={selectedConfessor.job} />
                <DetailRow icon={<FiHome className="w-4 h-4" />} label="الكنيسة" value={selectedConfessor.church} />
                <DetailRow
                  icon={<FiClock className="w-4 h-4" />}
                  label="آخر مرة اعتراف"
                  value={selectedConfessor.lastConfessionDate || "لم يعترف بعد"}
                />
              </div>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => deleteConfessor(selectedConfessor._id)}
                className="mt-5 w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--wine)]/20 border border-[var(--wine)]/40 text-[#e08893] font-bold py-3 hover:bg-[var(--wine)]/30 transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
                حذف من السجل نهائيًا
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
