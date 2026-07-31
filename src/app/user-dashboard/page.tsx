"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "@/app/lib/socket";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
      <div className="relative w-12 h-12 rounded-xl bg-white/10 border border-[var(--gold)]/30 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-[var(--gold-bright)]" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--gold-bright)] bg-[var(--gold)]/15 border border-[var(--gold)]/30 px-3 py-1.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-bright)] animate-pulse" />
        في انتظار موافقة الكاهن
      </span>
    );
  }
  if (status === "accepted") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--sage)] bg-[var(--sage)]/15 border border-[var(--sage)]/30 px-3 py-1.5 rounded-full">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        تم قبول الحجز
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e08893] bg-[var(--wine)]/20 border border-[var(--wine)]/40 px-3 py-1.5 rounded-full">
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      تم رفض الحجز
    </span>
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

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [priests, setPriests] = useState<string[]>([]);
  const [selectedPriest, setSelectedPriest] = useState("أبونا مقار");
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const router = useRouter();
  const [userId, setUserId] = useState("");
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
    const id = params.get("userId");

    if (!id) {
      router.replace("/");
      return;
    }

    setUserId(id);
  }, [router]);

  useEffect(() => {

    if (!userId) return;

    fetchUserData(userId);

    fetchUserBookings(userId);

  }, [userId]);

  useEffect(() => {
    if (selectedPriest) {
      fetchSlots(selectedPriest);
    }
  }, [selectedPriest]);

  useEffect(() => {
    fetchPriests();
  }, []);

  // اتصال Socket.io: تحديثات لحظية لحالة الحجز وللمواعيد المتاحة
  useEffect(() => {
    if (!userId) return;

    socket.connect();
    socket.emit("join", `user:${userId}`);

    function handleBookingStatus(payload: any) {
      fetchUserBookings(userId);
      if (payload?.status === "accepted") {
        pushToast(`تم قبول حجزك مع ${payload.priestName} بتاريخ ${payload.date}`, "sage");
      } else if (payload?.status === "rejected") {
        pushToast(`تم رفض حجزك مع ${payload.priestName} بتاريخ ${payload.date}`, "wine");
      } else if (payload?.status === "closed") {
        fetchSlots(selectedPriest);
      }
    }

    function handleCleanup() {
      fetchUserBookings(userId);
      fetchSlots(selectedPriest);
    }

    socket.on("booking-status", handleBookingStatus);
    socket.on("cleanup", handleCleanup);

    return () => {
      socket.off("booking-status", handleBookingStatus);
      socket.off("cleanup", handleCleanup);
      socket.emit("leave", `user:${userId}`);
      socket.disconnect();
    };
  }, [userId]);

  // متابعة مواعيد الكاهن المختار لحظيًا (إضافة موعد جديد / تحديث الأماكن المتاحة)
  useEffect(() => {
    if (!selectedPriest) return;

    socket.emit("join", `priest:${selectedPriest}`);

    function handleNewSlot(payload: any) {
      pushToast(`تمت إضافة موعد جديد بتاريخ ${payload?.date || ""}`, "gold");
      fetchSlots(selectedPriest);
    }

    function handleSlotsUpdated() {
      fetchSlots(selectedPriest);
    }

    socket.on("new-slot", handleNewSlot);
    socket.on("slots-updated", handleSlotsUpdated);

    return () => {
      socket.off("new-slot", handleNewSlot);
      socket.off("slots-updated", handleSlotsUpdated);
      socket.emit("leave", `priest:${selectedPriest}`);
    };
  }, [selectedPriest]);

  async function fetchUserData(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`);
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        router.replace("/");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchPriests() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/priests`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setPriests(data.map((p: any) => p.name));

        if (data.length > 0) {
          setSelectedPriest(data[0].name);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchSlots(priestName: string) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/priest-slots?priestName=${encodeURIComponent(priestName)}`
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setSlots(data);

        if (data.length > 0) {
          setSelectedSlot(data[0]);
          setSelectedDate(data[0].date);
        } else {
          setSelectedSlot(null);
          setSelectedDate("");
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchUserBookings(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user-bookings/${id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate) {
      alert("الرجاء اختيار موعد متاح");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          priestName: selectedPriest,
          date: selectedSlot.date,
          startTime: selectedSlot.startTime
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("تم إرسال طلب الحجز بنجاح");
        fetchUserBookings(userId);
        fetchSlots(selectedPriest);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إتمام الحجز");
    }
  }

  return (
    <div dir="rtl" className="font-body relative min-h-screen flex flex-col md:flex-row overflow-hidden bg-[var(--ink)] text-[var(--parchment)]">
      <GlobalStyle />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="absolute inset-0 bg-cover bg-center filter brightness-[0.28] scale-105 pointer-events-none" style={{ backgroundImage: "url('/background.png')" }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(201,166,107,0.08),transparent_50%),linear-gradient(180deg,#070a11_0%,#0a0e18_60%,#070a11_100%)] pointer-events-none" />

      {/* Sidebar */}
      <aside className="relative z-10 w-full md:w-72 bg-white/[0.045] border-b md:border-b-0 md:border-l border-white/10 backdrop-blur-2xl p-6 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-7">
          <div className="flex items-center gap-3">
            <FlameBadge />
            <div className="overflow-hidden">
              <h2 className="font-display font-bold text-lg truncate">{user?.fullName || "مستخدم"}</h2>
              <p className="text-[11px] tracking-wider text-[var(--gold)] truncate uppercase">لوحة المتردد</p>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-l from-transparent via-white/15 to-transparent" />

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] text-[#151016] font-bold text-sm shadow-[0_8px_20px_-6px_rgba(201,166,107,0.5)]">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>حجز موعد جديد</span>
          </div>
        </div>

        <button
          onClick={() => {
            router.replace("/");
          }}
          className="hidden md:flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-[#e08893] bg-[var(--wine)]/15 border border-[var(--wine)]/30 hover:bg-[var(--wine)]/25 transition-colors mt-6"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span>تسجيل الخروج</span>
        </button>
      </aside>

      <main className="relative z-10 flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
          <div className="relative bg-white/[0.045] border border-white/10 backdrop-blur-2xl p-6 sm:p-9 rounded-[2rem] overflow-hidden">
            <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-[var(--gold)]/10 blur-[90px] pointer-events-none" />
            <span className="relative text-[11px] font-semibold text-[var(--gold)] tracking-[0.2em] uppercase">حجز موعد اعتراف جديد</span>
            <h1 className="relative font-display text-2xl sm:text-3xl font-bold text-[var(--parchment)] mt-1.5">اختر الموعد المناسب</h1>

            <form onSubmit={handleBooking} className="relative mt-7 flex flex-col gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--mist)] mb-2">الأب الكاهن</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-2xl bg-white/[0.05] border border-white/10 px-4 py-3.5 text-[var(--parchment)] text-sm outline-none focus:border-[var(--gold)]/60 transition-colors"
                    value={selectedPriest}
                    onChange={(e) => setSelectedPriest(e.target.value)}
                  >
                    {priests.map((p, index) => (
                      <option key={index} value={p} className="bg-[var(--panel)] text-white">{p}</option>
                    ))}
                  </select>
                  <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gold)]" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--mist)] mb-2">المواعيد المتاحة</label>
                {slots.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 py-8 text-center">
                    <p className="text-sm text-[var(--mist)]">لا توجد مواعيد متاحة حالياً.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AnimatePresence initial={false}>
                      {slots.map((slot, idx) => {
                        const active = selectedDate === slot.date;
                        return (
                          <motion.div
                            key={slot._id || idx}
                            layout
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => {
                              setSelectedSlot(slot);
                              setSelectedDate(slot.date);
                            }}
                            className={`relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex justify-between items-center ${
                              active
                                ? "bg-[var(--gold)]/15 border-[var(--gold)]/60 shadow-[0_0_0_3px_rgba(201,166,107,0.12)]"
                                : "bg-white/[0.03] border-white/10 hover:border-white/25"
                            }`}
                          >
                            {active && <CornerFrame tone="gold" />}
                            <div>
                              <p className={`font-bold ${active ? "text-[var(--gold-bright)]" : "text-[var(--parchment)]"}`}>
                                {slot.date}
                              </p>
                              <p className="text-xs text-[var(--mist)] mt-1">
                                يبدأ من الساعة {slot.startTime}
                              </p>
                            </div>
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${active ? "bg-[var(--gold)]/25 text-[var(--gold-bright)]" : "bg-white/10 text-[var(--mist)]"}`}>
                              متاح: {slot.slotsLeft}
                            </span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <button type="submit" className="rounded-2xl bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] text-[#151016] font-bold py-4 transition-all duration-200 shadow-[0_10px_25px_-8px_rgba(201,166,107,0.6)] hover:shadow-[0_14px_30px_-6px_rgba(201,166,107,0.75)] hover:-translate-y-0.5 active:translate-y-0">
                تأكيد حجز الموعد
              </button>
            </form>
          </div>

          <div className="bg-white/[0.045] border border-white/10 backdrop-blur-2xl p-6 sm:p-9 rounded-[2rem]">
            <h2 className="font-display text-xl font-bold text-[var(--parchment)] mb-5">حجوزاتك الحالية</h2>
            {bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 py-10 text-center">
                <p className="text-sm text-[var(--mist)]">ليس لديك أي حجوزات نشطة حالياً.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <AnimatePresence initial={false}>
                  {bookings.map((b: any) => (
                    <motion.div
                      key={b._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="relative p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
                    >
                      <CornerFrame tone={b.status === "accepted" ? "sage" : b.status === "rejected" ? "wine" : "gold"} />
                      <div>
                        <h3 className="font-display font-bold text-lg text-[var(--parchment)]">
                          {b.priestName}
                        </h3>
                        <p className="text-xs text-[var(--mist)] mt-1">
                          التاريخ: {b.date} · يبدأ من الساعة {b.startTime}
                        </p>
                        <div className="mt-2.5">
                          <StatusPill status={b.status} />
                        </div>
                      </div>

                      {b.status === "accepted" && (
                        <span className="self-start sm:self-center px-4 py-2 rounded-xl bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] text-[#151016] font-bold text-sm whitespace-nowrap">
                          رقم الدور {b.queueNumber}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
