import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  Search,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionPanel } from "@/components/section-panel";
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
  const total = disclosed.length + 1; // +1 = 非開示の松田さん

  return (
    <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-bold tracking-tight">新規申込者の与信状況</h1>
        <span className="text-xs text-muted-foreground">
          デンリョク電気株式会社 — 与信管理
        </span>
      </div>

      {/* 検索行 */}
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card p-3">
        <Button variant="outline" size="sm" className="font-normal">
          申込管理 <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
        <Button variant="outline" size="sm" className="font-normal">
          全体 <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
        <Input
          placeholder="氏名・住所・供給地点番号を入力"
          className="h-8 w-64 text-sm"
        />
        <Button size="sm" className="px-3">
          <Search className="h-4 w-4" />
        </Button>
        <button className="px-2 text-sm text-primary hover:underline">
          詳細検索
        </button>
        <span className="text-sm text-muted-foreground">
          ティアからさがす <ChevronDown className="inline h-3.5 w-3.5" />
        </span>
      </div>

      {/* アクション行 */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="font-normal">
          条件提示 <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
        <Button variant="outline" size="sm" className="font-normal">
          <Download className="h-3.5 w-3.5 text-muted-foreground" />
          ダウンロード
        </Button>
        <Button variant="outline" size="sm" className="font-normal">
          督促リマインダー一覧
        </Button>
      </div>

      {/* タブ + 件数バー + テーブル */}
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4">
          <div className="flex text-sm">
            <span className="relative border-b-2 border-primary px-3 py-2.5 font-semibold text-primary">
              すべて（{total}）
            </span>
            <span className="px-3 py-2.5 text-muted-foreground">
              開示済み（{disclosed.length}）
            </span>
            <span className="px-3 py-2.5 text-muted-foreground">非開示（1）</span>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <span>
              {total}件中 1〜{total}件
            </span>
            <ChevronLeft className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span>
              申込日順 <ChevronDown className="inline h-3.5 w-3.5" />
            </span>
            <Settings className="h-4 w-4" />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10">
                <input type="checkbox" className="h-3.5 w-3.5 accent-primary" />
              </TableHead>
              <TableHead>申込者・氏名</TableHead>
              <TableHead>開示</TableHead>
              <TableHead>与信ティア</TableHead>
              <TableHead>証明</TableHead>
              <TableHead className="text-right">初期条件（保証金）</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {disclosed.map(({ persona, score, signatureValid }) => {
              const info = TIER_INFO[score.tier];
              return (
                <TableRow key={persona.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 accent-primary"
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-primary">
                      {persona.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {persona.bank} 連携
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      開示済み
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <Badge
                        variant={score.tier === "A" ? "default" : "secondary"}
                        className="w-fit font-mono text-xs"
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
                  <TableCell className="text-right font-mono text-sm">
                    {score.deposit === 0 ? (
                      <span className="text-primary">¥0（免除）</span>
                    ) : (
                      <>¥{score.deposit.toLocaleString()}</>
                    )}
                  </TableCell>
                  <TableCell>
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              );
            })}
            {/* 非開示の申込者 — ペナルティではなく標準初期条件の適用 */}
            <TableRow>
              <TableCell>
                <input type="checkbox" className="h-3.5 w-3.5 accent-primary" />
              </TableCell>
              <TableCell>
                <span className="font-semibold text-primary">松田 三郎</span>
                <span className="block text-xs text-muted-foreground">—</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">
                  非開示
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">確認不可</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">—</span>
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                ¥{DEFAULT_DEPOSIT.toLocaleString()}
                <span className="block text-xs text-muted-foreground">
                  標準初期条件
                </span>
              </TableCell>
              <TableCell>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <InquiryDemo />

      <SectionPanel
        title="仕組み"
        bodyClassName="flex flex-col gap-2 p-4 text-sm text-muted-foreground"
      >
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
        <p className="pt-2 font-mono text-xs">
          ・照会課金レール: 証明1件の照会ごとに $0.01。決済手段は差し替え可能で、
          現在はx402（HTTP 402マイクロペイメント）で実装。照会料の30%は貸倒削減分を原資として
          データ主であるユーザーへ還元。上の「照会デモ」で体験できます。
        </p>
      </SectionPanel>
    </main>
  );
}
