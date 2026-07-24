"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AuthPage() {
  const [form, setForm] = useState("register");
  const router = useRouter();

  const [regData, setRegData] = useState({ fullName: "", birthDate: "", phone: "", password: "", confirmPassword: "" });
  const [logData, setLogData] = useState({ phone: "", password: "" });
  const [priestData, setPriestData] = useState({ name: "", password: "" });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      router.replace(`/user-dashboard?userId=${user.id}`);
      return;
    }

    const savedPriest = localStorage.getItem("priest");
    if (savedPriest) {
      const priest = JSON.parse(savedPriest);
      router.replace(`/priest-dashboard?name=${encodeURIComponent(priest.name)}`);
    }
  }, []);

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
      localStorage.setItem("user", JSON.stringify({ id: data.userId, fullName: regData.fullName }));
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
      localStorage.setItem("user", JSON.stringify(data.user));
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
      localStorage.setItem("priest", JSON.stringify(data.priest));
      router.push(`/priest-dashboard?name=${encodeURIComponent(data.priest.name)}`);
    } else {
      alert(data.error);
    }
  }

  const inputStyle =
    "w-full rounded-2xl bg-white/10 border border-white/15 px-4 py-3 text-white placeholder:text-gray-300 outline-none transition focus:border-white/40 focus:bg-white/15";

  return (
    <div dir="rtl" className="relative min-h-screen flex items-center justify-center overflow-hidden py-10">
      <Image src="/background.png" alt="Background" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />
      <div className="relative z-10 w-full max-w-md px-5 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col items-center">
            <Image src="/Logo.png" alt="Logo" width={170} height={170} priority className="mb-4 w-36 sm:w-44 md:w-48 h-auto" />
            <h1 className="text-3xl font-bold text-white text-center">
              {form === "register" ? "إنشاء حساب" : form === "login" ? "تسجيل الدخول" : "دخول الآباء الكهنة"}
            </h1>
          </div>

          {form === "register" && (
            <form onSubmit={register} className="mt-8 flex flex-col gap-4">
              <input type="text" placeholder="الاسم الثلاثي" className={inputStyle} onChange={e => setRegData({...regData, fullName: e.target.value})} required />
              <input type="date" className={inputStyle} onChange={e => setRegData({...regData, birthDate: e.target.value})} required />
              <input type="tel" placeholder="رقم الهاتف" className={inputStyle} onChange={e => setRegData({...regData, phone: e.target.value})} required />
              <input type="password" placeholder="كلمة المرور" className={inputStyle} onChange={e => setRegData({...regData, password: e.target.value})} required />
              <input type="password" placeholder="تأكيد كلمة المرور" className={inputStyle} onChange={e => setRegData({...regData, confirmPassword: e.target.value})} required />
              <button type="submit" className="mt-2 rounded-2xl bg-white text-slate-900 font-bold py-3 transition hover:bg-gray-100">إنشاء الحساب</button>
              <div className="flex flex-col gap-2 mt-2 text-center text-sm">
                <p className="text-gray-200">لديك حساب بالفعل؟ <button type="button" onClick={() => setForm("login")} className="mr-2 font-bold text-white hover:underline">تسجيل الدخول</button></p>
                <button type="button" onClick={() => setForm("priest-login")} className="font-bold text-amber-300 hover:underline">دخول الآباء الكهنة</button>
              </div>
            </form>
          )}

          {form === "login" && (
            <form onSubmit={login} className="mt-8 flex flex-col gap-4">
              <input type="tel" placeholder="رقم الهاتف" className={inputStyle} onChange={e => setLogData({...logData, phone: e.target.value})} required />
              <input type="password" placeholder="كلمة المرور" className={inputStyle} onChange={e => setLogData({...logData, password: e.target.value})} required />
              <button type="submit" className="mt-2 rounded-2xl bg-white text-slate-900 font-bold py-3 transition hover:bg-gray-100">تسجيل الدخول</button>
              <div className="flex flex-col gap-2 mt-2 text-center text-sm">
                <p className="text-gray-200">ليس لديك حساب؟ <button type="button" onClick={() => setForm("register")} className="mr-2 font-bold text-white hover:underline">إنشاء حساب</button></p>
                <button type="button" onClick={() => setForm("priest-login")} className="font-bold text-amber-300 hover:underline">دخول الآباء الكهنة</button>
              </div>
            </form>
          )}

          {form === "priest-login" && (
            <form onSubmit={priestLogin} className="mt-8 flex flex-col gap-4">
              <input type="text" placeholder="اسم الكاهن" className={inputStyle} onChange={e => setPriestData({...priestData, name: e.target.value})} required />
              <input type="password" placeholder="كلمة المرور" className={inputStyle} onChange={e => setPriestData({...priestData, password: e.target.value})} required />
              <button type="submit" className="mt-2 rounded-2xl bg-white text-slate-900 font-bold py-3 transition hover:bg-gray-100">دخول الأب الكاهن</button>
              <div className="flex justify-center gap-4 mt-2 text-sm">
                <button type="button" onClick={() => setForm("login")} className="font-bold text-gray-200 hover:underline">تسجيل دخول الأفراد</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}