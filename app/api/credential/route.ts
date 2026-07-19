import { NextResponse } from "next/server";
import { getPersona } from "@/lib/mock-bank";
import { scorePayments } from "@/lib/scoring";
import { issueCredential } from "@/lib/credential";

// 信用証明の発行: 検証済みの支払い実績からJWS（簡易VC）を発行する
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    personaId?: string;
  } | null;
  const persona = body?.personaId ? getPersona(body.personaId) : undefined;
  if (!persona) {
    return NextResponse.json({ error: "unknown persona" }, { status: 400 });
  }
  const score = scorePayments(persona.transactions);
  const jws = await issueCredential(persona.name, score);
  return NextResponse.json({
    jws,
    claims: {
      sub: persona.name,
      tier: score.tier,
      months: score.months,
      verified: score.verified,
    },
  });
}
