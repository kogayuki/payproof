"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { personas, type Persona } from "@/lib/mock-bank";
import { scorePayments, DEFAULT_DEPOSIT, type ScoreResult } from "@/lib/scoring";

type Step = "form" | "consent" | "connect" | "verifying" | "result";

export default function ApplyPage() {
  const [step, setStep] = useState<Step>("form");
  const [disclosed, setDisclosed] = useState<boolean | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);

  const score: ScoreResult | null = useMemo(
    () => (persona ? scorePayments(persona.transactions) : null),
    [persona]
  );

  return (
    <main className="flex-1 mx-auto w-full max-w-xl px-6 py-10 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-mono text-sm text-muted-foreground">
          ← PayProof
        </Link>
        <Badge variant="outline" className="font-mono">
          電力契約デモ
        </Badge>
      </header>

      <StepIndicator step={step} />

      {step === "form" && (
        <Card>
          <CardHeader>
            <CardTitle>でんきの新規お申し込み</CardTitle>
            <CardDescription>
              お引っ越し先の電力契約に必要な情報を入力してください（デモのためダミーでOK）
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">お名前</Label>
              <Input id="name" placeholder="山田 太郎" defaultValue="山田 太郎" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">ご住所</Label>
              <Input
                id="address"
                placeholder="東京都渋谷区…"
                defaultValue="東京都渋谷区神南1-2-3"
              />
            </div>
            <Button className="mt-2" onClick={() => setStep("consent")}>
              次へ
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "consent" && (
        <Card>
          <CardHeader>
            <CardTitle>支払い履歴を開示して、特典を受けますか？</CardTitle>
            <CardDescription>
              過去の公共料金のお支払い実績を開示すると、審査が優遇されます。開示は完全に任意です。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <button
              className="rounded-lg border border-primary/50 bg-primary/10 p-4 text-left transition hover:bg-primary/20"
              onClick={() => {
                setDisclosed(true);
                setStep("connect");
              }}
            >
              <p className="font-semibold">開示して特典を受ける</p>
              <p className="text-sm text-muted-foreground">
                無延滞が確認できた場合、保証金 ¥{DEFAULT_DEPOSIT.toLocaleString()}
                が全額免除されます
              </p>
            </button>
            <button
              className="rounded-lg border border-border p-4 text-left transition hover:bg-muted"
              onClick={() => {
                setDisclosed(false);
                setPersona(null);
                setStep("result");
              }}
            >
              <p className="font-semibold">開示しない</p>
              <p className="text-sm text-muted-foreground">
                通常の審査となり、保証金のお預かりが必要になる場合があります
              </p>
            </button>
            <p className="text-xs text-muted-foreground">
              開示いただくのは「公共料金の支払い実績」のみです。明細の内容や残高が電力会社に共有されることはありません。
            </p>
          </CardContent>
        </Card>
      )}

      {step === "connect" && (
        <Card>
          <CardHeader>
            <CardTitle>銀行口座と連携</CardTitle>
            <CardDescription>
              デモ用のペルソナを選択してください。実サービスでは本人の銀行API連携（電子決済等代行）に置き換わります。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {personas.map((p) => (
              <button
                key={p.id}
                className="rounded-lg border border-border p-4 text-left transition hover:bg-muted"
                onClick={() => {
                  setPersona(p);
                  setStep("verifying");
                }}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{p.name}</p>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {p.bank}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{p.label}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === "verifying" && persona && (
        <VerifyingCard persona={persona} onDone={() => setStep("result")} />
      )}

      {step === "result" && (
        <ResultCard disclosed={disclosed} persona={persona} score={score} />
      )}
    </main>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: { key: Step[]; label: string }[] = [
    { key: ["form"], label: "申込" },
    { key: ["consent"], label: "開示選択" },
    { key: ["connect", "verifying"], label: "検証" },
    { key: ["result"], label: "結果" },
  ];
  const activeIndex = steps.findIndex((s) => s.key.includes(step));
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-2 flex-1">
          <div
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-mono ${
              i <= activeIndex
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}
          </div>
          <span
            className={`text-xs ${
              i <= activeIndex ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && <Separator className="flex-1" />}
        </div>
      ))}
    </div>
  );
}

const VERIFY_MESSAGES = [
  "銀行口座に安全に接続しています…",
  "入出金明細を取得しています…",
  "公共料金の支払いを抽出しています…",
  "支払い実績を検証しています…",
];

function VerifyingCard({
  persona,
  onDone,
}: {
  persona: Persona;
  onDone: () => void;
}) {
  const [messageIndex, setMessageIndex] = useState(0);
  const utilityTxs = persona.transactions.filter((t) => t.isUtility);

  useEffect(() => {
    if (messageIndex >= VERIFY_MESSAGES.length) {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setMessageIndex((i) => i + 1), 800);
    return () => clearTimeout(t);
  }, [messageIndex, onDone]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-primary" />
          支払い実績を検証中
        </CardTitle>
        <CardDescription>{persona.bank} — {persona.name} 様</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 font-mono text-sm">
        {VERIFY_MESSAGES.slice(0, messageIndex + 1).map((m, i) => (
          <p
            key={m}
            className={
              i === messageIndex ? "text-foreground" : "text-muted-foreground"
            }
          >
            {i < messageIndex ? "✓" : "…"} {m}
          </p>
        ))}
        {messageIndex >= 2 && (
          <p className="text-xs text-muted-foreground pt-2">
            電気料金の引き落とし {utilityTxs.length} 件を検出
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ResultCard({
  disclosed,
  persona,
  score,
}: {
  disclosed: boolean | null;
  persona: Persona | null;
  score: ScoreResult | null;
}) {
  // 非開示パターン
  if (!disclosed || !persona || !score) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>お申し込みを受け付けました</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Alert>
            <AlertTitle>保証金のお預かりが必要です</AlertTitle>
            <AlertDescription>
              お支払い実績を確認できないため、通常審査となります。ご契約には保証金
              ¥{DEFAULT_DEPOSIT.toLocaleString()}（予想料金3ヶ月分）のお預かりが必要です。
            </AlertDescription>
          </Alert>
          <p className="text-xs text-muted-foreground">
            ※ 開示はいつでも選択できます。無延滞が確認できれば保証金は全額免除されます。
          </p>
          <RestartButton />
        </CardContent>
      </Card>
    );
  }

  // 開示 → 無延滞（善良ペルソナ）
  if (score.verified) {
    return (
      <Card className="border-primary/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge className="font-mono">✓ 検証済み</Badge>
            <Badge variant="secondary" className="font-mono">
              {score.months}ヶ月 延滞なし
            </Badge>
          </div>
          <CardTitle className="pt-2">
            おめでとうございます、{persona.name} 様
          </CardTitle>
          <CardDescription>
            {score.months}ヶ月分の公共料金支払いを検証し、すべて期日内のお支払いを確認しました。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg bg-primary/10 p-6 text-center">
            <p className="text-sm text-muted-foreground">ご契約時の保証金</p>
            <p className="text-3xl font-bold tracking-tight">
              <span className="text-muted-foreground line-through text-xl mr-3">
                ¥{DEFAULT_DEPOSIT.toLocaleString()}
              </span>
              ¥0
            </p>
            <p className="text-sm text-primary pt-1">全額免除されました</p>
          </div>
          <ScoreDetail score={score} />
          <RestartButton />
        </CardContent>
      </Card>
    );
  }

  // 開示 → 延滞あり（延滞ペルソナ）
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="font-mono">
            延滞 {score.lateCount} 回
          </Badge>
        </div>
        <CardTitle className="pt-2">お申し込みを受け付けました</CardTitle>
        <CardDescription>
          お支払い実績を確認しましたが、リワードの適用基準を満たしませんでした。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Alert variant="destructive">
          <AlertTitle>保証金のお預かりが必要です</AlertTitle>
          <AlertDescription>
            直近{score.months}ヶ月で{score.lateCount}回の延滞（最長
            {score.maxDaysLate}日）が確認されたため、保証金 ¥
            {DEFAULT_DEPOSIT.toLocaleString()} のお預かりが必要です。
          </AlertDescription>
        </Alert>
        <ScoreDetail score={score} />
        <RestartButton />
      </CardContent>
    </Card>
  );
}

function ScoreDetail({ score }: { score: ScoreResult }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="rounded-lg border border-border p-3">
        <p className="text-xs text-muted-foreground">検証期間</p>
        <p className="font-mono font-semibold">{score.months}ヶ月</p>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="text-xs text-muted-foreground">期日内支払い</p>
        <p className="font-mono font-semibold">{score.onTimeCount}回</p>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="text-xs text-muted-foreground">延滞（30日以上）</p>
        <p className="font-mono font-semibold">{score.lateCount}回</p>
      </div>
    </div>
  );
}

function RestartButton() {
  return (
    <Button variant="outline" render={<Link href="/apply" />}>
      最初からやり直す
    </Button>
  );
}
