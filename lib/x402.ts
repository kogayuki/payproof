// x402 v2 設定 (W3)
// 照会API (/api/inquiry) を $0.01/リクエストで保護する。
// env が未設定の場合は「シミュレーションモード」に自動フォールバックし、
// デモを止めない（企画書のデリスク方針: E2E不通なら画面演出に降格）。
import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

// Base Sepolia (テストネット)
export const NETWORK = "eip155:84532";
export const INQUIRY_PRICE = "$0.01";
// 照会料のうちユーザーへ即時還元する割合（デモ演出用の表示値）
export const USER_REBATE_RATIO = 0.3;

// 表示は円建て（JPYC）。JPYCはEIP-3009準拠でx402互換だが、Baseには未展開のため
// デモの実課金レールはBase Sepolia（simulated）のまま、UI表示のみJPYC建てにする。
// 本番はJPYC対応チェーン（Ethereum / Polygon / Avalanche）で置き換え予定。
export const INQUIRY_PRICE_JPYC = 1; // 1 JPYC（≒¥1）/ 照会
export const USER_REBATE_JPYC = INQUIRY_PRICE_JPYC * USER_REBATE_RATIO; // 0.3 JPYC

export const FACILITATOR_URL =
  process.env.X402_FACILITATOR_URL ?? "https://facilitator.x402.org";

// 受け取りアドレス（PayProof運営側のウォレット）
export const payTo = process.env.X402_PAY_TO_ADDRESS as
  | `0x${string}`
  | undefined;

// 買い手（電力会社役のデモウォレット）の秘密鍵
export const buyerPrivateKey = process.env.X402_BUYER_PRIVATE_KEY as
  | `0x${string}`
  | undefined;

// 実決済モードが有効か（受け取りアドレスが設定されていれば課金を有効化）
export const x402Enabled = Boolean(payTo);

export function createResourceServer() {
  const facilitatorClient = new HTTPFacilitatorClient({
    url: FACILITATOR_URL,
  });
  return new x402ResourceServer(facilitatorClient).register(
    NETWORK,
    new ExactEvmScheme()
  );
}
