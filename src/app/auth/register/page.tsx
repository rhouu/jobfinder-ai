"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Sparkles, Mail, Lock, User, Building2, ArrowRight, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"CANDIDATE" | "EMPLOYER">("CANDIDATE");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          companyName: role === "EMPLOYER" ? companyName : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (role === "EMPLOYER") {
          window.location.href = "/employer";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        setError(data.error || "Erreur lors de l'inscription.");
      }
    } catch {
      setError("Erreur réseau lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-[#0F172A] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white mb-4 shadow-md border border-slate-700/50">
              <Sparkles className="h-7 w-7 text-amber-400" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Créer un compte JobFinder AI</h1>
            <p className="text-xs font-semibold text-slate-500 mt-1.5">
              Rejoignez la plateforme et découvrez des opportunités adaptées à votre profil
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-xs font-semibold text-red-700 mb-6 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => setRole("CANDIDATE")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === "CANDIDATE"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Candidat / Étudiant</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("EMPLOYER")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === "EMPLOYER"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Recruteur / Entreprise</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-800 font-bold block mb-1.5 uppercase text-[11px] tracking-wider">
                Nom complet
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Adam Mansouri"
                  className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] pl-10 pr-3.5 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0D2B45] focus:bg-white"
                />
              </div>
            </div>

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
                  className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] pl-10 pr-3.5 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0D2B45] focus:bg-white"
                />
              </div>
            </div>

            {role === "EMPLOYER" && (
              <div>
                <label className="text-slate-800 font-bold block mb-1.5 uppercase text-[11px] tracking-wider">
                  Nom de l&apos;entreprise
                </label>
                <div className="relative flex items-center">
                  <Building2 className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: OCP Group, Capgemini..."
                    className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] pl-10 pr-3.5 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0D2B45] focus:bg-white"
                  />
                </div>
              </div>
            )}

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
                  placeholder="Minimum 8 caractères"
                  className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] pl-10 pr-3.5 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0D2B45] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3.5 font-black text-sm text-white shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Création en cours..." : "Créer mon compte"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs font-semibold text-slate-600">
            Vous avez déjà un compte ?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline font-bold">
              Connectez-vous ici
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
