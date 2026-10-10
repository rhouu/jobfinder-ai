import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runJobSourcesSync } from "@/lib/sources/sync-manager";

export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès strictement réservé aux administrateurs." }, { status: 403 });
    }

    const syncResult = await runJobSourcesSync();
    return NextResponse.json({ success: true, ...syncResult });
  } catch (error) {
    console.error("Admin sync error:", error);
    return NextResponse.json({ error: "Erreur lors de la synchronisation des sources." }, { status: 500 });
  }
}
