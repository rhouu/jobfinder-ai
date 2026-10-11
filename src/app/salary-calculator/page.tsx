"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Calculator,
  Coins,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

export default function SalaryCalculatorPage() {
  const [grossSalary, setGrossSalary] = useState<number>(10000);
  const [cadre, setCadre] = useState<boolean>(true);
  const [dependents, setDependents] = useState<number>(0); // Personnes à charge (30 DH par personne, max 6)

  // Calcul barème marocain officiel :
  // 1. CNSS salariale : 4.48% plafonné à 6000 DH/mois -> max 268.80 DH
  const cnssBasis = Math.min(grossSalary, 6000);
  const cnss = cnssBasis * 0.0448;

  // 2. AMO salariale : 2.26% non plafonné
  const amo = grossSalary * 0.0226;

  // 3. Frais professionnels : 35% pour salaire brut <= 78000/an ou 25% au-delà, plafonné à 35 000 DH/an (2916.67 DH/mois)
  const fraisPro = Math.min(grossSalary * 0.35, 2916.67);

  // 4. Salaire Net Imposable (SNI)
  const sni = Math.max(0, grossSalary - cnss - amo - fraisPro);

  // 5. Barème IR Maroc Mensuel :
  // 0 - 2 500 DH : 0%
  // 2 501 - 4 166.67 DH : 10% (somme à déduire : 250)
  // 4 167 - 5 000 DH : 20% (somme à déduire : 666.67)
  // 5 001 - 6 666.67 DH : 30% (somme à déduire : 1 166.67)
  // 6 667 - 15 000 DH : 34% (somme à déduire : 1 433.33)
  // > 15 000 DH : 38% (somme à déduire : 2 033.33)
  let irBrut = 0;
  if (sni <= 2500) {
    irBrut = 0;
  } else if (sni <= 4166.67) {
    irBrut = sni * 0.10 - 250;
  } else if (sni <= 5000) {
    irBrut = sni * 0.20 - 666.67;
  } else if (sni <= 6666.67) {
    irBrut = sni * 0.30 - 1166.67;
  } else if (sni <= 15000) {
    irBrut = sni * 0.34 - 1433.33;
  } else {
    irBrut = sni * 0.38 - 2033.33;
  }
  irBrut = Math.max(0, irBrut);

  // Déductions pour charges de famille (30 DH par personne à charge, max 180 DH/mois)
  const deductionFamille = Math.min(dependents * 30, 180);
  const irNet = Math.max(0, irBrut - deductionFamille);

  // Salaire Net à payer
  const netSalary = Math.max(0, grossSalary - cnss - amo - irNet);

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-[#0D2B45] flex flex-col">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-[#0D2B45] text-white py-12 px-4 sm:px-8 lg:px-14">
        <div className="max-w-5xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-cyan-200 border border-white/15">
            <Calculator className="h-4 w-4 text-cyan-300" />
            <span>Outil d&apos;orientation & transparence salariale</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Simulateur de Salaire Brut & Net au Maroc (MAD)
          </h1>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl mx-auto">
            Calculez votre salaire net mensuel selon le Code Général des Impôts marocain et les cotisations CNSS & AMO en vigueur.
          </p>
        </div>
      </section>

      {/* Calculator Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="md:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-[#0D2B45] flex items-center gap-2">
              <Coins className="h-5 w-5 text-[#1E5A6E]" />
              Vos Paramètres Salariaux
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Salaire Brut Mensuel (en Dirhams MAD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-base font-black text-[#0D2B45] focus:outline-none focus:border-[#0D2B45]"
                />
                <span className="absolute right-4 top-3.5 text-xs font-black text-slate-400">
                  MAD / mois
                </span>
              </div>
              <input
                type="range"
                min="3000"
                max="60000"
                step="500"
                value={grossSalary}
                onChange={(e) => setGrossSalary(Number(e.target.value))}
                className="w-full accent-[#0D2B45] mt-2 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                <span>3 000 DH (SMIG)</span>
                <span>30 000 DH</span>
                <span>60 000 DH+</span>
              </div>
            </div>

            {/* Quick Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Repères marché marocain :
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Junior / Débutant", val: 7000 },
                  { label: "Confirmé (3-5 ans)", val: 14000 },
                  { label: "Sénior / Lead", val: 25000 },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setGrossSalary(chip.val)}
                    className="rounded-lg bg-slate-100 hover:bg-[#E6F0F6] hover:text-[#0D2B45] px-3 py-1 text-xs font-semibold text-slate-600 transition-colors"
                  >
                    {chip.label} ({chip.val.toLocaleString()} DH)
                  </button>
                ))}
              </div>
            </div>

            {/* Dependents */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">
                Personnes à charge (Enfants / Conjoint sans revenu)
              </label>
              <select
                value={dependents}
                onChange={(e) => setDependents(Number(e.target.value))}
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0D2B45] focus:outline-none"
              >
                <option value={0}>0 personne (Célibataire / sans charge)</option>
                <option value={1}>1 personne (-30 DH IR)</option>
                <option value={2}>2 personnes (-60 DH IR)</option>
                <option value={3}>3 personnes (-90 DH IR)</option>
                <option value={4}>4 personnes (-120 DH IR)</option>
                <option value={5}>5 personnes (-150 DH IR)</option>
                <option value={6}>6 personnes et plus (-180 DH IR)</option>
              </select>
            </div>
          </div>

          {/* Results Summary Column */}
          <div className="md:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-[#0D2B45] to-[#1E5A6E] text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-6">
              <div>
                <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider block">
                  Estimation Salaire Net
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                  {Math.round(netSalary).toLocaleString("fr-FR")} <span className="text-xl">MAD</span>
                </div>
                <span className="text-xs text-slate-200 mt-1 block">
                  Net à payer par mois dans votre compte bancaire
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/15">
                <div className="bg-white/10 p-3 rounded-2xl">
                  <span className="text-[11px] text-slate-300 block">Taux net / brut</span>
                  <span className="text-base font-black text-white">
                    {grossSalary > 0 ? `${Math.round((netSalary / grossSalary) * 100)}%` : "0%"}
                  </span>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl">
                  <span className="text-[11px] text-slate-300 block">Total Prélèvements</span>
                  <span className="text-base font-black text-white">
                    {Math.round(grossSalary - netSalary).toLocaleString("fr-FR")} DH
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions Breakdown Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-black text-[#0D2B45] uppercase tracking-wider">
                Détail des Cotisations & Impôts
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Salaire Brut de base :</span>
                  <strong className="text-[#0D2B45]">{grossSalary.toLocaleString()} MAD</strong>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <div>
                    <span className="text-slate-600 block">Cotisation CNSS (4.48%) :</span>
                    <span className="text-[10px] text-slate-400">Plafond 6 000 DH</span>
                  </div>
                  <span className="text-rose-700 font-bold">- {Math.round(cnss).toLocaleString()} MAD</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <div>
                    <span className="text-slate-600 block">Assurance Maladie AMO (2.26%) :</span>
                    <span className="text-[10px] text-slate-400">Non plafonnée</span>
                  </div>
                  <span className="text-rose-700 font-bold">- {Math.round(amo).toLocaleString()} MAD</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <div>
                    <span className="text-slate-600 block">Impôt sur le Revenu (IR Net) :</span>
                    <span className="text-[10px] text-slate-400">Barème progressif CGI Maroc</span>
                  </div>
                  <span className="text-rose-700 font-bold">- {Math.round(irNet).toLocaleString()} MAD</span>
                </div>

                <div className="flex justify-between items-center pt-3 text-sm font-black text-emerald-800">
                  <span>Salaire Net Perçu :</span>
                  <span>{Math.round(netSalary).toLocaleString()} MAD</span>
                </div>
              </div>
            </div>

            {/* Next Steps / Find jobs with this salary */}
            <div className="p-5 rounded-2xl bg-[#E6F0F6] border border-[#B7D4E6] flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black text-[#0D2B45]">
                  Vous cherchez des opportunités avec ce salaire ?
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Explorez les postes correspondants sur JobFinder AI.
                </p>
              </div>
              <Link
                href={`/jobs?sort=salary`}
                className="rounded-xl bg-[#0D2B45] hover:bg-[#1E5A6E] px-4 py-2 text-xs font-bold text-white transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>Voir les offres</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
