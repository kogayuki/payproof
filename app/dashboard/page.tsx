import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { personas } from "@/lib/mock-bank";
import { scorePayments, TIER_INFO, DEFAULT_DEPOSIT } from "@/lib/scoring";
import { issueCredential, verifyCredential } from "@/lib/credential";
import { InquiryDemo } from "@/components/inquiry-demo";

// 電力会社側ダッシュボード（デモ）
// 事業者に見えるのは「ティア」と「署名検証結果」のみ。
// 生の延滞回数・日数は本人にしか表示しない（将来のZKP方針と整合）。
export default async function DashboardPage() {
  const disclosed = await Promise.all(
    personas.map(async (p) => {
      const score = scorePayments(p.transactions);
      // デモ: 発行済み証明をサーバー側で署名検証して表示
      const jws = await issueCredential(p.name, score);
      const { valid } = await verifyCredential(jws);
      return { persona: p, score, signatureValid: valid };
    })
  );

  return (
    <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-10 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-mono text-sm text-muted-foreground">
          ← PayProof
        </Link>
        <Badge variant="outline" className="font-mono">
          電力会社ダッシュボード（デモ）
        </Badge>
      </header>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">新規申込者の与信状況</h1>
        <p className="text-sm text-muted-foreground pt-1">
          デンリョク電気 — 本日の申込 4件
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">申込者一覧</CardTitle>
          <CardDescription>
            事業者に共有されるのは検証済みの与信ティアのみ。明細や遅延の詳細が共有されることはありません。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>申込者</TableHead>
                <TableHead>開示</TableHead>
                <TableHead>与信ティア</TableHead>
                <TableHead>証明</TableHead>
                <TableHead className="text-right">初期条件（保証金）</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disclosed.map(({ persona, score, signatureValid }) => {
                const info = TIER_INFO[score.tier];
                return (
                  <TableRow key={persona.id}>
                    <TableCell className="font-medium">{persona.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">
                        開示済み
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <Badge
                          variant={score.tier === "A" ? "default" : "secondary"}
                          className="font-mono text-xs w-fit"
                        >
                          {info.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          実績 {score.months}ヶ月
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {signatureValid ? (
                        <Badge variant="outline" className="font-mono text-xs">
                          ✓ 署名有効
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="font-mono text-xs">
                          無効
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {score.deposit === 0 ? (
                        <span className="text-primary">¥0（免除）</span>
                      ) : (
                        <>¥{score.deposit.toLocaleString()}</>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* 非開示の申込者 — ペナルティではなく標準初期条件の適用 */}
              <TableRow>
                <TableCell className="font-medium">松田 三郎</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    非開示
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    確認不可
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">—</span>
                </TableCell>
                <TableCell className="text-right font-mono">
                  ¥{DEFAULT_DEPOSIT.toLocaleString()}
                  <span className="block text-xs text-muted-foreground">
                    標準初期条件
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InquiryDemo />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">仕組み</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground flex flex-col gap-2">
          <p>
            ・開示者の与信ティアは、本人の銀行明細から検証され、発行者の署名付き証明（JWS）として提示されます。事業者が受け取るのはティアのみで、明細や遅延の詳細は本人の元に残ります。
          </p>
          <p>
            ・保証金はペナルティではなく、
            <span className="text-foreground">
              実績を確認できない相手に対する標準初期条件
            </span>
            です。開示すれば全員に条件改善の可能性があり（免除・半額・実績構築プログラム）、
            結果として開示が合理的な選択になります。
          </p>
          <p>
            ・履歴が12ヶ月に満たない方（新社会人・引っ越し直後など）は「実績構築中」として扱われ、
            保証金なしで契約できます。履歴が薄いことは落ち度ではありません。
          </p>
          <p className="font-mono text-xs pt-2">
            ・照会課金レール: 証明1件の照会ごとに $0.01。決済手段は差し替え可能で、
            現在はx402（HTTP 402マイクロペイメント）で実装。照会料の30%は貸倒削減分を原資として
            データ主であるユーザーへ還元。上の「照会デモ」で体験できます。
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
