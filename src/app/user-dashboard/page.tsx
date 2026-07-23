"use client";
import { useEffect, useState } from "react";

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"booking" | "my-bookings">("booking");
  const [priestName, setPriestName] = useState("ابونا مرقس");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [myBookingsHistory, setMyBookingsHistory] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      const parsedUser = JSON.parse(u);
      setUser(parsedUser);
      fetchUserBookings(parsedUser.id || parsedUser._id);
    }
  }, []);

  useEffect(() => {
    fetchSlots(priestName);
  }, [priestName]);

  async function fetchUserBookings(userId: string) {
    try {
      const res = await fetch(`http://localhost:5000/api/user-bookings/${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMyBookingsHistory(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchSlots(pName: string) {
    try {
      const res = await fetch(`http://localhost:5000/api/priest-slots?priestName=${encodeURIComponent(pName)}`);
      const data = await res.json();
      setAvailableSlots(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!selectedDate) {
      setError("الرجاء اختيار يوم متاح من القائمة أدناه.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user?.id || user?._id, 
          userName: user?.fullName, 
          priestName, 
          date: selectedDate 
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessage("تم إرسال طلب الحجز بنجاح وبانتظار موافقة الأب الكاهن.");
        setSelectedDate("");
        fetchUserBookings(user?.id || user?._id);
        fetchSlots(priestName);
      } else {
        setError(data.error || "عذراً، حدث خطأ أثناء الحجز.");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }

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
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="overflow-hidden">
              <h2 className="font-extrabold text-base truncate">{user?.fullName || "مستخدم"}</h2>
              <p className="text-xs text-gray-400 truncate">لوحة المستخدم</p>
            </div>
          </div>

          <nav className="flex md:flex-col gap-2">
            <button
              onClick={() => setActiveTab("booking")}
              className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${
                activeTab === "booking" ? "bg-white text-slate-950 shadow-lg" : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>حجز ميعاد</span>
            </button>
            <button
              onClick={() => setActiveTab("my-bookings")}
              className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${
                activeTab === "my-bookings" ? "bg-white text-slate-950 shadow-lg" : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>حجوزاتي</span>
            </button>
          </nav>
        </div>

        <button 
          onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
          className="hidden md:flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>تسجيل الخروج</span>
        </button>
      </aside>

      <main className="relative z-10 flex-1 p-6 md:p-10 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-xl bg-white/[0.08] border border-white/15 backdrop-blur-2xl p-6 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center">
          
          {activeTab === "booking" ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 shadow-inner">
                <svg className="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">حجز موعد اعتراف جديد</h1>
              <p className="text-gray-300 text-sm mt-3 max-w-sm leading-relaxed">اختر الأب الكاهن واليوم المتاح لحجز موعد الاعتراف بكل سهولة وراحة.</p>

              <form onSubmit={handleBook} className="w-full mt-8 flex flex-col gap-6 text-right">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-200">الأب الكاهن</label>
                  <select 
                    className="w-full rounded-2xl bg-white/10 border border-white/20 px-5 py-4 text-white text-base outline-none transition focus:border-white/50 focus:bg-white/15 cursor-pointer shadow-inner appearance-none" 
                    value={priestName} 
                    onChange={e => { setPriestName(e.target.value); setSelectedDate(""); }}
                  >
                    <option value="ابونا مرقس" className="bg-slate-900 text-white">ابونا مرقس</option>
                    <option value="ابونا بافلي" className="bg-slate-900 text-white">ابونا بافلي</option>
                  </select>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-gray-200">الأيام المتاحة للحجز</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableSlots.map((slot, index) => {
                      const isFull = slot.slotsLeft === 0;
                      const isSelected = selectedDate === slot.date;

                      return (
                        <button
                          key={index}
                          type="button"
                          disabled={isFull}
                          onClick={() => !isFull && setSelectedDate(slot.date)}
                          className={`p-4 rounded-2xl border text-right transition flex flex-col justify-between relative overflow-hidden ${
                            isFull 
                              ? "bg-rose-950/20 border-rose-500/20 opacity-60 cursor-not-allowed" 
                              : isSelected 
                              ? "bg-white text-slate-950 border-white shadow-lg scale-[1.02]" 
                              : "bg-white/5 border-white/15 text-white hover:bg-white/10"
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="font-bold text-base">{slot.date}</span>
                            {isFull && (
                              <span className="text-[11px] font-bold bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-full border border-rose-500/30">
                                مكتمل
                              </span>
                            )}
                          </div>
                          {!isFull && (
                            <span className={`text-xs mt-2 ${isSelected ? "text-slate-600" : "text-gray-300"}`}>
                              متاح ({slot.slotsLeft}) أماكن
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !selectedDate}
                  className="mt-4 w-full rounded-2xl bg-white text-slate-950 font-extrabold py-4 text-base transition hover:bg-gray-100 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-xl"
                >
                  {loading ? "جاري تأكيد الحجز..." : "تأكيد حجز الموعد"}
                </button>

                {message && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-center text-sm font-medium">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-center text-sm font-medium">
                    {error}
                  </div>
                )}
              </form>
            </>
          ) : (
            <div className="w-full flex flex-col items-center">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-6">سجل حجوزاتي</h1>
              <div className="w-full flex flex-col gap-4">
                {myBookingsHistory.length === 0 ? (
                  <p className="text-gray-400 text-sm py-8">لا توجد حجوزات سابقة أو حالية مسجلة باسمك.</p>
                ) : (
                  myBookingsHistory.map((b: any, i: number) => (
                    <div key={i} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2 text-right">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-base">{b.priestName}</span>
                        {b.queueNumber ? (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400 text-slate-950 border border-amber-300 shadow-md">
                            الترتيب: {b.queueNumber}
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            قيد الانتظار
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-300">التاريخ: <span className="font-semibold text-white">{b.date}</span></p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}