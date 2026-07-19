"use client";

// W3: x402 照会デモ (電力会社役)
// ダッシュボードから /api/inquiry/demo を叩き、
// 402 → USDC支払い → 証明取得 → ユーザー還元 の一連の流れを演出する。
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DemoResult = {
  mode: "live" | "simulated";
  price: string;
  network: string;
  rebateRatio: number;
  payer: string;
  payment: unknown;
  data: {
    subject: string;
    verified: boolean;
    months: number;
    lateCount: number;
    signatureValid: boolean;
  };
};

type Phase = "idle" | "request" | "pay" | "fetch" | "done" | "error";

const PHASE_STEPS: { key: Phase; label: string }[] = [
  { key: "request", label: "GET /api/inquiry → 402 Payment Required" },
  { key: "pay", label: "USDC $0.01 を支払い (Base Sepolia)" },
  { key: "fetch", label: "200 OK — 署名付き証明を取得" },
];

export function InquiryDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<DemoResult | null>(null);

  const run = async () => {
    setResult(null);
    setPhase("request");
    // 演出: フェーズを順に進めながらAPIを実行
    const timer1 = setTimeout(() => setPhase("pay"), 900);
    try {
      const res = await fetch("/api/inquiry/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId: "taro" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as DemoResult;
      clearTimeout(timer1);
      setPhase("pay");
      setTimeout(() => setPhase("fetch"), 900);
      setTimeout(() => {
        setResult(json);
        setPhase("done");
      }, 1800);
    } catch (e) {
      clearTimeout(timer1);
      console.error(e);
      setPhase("error");
    }
  };

  const stepIndex =
    phase === "request" ? 0 : phase === "pay" ? 1 : phase === "fetch" ? 2 : 3;
  const rebate = result
    ? `$${(0.01 * result.rebateRatio).toFixed(3)}`
    : "$0.003";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">x402 照会デモ</CardTitle>
          {result && (
            <Badge
              variant={result.mode === "live" ? "default" : "outline"}
              className="font-mono text-xs"
            >
              {result.mode === "live" ? "on-chain 決済" : "シミュレーション"}
            </Badge>
          )}
        </div>
        <CardDescription>
          電力会社が証明を1件照会するたびに $0.01 のマイクロペイメントが発生し、
          その{Math.round(0.3 * 100)}%がデータ主であるユーザーへ即時還元されます。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {phase === "idle" && (
          <Button onClick={run} className="self-start">
            誠実 太郎さんの証明を照会する（$0.01）
          </Button>
        )}

        {phase !== "idle" && (
          <ol className="flex flex-col gap-2 font-mono text-xs">
            {PHASE_STEPS.map((s, i) => (
              <li
                key={s.key}
                className={
                  i < stepIndex
                    ? "text-primary"
                    : i === stepIndex && phase !== "done" && phase !== "error"
                      ? "text-foreground animate-pulse"
                      : "text-muted-foreground/50"
                }
              >
                {i < stepIndex ? "✓" : i === stepIndex ? "▸" : "・"} {s.label}
              </li>
            ))}
          </ol>
        )}

        {phase === "error" && (
          <p className="text-sm text-destructive">
            照会に失敗しました。再度お試しください。
          </p>
        )}

        {phase === "done" && result && (
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Badge className="font-mono text-xs">✓ 署名検証済み</Badge>
              <span className="text-sm font-medium">
                {result.data.subject} — {result.data.months}ヶ月 延滞なし
              </span>
            </div>
            <div className="grid gap-1 font-mono text-xs text-muted-foreground">
              <span>照会料: {result.price}（照会者: {result.payer.slice(0, 10)}…）</span>
              <span>ネットワーク: {result.network}（Base Sepolia）</span>
              <span className="text-primary">
                → ユーザーへ {rebate} を即時還元
                {result.mode === "simulated" && "（演出）"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              自分の支払いデータが参照されるたびに、ユーザー自身が稼げる——
              これがPayProofの目指す「データ主権型の与信」です。
            </p>
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => {
                setPhase("idle");
                setResult(null);
              }}
            >
              もう一度実行
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
