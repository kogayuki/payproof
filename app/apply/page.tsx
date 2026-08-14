"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionPanel } from "@/components/section-panel";
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
  TIER_INFO,
  type ScoreResult,
  type Tier,
} from "@/lib/scoring";

type Step = "form" | "consent" | "connect" | "verifying" | "result";

export default function ApplyPage() {
  const [step, setStep] = useState<Step>("form");
  const [disclosed, setDisclosed] = useState<boolean | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);

  const score: ScoreResult | null = useMemo(
    () => (persona ? scorePayments(persona.payments) : null),
    [persona]
  );

  return (
    <main className="flex-1 w-full flex flex-col">
      {/* Sansan風パンくずバー */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex h-11 w-full max-w-6xl items-center gap-1.5 px-4 text-sm">
          <Link href="/" className="text-primary hover:underline">
            デンリョク電気
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-primary">でんきの新規お申し込み</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-foreground">
            {step === "form"
              ? "お客さま情報の入力"
              : step === "consent"
                ? "支払い実績の開示選択"
                : step === "result"
                  ? "お申し込み結果"
                  : "支払い実績の検証"}
          </span>
          <Link href="/" className="ml-auto text-muted-foreground hover:text-foreground">
            <X className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-xl px-4 py-8 flex flex-col gap-6">
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
              前の電力会社でのお支払い実績を開示すると、電気料金の割引が受けられます。開示は完全に任意です。
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
              <p className="font-semibold">開示して割引を受ける</p>
              <p className="text-sm text-muted-foreground">
                実績に応じて電気料金の割引（最大3%）がその場で適用されます。履歴が短い方も実績構築プログラムの対象です
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
                標準条件（割引なし）でのご契約となります。開示は後からでも選べます
              </p>
            </button>
            <p className="text-xs text-muted-foreground">
              開示いただくのは「電気料金の支払い実績」のみです。使用量や生活パターンが新しい電力会社に共有されることはありません。
            </p>
          </CardContent>
        </Card>
      )}

      {step === "connect" && (
        <Card>
          <CardHeader>
            <CardTitle>前の電力会社に照会</CardTitle>
            <CardDescription>
              デモ用のペルソナを選択してください。実サービスでは本人同意に基づき、前の電力会社が保有する支払い履歴を照会します（相互参照）。
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
                    {p.prevProvider}
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
      </div>
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
  "ご本人の開示同意を確認しています…",
  "前の電力会社に照会しています…",
  "支払い履歴（署名付き）を受信しています…",
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
  const utilityTxs = persona.payments;

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
        <CardDescription>{persona.prevProvider} — {persona.name} 様</CardDescription>
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
            電気料金の支払い記録 {utilityTxs.length} 件を受信
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
            <AlertTitle>標準条件（割引なし）でのご契約となります</AlertTitle>
            <AlertDescription>
              お支払い実績を確認できないため、電気料金は標準単価（割引なし）の適用となります。
            </AlertDescription>
          </Alert>
          <p className="text-xs text-muted-foreground">
            ※
            開示は後からでも選択できます。実績が確認できれば、電気料金の割引（最大3%）が適用されます。
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
            ヶ月分の電気料金支払いを検証し、すべて期日内のお支払いを確認しました。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg bg-primary/10 p-6 text-center">
            <p className="text-sm text-muted-foreground">電気料金の割引</p>
            <p className="text-3xl font-bold tracking-tight">3%OFF</p>
            <p className="text-sm text-primary pt-1">
              開示特典として、ご契約のその場で適用されました
            </p>
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
            <p className="text-sm text-muted-foreground">ウェルカム特典</p>
            <p className="text-3xl font-bold tracking-tight">初月1%OFF</p>
            <p className="text-sm text-primary pt-1">
              口座振替のご登録で適用されます
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            このまま期日内のお支払いを続けると、実績12ヶ月の時点でAランク（3%割引）が自動判定されます。
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
            <p className="text-sm text-muted-foreground">電気料金の割引</p>
            <p className="text-3xl font-bold tracking-tight">1%OFF</p>
            <p className="text-sm text-primary pt-1">
              実績の開示により適用されました
            </p>
          </div>
        ) : (
          <Alert>
            <AlertTitle>標準条件でのご契約となります</AlertTitle>
            <AlertDescription>
              今回の割引適用はありませんが、今後12ヶ月遅延がなければ割引対象になります。
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
  // Sansan風: グレー見出し + key-value ゼブラ行
  const rows: [string, string][] = [
    ["検証期間", `${score.months}ヶ月`],
    ["期日内支払い", `${score.onTimeCount}回`],
    ["延滞（30日以上）", `${score.lateCount}回`],
    ["判定ティア", TIER_INFO[score.tier].label],
  ];
  return (
    <SectionPanel title="検証結果" count={rows.length}>
      <dl>
        {rows.map(([k, v], i) => (
          <div
            key={k}
            className={`flex border-b border-border text-sm last:border-b-0 ${
              i % 2 === 1 ? "bg-muted/40" : ""
            }`}
          >
            <dt className="w-36 shrink-0 px-4 py-2.5 text-muted-foreground">
              {k}
            </dt>
            <dd className="px-4 py-2.5 font-mono font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </SectionPanel>
  );
}

type DecodedCredential = {
  tier: Tier;
  months: number;
  verified: boolean;
  sub: string;
  iss: string;
  exp: number;
};

function decodeJwsPayload(jws: string): DecodedCredential | null {
  try {
    const base64 = jws.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
      )
    );
  } catch {
    return null;
  }
}

function CredentialBlock({ personaId }: { personaId: string }) {
  const [jws, setJws] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

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
    <SectionPanel
      title="あなたの信用証明（持ち運び可能）"
      actions={
        <Badge variant="secondary" className="font-mono text-xs">
          JWS / 簡易VC
        </Badge>
      }
      bodyClassName="flex flex-col gap-2 p-4"
    >
      <p className="text-xs text-muted-foreground">
        この証明は発行者の署名付きです。他の電力会社・家賃・サブスクの審査でも提示できます（構想）。
      </p>
      {jws ? (
        <>
          {(() => {
            const claims = decodeJwsPayload(jws);
            if (!claims) return null;
            const rows: [string, string][] = [
              ["判定ティア", TIER_INFO[claims.tier]?.label ?? claims.tier],
              ["検証済み実績", `${claims.months}ヶ月`],
              ["発行者", "PayProof"],
              [
                "有効期限",
                new Date(claims.exp * 1000).toLocaleDateString("ja-JP"),
              ],
            ];
            return (
              <div className="rounded border border-border">
                <p className="border-b border-border bg-muted/40 px-3 py-2 text-xs font-medium">
                  この証明に含まれる情報（これがすべてです）
                </p>
                <dl>
                  {rows.map(([k, v], i) => (
                    <div
                      key={k}
                      className={`flex border-b border-border text-sm last:border-b-0 ${
                        i % 2 === 1 ? "bg-muted/40" : ""
                      }`}
                    >
                      <dt className="w-36 shrink-0 px-3 py-2 text-muted-foreground">
                        {k}
                      </dt>
                      <dd className="px-3 py-2 font-mono font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                  含まれない情報:
                  支払い金額・遅延の詳細・口座情報。生データはご本人の元に残ります。
                </p>
              </div>
            );
          })()}
          <button
            type="button"
            className="self-start text-xs text-primary hover:underline"
            onClick={() => setShowRaw((v) => !v)}
          >
            {showRaw
              ? "技術詳細を隠す"
              : "技術詳細を表示（署名付きデータの実体）"}
          </button>
          {showRaw && (
            <p className="font-mono text-xs break-all text-muted-foreground bg-muted rounded p-2">
              {jws}
            </p>
          )}
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
    </SectionPanel>
  );
}

function RestartButton() {
  return (
    <Button variant="outline" render={<Link href="/apply" />}>
      最初からやり直す
    </Button>
  );
}
