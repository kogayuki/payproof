// 信用照会API (W3)
// 電力会社などの照会者が、申込者の検証済み支払い実績を取得するエンドポイント。
// x402 で保護され、1照会 $0.01 (Base Sepolia USDC)。
// env未設定時は無課金のシミュレーションモードで応答する。
import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { getPersona } from "@/lib/mock-bank";
import { scorePayments } from "@/lib/scoring";
import { issueCredential, verifyCredential, ISSUER } from "@/lib/credential";
import {
  createResourceServer,
  x402Enabled,
  payTo,
  NETWORK,
  INQUIRY_PRICE,
} from "@/lib/x402";

async function handler(request: NextRequest): Promise<NextResponse> {
  const personaId = request.nextUrl.searchParams.get("personaId") ?? "";
  const persona = getPersona(personaId);
  if (!persona) {
    return NextResponse.json(
      { error: `unknown persona: ${personaId}` },
      { status: 400 }
    );
  }

  const score = scorePayments(persona.transactions);
  const jws = await issueCredential(persona.name, score);
  const { valid } = await verifyCredential(jws);

  return NextResponse.json({
    subject: persona.name,
    issuer: ISSUER,
    verified: score.verified,
    months: score.months,
    lateCount: score.lateCount,
    signatureValid: valid,
    jws,
    x402: { protected: x402Enabled, price: INQUIRY_PRICE, network: NETWORK },
  });
}

export const GET =
  x402Enabled && payTo
    ? withX402(
        handler,
        {
          accepts: {
            scheme: "exact",
            price: INQUIRY_PRICE,
            network: NETWORK,
            payTo,
          },
          description:
            "PayProof 信用照会API — 検証済み支払い実績の署名付き証明を返す",
        },
        createResourceServer()
      )
    : handler;
