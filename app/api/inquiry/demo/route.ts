// 照会デモ (W3) — 「電力会社役」の買い手ウォレットが
// x402 で /api/inquiry に支払いを行い、証明を取得する一連の流れを実行する。
// 買い手秘密鍵が未設定、または照会APIが非課金モードの場合はシミュレーションで応答。
import { NextRequest, NextResponse } from "next/server";
import {
  wrapFetchWithPaymentFromConfig,
  decodePaymentResponseHeader,
} from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
import {
  x402Enabled,
  buyerPrivateKey,
  NETWORK,
  INQUIRY_PRICE,
  USER_REBATE_RATIO,
} from "@/lib/x402";

export async function POST(request: NextRequest) {
  const { personaId } = (await request.json().catch(() => ({}))) as {
    personaId?: string;
  };
  const origin = request.nextUrl.origin;
  const inquiryUrl = `${origin}/api/inquiry?personaId=${encodeURIComponent(
    personaId ?? "taro"
  )}`;

  // 実決済モード: Base Sepolia USDC で $0.01 を支払って照会
  if (x402Enabled && buyerPrivateKey) {
    try {
      const account = privateKeyToAccount(buyerPrivateKey);
      const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
        schemes: [{ network: NETWORK, client: new ExactEvmScheme(account) }],
      });

      const response = await fetchWithPayment(inquiryUrl, { method: "GET" });
      const data = await response.json();

      const paymentHeader = response.headers.get("PAYMENT-RESPONSE");
      const payment = paymentHeader
        ? decodePaymentResponseHeader(paymentHeader)
        : null;

      return NextResponse.json({
        mode: "live" as const,
        price: INQUIRY_PRICE,
        network: NETWORK,
        rebateRatio: USER_REBATE_RATIO,
        payer: account.address,
        payment,
        data,
      });
    } catch (err) {
      // 決済失敗時もデモを止めず、シミュレーションに降格
      console.error("x402 payment failed, falling back to simulation:", err);
    }
  }

  // シミュレーションモード: 課金なしで照会し、決済演出用のダミー情報を付与
  const response = await fetch(inquiryUrl);
  const data = await response.json();
  return NextResponse.json({
    mode: "simulated" as const,
    price: INQUIRY_PRICE,
    network: NETWORK,
    rebateRatio: USER_REBATE_RATIO,
    payer: "0xDemoUtilityCompany",
    payment: null,
    data,
  });
}
