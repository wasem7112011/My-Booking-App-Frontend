"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [priests] = useState<string[]>(["أبونا مقار"]);
  const [selectedPriest, setSelectedPriest] = useState("أبونا مقار");
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  useEffect(() => {
    if (!userId) {
      router.push("/");
      return;
    }
    fetchUserData(userId);
    fetchUserBookings(userId);
  }, [userId]);

  useEffect(() => {
    if (selectedPriest) {
      fetchSlots(selectedPriest);
    }
  }, [selectedPriest]);

  async function fetchUserData(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`);
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchSlots(priestName: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/priest-slots?priestName=${encodeURIComponent(priestName)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSlots(data);
        if (data.length > 0) {
          setSelectedDate(data[0].date);
        } else {
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
          date: selectedDate
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
    <div dir="rtl" className="relative min-h-screen flex flex-col md:flex-row overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-cover bg-center filter brightness-[0.35] scale-105 pointer-events-none" style={{ backgroundImage: "url('/background.png')" }} />
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
              <p className="text-xs text-gray-400 truncate">لوحة المتردد</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => router.push("/")}
          className="hidden md:flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition mt-6"
        >
          <span>تسجيل الخروج</span>
        </button>
      </aside>

      <main className="relative z-10 flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
          <div className="bg-white/[0.08] border border-white/15 backdrop-blur-2xl p-6 sm:p-8 rounded-[2rem]">
            <span className="text-xs font-semibold text-amber-300 tracking-wider uppercase">حجز موعد اعتراف جديد</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">اختر الموعد المناسب</h1>

            <form onSubmit={handleBooking} className="mt-6 flex flex-col gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">الأب الكاهن</label>
                <select 
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3.5 text-white text-sm outline-none"
                  value={selectedPriest}
                  onChange={(e) => setSelectedPriest(e.target.value)}
                >
                  {priests.map((p, index) => (
                    <option key={index} value={p} className="bg-slate-900 text-white">{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">المواعيد المتاحة</label>
                {slots.length === 0 ? (
                  <p className="text-sm text-gray-400">لا توجد مواعيد متاحة حالياً.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {slots.map((slot, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedDate(slot.date)}
                        className={`p-4 rounded-2xl border cursor-pointer transition flex justify-between items-center ${
                          selectedDate === slot.date ? "bg-amber-400/20 border-amber-400 text-white" : "bg-white/5 border-white/15 text-gray-300"
                        }`}
                      >
                        <span className="font-bold">{slot.date}</span>
                        <span className="text-xs px-3 py-1 rounded-full bg-white/10">متاح: {slot.slotsLeft}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="rounded-2xl bg-white text-slate-950 font-bold py-4 transition hover:bg-gray-100">
                تأكيد حجز الموعد
              </button>
            </form>
          </div>

          <div className="bg-white/[0.08] border border-white/15 backdrop-blur-2xl p-6 sm:p-8 rounded-[2.5rem]">
            <h2 className="text-xl font-bold text-white mb-4">حجوزاتك الحالية</h2>
            {bookings.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">ليس لديك أي حجوزات نشطة حالياً.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {bookings.map((b: any) => (
                  <div key={b._id} className="p-5 rounded-2xl bg-white/5 border border-white/15 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-white">{b.priestName}</h3>
                      <p className="text-xs text-gray-300">التاريخ: {b.date}</p>
                    </div>
                    {b.queueNumber && <span className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm">رقم الدور: {b.queueNumber}</span>}
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