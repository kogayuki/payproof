// 信用証明（簡易VC）の発行・検証
// MVP: サーバー秘密鍵によるJWS(HS256)。本番ではDID/VC-JWT + 非対称鍵に置き換える。
import { SignJWT, jwtVerify, decodeJwt } from "jose";
import type { ScoreResult, Tier } from "./scoring";

const secret = new TextEncoder().encode(
  process.env.CREDENTIAL_SECRET ?? "payproof-demo-secret-do-not-use-in-prod"
);

export const ISSUER = "https://payproof.example/issuer";

// 証明に載せるのはティアと実績月数のみ。
// 生の延滞回数・日数は本人の画面にだけ表示し、事業者へは渡さない（将来のZKP方針と整合）。
export type CredentialClaims = {
  sub: string; // 被証明者（デモではペルソナ名）
  tier: Tier;
  months: number;
  verified: boolean; // 実績を検証できたか
  iss: string;
  iat?: number;
  exp?: number;
};

export async function issueCredential(
  subject: string,
  score: ScoreResult
): Promise<string> {
  return new SignJWT({
    tier: score.tier,
    months: score.months,
    verified: score.verified,
  })
    .setProtectedHeader({ alg: "HS256", typ: "vc+jwt" })
    .setSubject(subject)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime("90d")
    .sign(secret);
}

export async function verifyCredential(
  jws: string
): Promise<{ valid: boolean; claims: CredentialClaims | null }> {
  try {
    const { payload } = await jwtVerify(jws, secret, { issuer: ISSUER });
    return { valid: true, claims: payload as unknown as CredentialClaims };
  } catch {
    return { valid: false, claims: null };
  }
}

export function decodeCredential(jws: string): CredentialClaims | null {
  try {
    return decodeJwt(jws) as unknown as CredentialClaims;
  } catch {
    return null;
  }
}
