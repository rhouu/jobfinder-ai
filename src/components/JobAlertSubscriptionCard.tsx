"use client";

import React, { useState } from "react";
import { BellRing, CheckCircle2, Sparkles, AlertCircle, Send } from "lucide-react";

export function JobAlertSubscriptionCard() {
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Informatique & Tech");
  const [city, setCity] = useState("Casablanca / Télétravail");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Veuillez saisir une adresse email valide.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, category, city }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || "Alerte activée avec succès !");
        setEmail("");
      } else {
        setErrorMsg(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setErrorMsg("Connexion impossible avec le service d'alertes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-blue-600 text-white">
          <BellRing className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-900 leading-tight">
            Alerte Emploi & PFE par Email
          </h3>
          <p className="text-[11px] text-slate-500">
            Recevez chaque matin les nouvelles offres selon vos critères.
          </p>
        </div>
      </div>

      {successMsg ? (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Votre Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@domaine.com"
              required
              className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Filière / Domaine
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] px-2 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="Informatique & Tech">Tech & IT</option>
                <option value="Data & Intelligence Artificielle">Data / IA</option>
                <option value="Stages & PFE">Stages & PFE</option>
                <option value="Banque & Fintech">Banque / Finance</option>
                <option value="Industrie & Ingénierie">Ingénierie</option>
                <option value="Marketing & Digital">Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Localisation
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] px-2 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="Casablanca / Télétravail">Casablanca / Remote</option>
                <option value="Rabat / Salé">Rabat / Salé</option>
                <option value="Tanger / Fès">Tanger / Fès</option>
                <option value="Marrakech">Marrakech</option>
                <option value="Tout le Maroc">Tout le Maroc</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 px-3 text-xs font-bold text-white shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Activation en cours...</span>
            ) : (
              <>
                <Send className="h-3.5 w-3.5 text-white" />
                <span>Activer mon Alerte Gratuite</span>
              </>
            )}
          </button>
          <p className="text-[10px] text-slate-400 text-center">
            Désinscription en 1 clic à tout moment. Garanti sans spam.
          </p>
        </form>
      )}
    </div>
  );
}
