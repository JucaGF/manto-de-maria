import { NextResponse } from "next/server";
import { listParticipants } from "@/lib/repository";

export async function GET() {
  try {
    const participants = await listParticipants();
    return NextResponse.json({ participants });
  } catch (error) {
    console.error("Failed to list participants", error);
    return NextResponse.json(
      { message: "Não foi possível carregar os participantes." },
      { status: 500 },
    );
  }
}
