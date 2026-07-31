"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/app/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const EDUCATION_STAGES = ["ابتدائي", "اعدادي", "ثانوي", "جامعة", "خريج", "اخرى"];
const CHURCH_GROUPS = [
  "فترة أولى",
  "فترة تانية",
  "فترة تالتة",
  "اعدادي بنين",
  "اعدادي بنات",
  "ثانوي",
  "جامعة",
  "خريجين",
  "اخرى"
];

/* ---------- Presentational helpers (visual only) ---------- */

function CornerFrame({ tone = "gold" as "gold" | "wine" }) {
  const color = tone === "gold" ? "border-[var(--gold)]/50" : "border-[var(--wine)]/50";
  return (
    <>
      <span className={`pointer-events-none absolute -top-[1px] -right-[1px] w-6 h-6 border-t-2 border-r-2 rounded-tr-2xl ${color}`} />
      <span className={`pointer-events-none absolute -top-[1px] -left-[1px] w-6 h-6 border-t-2 border-l-2 rounded-tl-2xl ${color}`} />
      <span className={`pointer-events-none absolute -bottom-[1px] -right-[1px] w-6 h-6 border-b-2 border-r-2 rounded-br-2xl ${color}`} />
      <span className={`pointer-events-none absolute -bottom-[1px] -left-[1px] w-6 h-6 border-b-2 border-l-2 rounded-bl-2xl ${color}`} />
    </>
  );
}

function FlameMark() {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--gold)_0%,transparent_70%)] opacity-60 blur-md animate-candle" />
      <div className="relative w-16 h-16 rounded-full bg-[var(--panel)] border border-[var(--gold)]/40 flex items-center justify-center shadow-[0_0_25px_-5px_rgba(201,166,107,0.55)]">
        <svg viewBox="0 0 24 24" className="w-7 h-7 text-[var(--gold-bright)]" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2c1.2 2.6 3.6 4.6 3.6 8.1a3.6 3.6 0 11-7.2 0C8.4 6.6 10.8 4.6 12 2z" />
          <path strokeLinecap="round" d="M12 22v-4" />
          <path strokeLinecap="round" d="M8 21h8" />
        </svg>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const [form, setForm] = useState("register");
  const router = useRouter();

  const [regData, setRegData] = useState({
    fullName: "",
    birthDate: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    educationStage: "",
    churchGroup: "",
    job: "",
    church: ""
  });
  const [logData, setLogData] = useState({ phone: "", password: "" });
  const [priestData, setPriestData] = useState({ name: "", password: "" });

  async function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      alert("كلمات المرور غير متطابقة");
      return;
    }
    const res = await fetch(`${API_BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regData)
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      router.push(`/user-dashboard?userId=${data.userId}`);
    } else {
      alert(data.error);
    }
  }

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logData)
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      router.push(`/user-dashboard?userId=${data.user.id}`);
    } else {
      alert(data.error);
    }
  }

  async function priestLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/api/priest-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(priestData)
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      router.push(`/priest-dashboard?name=${encodeURIComponent(data.priest.name)}`);
    } else {
      alert(data.error);
    }
  }

  const inputStyle =
    "font-body w-full rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3.5 text-[var(--parchment)] placeholder:text-[var(--mist)] outline-none transition-all duration-200 focus:border-[var(--gold)]/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_4px_rgba(201,166,107,0.12)]";

  const selectStyle =
    "font-body w-full appearance-none rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3.5 text-[var(--parchment)] outline-none transition-all duration-200 focus:border-[var(--gold)]/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_4px_rgba(201,166,107,0.12)]";

  const tabs: { key: "register" | "login" | "priest-login"; label: string }[] = [
    { key: "register", label: "حساب جديد" },
    { key: "login", label: "دخول الأفراد" },
    { key: "priest-login", label: "الآباء الكهنة" }
  ];

  return (
    <div dir="rtl" className="font-body relative min-h-screen flex items-center justify-center overflow-hidden py-10 bg-[var(--ink)]">
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

        select option { background: var(--panel); color: var(--parchment); }
      `}</style>

      {/* Background */}
      <Image src="/background.png" alt="" fill priority className="object-cover opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,166,107,0.10),transparent_55%),linear-gradient(180deg,#070a11_0%,#0a0e18_55%,#070a11_100%)]" />
      <div className="absolute -top-24 right-1/2 translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[var(--gold)]/[0.05] blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-5 sm:px-6">
        <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.045] backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] p-6 sm:p-9">
          <CornerFrame tone="gold" />

          <div className="flex flex-col items-center text-center">
            <FlameMark />
            <Image src="/Logo.png" alt="Logo" width={64} height={64} priority className="mt-4 w-14 h-auto opacity-90" />
            <span className="mt-5 text-[11px] tracking-[0.25em] text-[var(--gold)] font-semibold uppercase">حجز مواعيد الاعتراف</span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--parchment)] mt-2">
              {form === "register" ? "إنشاء حساب" : form === "login" ? "تسجيل الدخول" : "دخول الآباء الكهنة"}
            </h1>
            <p className="text-sm text-[var(--mist)] mt-2 max-w-[26rem]">
              {form === "register"
                ? "أنشئ حسابك لتتمكن من حجز موعدك بسهولة"
                : form === "login"
                ? "سجّل الدخول لمتابعة حجوزاتك"
                : "بوابة خاصة بالآباء الكهنة لإدارة المواعيد"}
            </p>
          </div>

          {/* Tabs */}
          <div className="mt-7 grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/25 border border-white/5">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setForm(t.key)}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  form === t.key
                    ? "bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] text-[#151016] shadow-[0_6px_16px_-4px_rgba(201,166,107,0.55)]"
                    : "text-[var(--mist)] hover:text-[var(--parchment)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {form === "register" && (
            <form onSubmit={register} className="mt-7 flex flex-col gap-3.5">
              <input type="text" placeholder="الاسم الثلاثي" className={inputStyle} value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})} required />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--mist)] mb-1.5 pr-1">تاريخ الميلاد</label>
                  <input type="date" className={inputStyle} value={regData.birthDate} onChange={e => setRegData({...regData, birthDate: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--mist)] mb-1.5 pr-1">رقم الهاتف</label>
                  <input type="tel" placeholder="رقم الهاتف" className={inputStyle} value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} required />
                </div>
              </div>

              <input type="text" placeholder="العنوان" className={inputStyle} value={regData.address} onChange={e => setRegData({...regData, address: e.target.value})} required />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--mist)] mb-1.5 pr-1">المرحلة الدراسية</label>
                  <select className={selectStyle} value={regData.educationStage} onChange={e => setRegData({...regData, educationStage: e.target.value})} required>
                    <option value="" disabled>اختر المرحلة</option>
                    {EDUCATION_STAGES.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--mist)] mb-1.5 pr-1">الاجتماع</label>
                  <select className={selectStyle} value={regData.churchGroup} onChange={e => setRegData({...regData, churchGroup: e.target.value})} required>
                    <option value="" disabled>اختر الاجتماع</option>
                    {CHURCH_GROUPS.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="الوظيفة" className={inputStyle} value={regData.job} onChange={e => setRegData({...regData, job: e.target.value})} required />
                <input type="text" placeholder="الكنيسة" className={inputStyle} value={regData.church} onChange={e => setRegData({...regData, church: e.target.value})} required />
              </div>

              <div className="h-px w-full bg-white/10 my-1" />

              <input type="password" placeholder="كلمة المرور" className={inputStyle} value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} required />
              <input type="password" placeholder="تأكيد كلمة المرور" className={inputStyle} value={regData.confirmPassword} onChange={e => setRegData({...regData, confirmPassword: e.target.value})} required />

              <button type="submit" className="mt-2 rounded-2xl bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] text-[#151016] font-bold py-3.5 transition-all duration-200 shadow-[0_10px_25px_-8px_rgba(201,166,107,0.6)] hover:shadow-[0_14px_30px_-6px_rgba(201,166,107,0.75)] hover:-translate-y-0.5 active:translate-y-0">
                إنشاء الحساب
              </button>
              <p className="text-center text-sm text-[var(--mist)] mt-1">
                لديك حساب بالفعل؟{" "}
                <button type="button" onClick={() => setForm("login")} className="font-bold text-[var(--gold-bright)] hover:underline">
                  تسجيل الدخول
                </button>
              </p>
            </form>
          )}

          {form === "login" && (
            <form onSubmit={login} className="mt-7 flex flex-col gap-3.5">
              <input type="tel" placeholder="رقم الهاتف" className={inputStyle} onChange={e => setLogData({...logData, phone: e.target.value})} required />
              <input type="password" placeholder="كلمة المرور" className={inputStyle} onChange={e => setLogData({...logData, password: e.target.value})} required />
              <button type="submit" className="mt-2 rounded-2xl bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] text-[#151016] font-bold py-3.5 transition-all duration-200 shadow-[0_10px_25px_-8px_rgba(201,166,107,0.6)] hover:shadow-[0_14px_30px_-6px_rgba(201,166,107,0.75)] hover:-translate-y-0.5 active:translate-y-0">
                تسجيل الدخول
              </button>
              <p className="text-center text-sm text-[var(--mist)] mt-1">
                ليس لديك حساب؟{" "}
                <button type="button" onClick={() => setForm("register")} className="font-bold text-[var(--gold-bright)] hover:underline">
                  إنشاء حساب
                </button>
              </p>
            </form>
          )}

          {form === "priest-login" && (
            <form onSubmit={priestLogin} className="mt-7 flex flex-col gap-3.5">
              <input type="text" placeholder="اسم الكاهن" className={inputStyle} onChange={e => setPriestData({...priestData, name: e.target.value})} required />
              <input type="password" placeholder="كلمة المرور" className={inputStyle} onChange={e => setPriestData({...priestData, password: e.target.value})} required />
              <button type="submit" className="mt-2 rounded-2xl bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] text-[#151016] font-bold py-3.5 transition-all duration-200 shadow-[0_10px_25px_-8px_rgba(201,166,107,0.6)] hover:shadow-[0_14px_30px_-6px_rgba(201,166,107,0.75)] hover:-translate-y-0.5 active:translate-y-0">
                دخول الأب الكاهن
              </button>
              <p className="text-center text-sm text-[var(--mist)] mt-1">
                لست كاهنًا؟{" "}
                <button type="button" onClick={() => setForm("login")} className="font-bold text-[var(--gold-bright)] hover:underline">
                  تسجيل دخول الأفراد
                </button>
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-[var(--mist)]/70 mt-6 tracking-wide">
          سرّ الاعتراف · حجز آمن ومباشر
        </p>
      </div>
    </div>
  );
}
