"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.user?.role === "EMPLOYER") {
          window.location.href = "/employer";
        } else if (data.user?.role === "ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        setError(data.error || "Identifiants invalides.");
      }
    } catch {
      setError("Erreur réseau lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-[#0F172A] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white mb-4 shadow-md border border-slate-700/50">
              <Sparkles className="h-7 w-7 text-amber-400" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Connexion à JobFinder AI</h1>
            <p className="text-xs font-semibold text-slate-500 mt-1.5">
              Accédez à vos candidatures, opportunités sauvegardées et profil
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-xs font-semibold text-red-700 mb-6 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-800 font-bold block mb-1.5 uppercase text-[11px] tracking-wider">
                Adresse email
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] pl-10 pr-3.5 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-800 font-bold block mb-1.5 uppercase text-[11px] tracking-wider">
                Mot de passe
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] pl-10 pr-3.5 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3.5 font-black text-sm text-white shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Connexion..." : "Se connecter"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs font-semibold text-slate-600">
            Pas encore de compte ?{" "}
            <Link href="/auth/register" className="text-blue-600 hover:underline font-bold">
              Inscrivez-vous gratuitement
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
