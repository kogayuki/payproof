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
import { scorePayments, DEFAULT_DEPOSIT } from "@/lib/scoring";
import { issueCredential, verifyCredential } from "@/lib/credential";
import { InquiryDemo } from "@/components/inquiry-demo";

// 電力会社側ダッシュボード（デモ）
// 申込者一覧: 開示者はスコアと署名検証済みの証明、非開示者は保証金ポリシー適用
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
          デンリョク電気 — 本日の申込 3件
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">申込者一覧</CardTitle>
          <CardDescription>
            開示者は検証済みの支払い実績を確認できます。非開示者には保証金ポリシーが適用されます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>申込者</TableHead>
                <TableHead>開示</TableHead>
                <TableHead>支払い実績</TableHead>
                <TableHead>証明の署名</TableHead>
                <TableHead className="text-right">保証金</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disclosed.map(({ persona, score, signatureValid }) => (
                <TableRow key={persona.id}>
                  <TableCell className="font-medium">{persona.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      開示済み
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {score.verified ? (
                      <span className="text-sm">
                        {score.months}ヶ月 延滞なし
                      </span>
                    ) : (
                      <span className="text-sm text-destructive">
                        延滞{score.lateCount}回（最長{score.maxDaysLate}日）
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {signatureValid ? (
                      <Badge className="font-mono text-xs">✓ 検証済み</Badge>
                    ) : (
                      <Badge variant="destructive" className="font-mono text-xs">
                        無効
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {score.verified ? (
                      <span className="text-primary">¥0（免除）</span>
                    ) : (
                      <>¥{DEFAULT_DEPOSIT.toLocaleString()}</>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {/* 非開示の申込者 */}
              <TableRow>
                <TableCell className="font-medium">松田 三郎</TableCell>
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
                <TableCell className="text-right font-mono">
                  ¥{DEFAULT_DEPOSIT.toLocaleString()}
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
            ・開示者の支払い実績は、本人の銀行明細から検証され、発行者の署名付き証明（JWS）として提示されます。
          </p>
          <p>
            ・非開示は本人の自由ですが、実績を確認できないため保証金ポリシーが適用されます。
            <span className="text-foreground">
              開示にリワードがあることで、開示しないこと自体がリスクシグナルになります。
            </span>
          </p>
          <p className="font-mono text-xs pt-2">
            ・証明の照会ごとにx402マイクロペイメントが発生（照会$0.01 →
            30%をユーザーへ即時還元）。上の「x402照会デモ」で体験できます。
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
