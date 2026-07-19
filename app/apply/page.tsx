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
import {
  scorePayments,
  DEFAULT_DEPOSIT,
  TIER_INFO,
  type ScoreResult,
} from "@/lib/scoring";

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
              <p className="font-semibold">開示して優遇条件を受ける</p>
              <p className="text-sm text-muted-foreground">
                実績に応じて保証金の全額免除・減額、審査即通過などの優遇が受けられます。履歴が短い方も実績構築プログラムの対象です
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
                標準初期条件（保証金 ¥{DEFAULT_DEPOSIT.toLocaleString()}
                のお預かり）でのご契約となります。開示は後からでも選べます
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
  // 非開示 → 標準初期条件（ペナルティではない）
  if (!disclosed || !persona || !score) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>お申し込みを受け付けました</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Alert>
            <AlertTitle>標準初期条件でのご契約となります</AlertTitle>
            <AlertDescription>
              お支払い実績を確認できないため、標準初期条件として保証金 ¥
              {DEFAULT_DEPOSIT.toLocaleString()}
              （予想料金3ヶ月分）のお預かりが必要です。
            </AlertDescription>
          </Alert>
          <p className="text-xs text-muted-foreground">
            ※
            開示は後からでも選択できます。実績が確認できれば、免除・減額などの優遇条件が適用されます。
          </p>
          <RestartButton />
        </CardContent>
      </Card>
    );
  }

  const info = TIER_INFO[score.tier];

  // 開示 → Aランク（全額免除）
  if (score.tier === "A") {
    return (
      <Card className="border-primary/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge className="font-mono">✓ Aランク</Badge>
            <Badge variant="secondary" className="font-mono">
              {score.months}ヶ月の実績・遅延なし
            </Badge>
          </div>
          <CardTitle className="pt-2">
            おめでとうございます、{persona.name} 様
          </CardTitle>
          <CardDescription>
            {score.months}
            ヶ月分の公共料金支払いを検証し、すべて期日内のお支払いを確認しました。審査は即時通過です。
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
          <CredentialBlock personaId={persona.id} />
          <RestartButton />
        </CardContent>
      </Card>
    );
  }

  // 開示 → 実績構築中（thin-file: 履歴12ヶ月未満）
  if (score.tier === "building") {
    return (
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              実績構築中
            </Badge>
            <Badge variant="outline" className="font-mono">
              {score.months}ヶ月の実績・遅延なし
            </Badge>
          </div>
          <CardTitle className="pt-2">
            実績構築プログラムが適用されました
          </CardTitle>
          <CardDescription>
            履歴が12ヶ月に満たないため通常のティア判定はまだできませんが、履歴が短いことは落ち度ではありません。
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
            <p className="text-sm text-primary pt-1">
              口座振替のご登録を条件に、保証金なしでご契約いただけます
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            このまま期日内のお支払いを続けると、実績12ヶ月の時点でAランクが自動判定されます。
          </p>
          <ScoreDetail score={score} />
          <CredentialBlock personaId={persona.id} />
          <RestartButton />
        </CardContent>
      </Card>
    );
  }

  // 開示 → B/Cランク（遅延あり: 減額 or 標準条件。開示した分だけ条件は改善する）
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {info.label}
          </Badge>
          <Badge variant="outline" className="font-mono">
            {score.months}ヶ月の実績
          </Badge>
        </div>
        <CardTitle className="pt-2">お申し込みを受け付けました</CardTitle>
        <CardDescription>{info.note}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {score.tier === "B" ? (
          <div className="rounded-lg bg-primary/10 p-6 text-center">
            <p className="text-sm text-muted-foreground">ご契約時の保証金</p>
            <p className="text-3xl font-bold tracking-tight">
              <span className="text-muted-foreground line-through text-xl mr-3">
                ¥{DEFAULT_DEPOSIT.toLocaleString()}
              </span>
              ¥{score.deposit.toLocaleString()}
            </p>
            <p className="text-sm text-primary pt-1">
              実績の開示により半額に減額されました
            </p>
          </div>
        ) : (
          <Alert>
            <AlertTitle>標準初期条件でのご契約となります</AlertTitle>
            <AlertDescription>
              保証金 ¥{score.deposit.toLocaleString()} のお預かりが必要です。
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">
          ※
          遅延の詳細（回数・日数）は下記のとおりご本人にのみ表示され、電力会社にはティアのみが共有されます。今後12ヶ月遅延がなければAランクに更新されます。
        </p>
        <ScoreDetail score={score} />
        <CredentialBlock personaId={persona.id} />
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

function CredentialBlock({ personaId }: { personaId: string }) {
  const [jws, setJws] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/credential", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personaId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (active && d.jws) setJws(d.jws);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [personaId]);

  return (
    <div className="rounded-lg border border-border p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">あなたの信用証明（持ち運び可能）</p>
        <Badge variant="secondary" className="font-mono text-xs">
          JWS / 簡易VC
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        この証明は発行者の署名付きです。他の電力会社・家賃・サブスクの審査でも提示できます（構想）。
      </p>
      {jws ? (
        <>
          <p className="font-mono text-xs break-all text-muted-foreground bg-muted rounded p-2 max-h-20 overflow-hidden">
            {jws}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(jws);
              setCopied(true);
            }}
          >
            {copied ? "コピーしました ✓" : "証明をコピー"}
          </Button>
        </>
      ) : (
        <p className="font-mono text-xs text-muted-foreground animate-pulse">
          証明を発行しています…
        </p>
      )}
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
