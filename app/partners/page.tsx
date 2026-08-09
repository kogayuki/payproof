import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionPanel } from "@/components/section-panel";
import { RoiSimulator } from "@/components/roi-simulator";

// 事業者（電力会社）向けLP。ナビには載せない独立ページ。
// 主語は「督促コスト削減」— フリーライダーを弾く、とは言わない（想定問答の骨子に準拠）。

const FAQ: { q: string; a: string }[] = [
  {
    q: "未払いのまま乗り換えてくる契約者を、契約時にブロックできますか？",
    a: "直接ブロックする仕組みではありません（開示は本人の任意です）。PayProofが変えるのは督促の効率です。実績が検証済みのお客様は督促対象からほぼ外れ、リソースを非開示セグメントに集中できます。また相互参照の参加社が増えるほど「きれいな支払い履歴＝割引が持ち運べる資産」になり、未払いのまま乗り換える行為自体の期待値が下がっていきます。効果はPoCで開示群vs非開示群の実数を測定して検証します。",
  },
  {
    q: "個人情報の取り扱いリスクは？",
    a: "御社が受け取るのはティア（A/B/C/実績構築中）のみで、遅延の詳細や生の支払いデータは本人の元に残ります。データの流れは本人同意起点のため第三者提供に該当しない構成で、弁護士レビューを前提に設計しています。持たないことが最大の漏洩対策です。",
  },
  {
    q: "非開示のお客様への差別になりませんか？",
    a: "非開示の扱いは「標準条件（割引なし）」であり、不利益は割引がないことに限定されます。履歴が12ヶ月に満たない方（新社会人・引っ越し直後など）は実績構築中としてウェルカム特典の対象になり、履歴の薄さを落ち度として扱いません。",
  },
  {
    q: "照会ごとのユーザー還元（0.3円）に意味はあるのですか？",
    a: "金額が狙いではありません。照会のたびに本人へ通知と対価が届くことで「自分のデータがいつ・誰に照会されたか」が本人に見える、透明性（監査レシート）の設計です。本人同意モデルの信頼性を支える仕組みであり、御社の負担は照会料1円/件に含まれます。",
  },
  {
    q: "導入にどれくらいの開発が必要ですか？",
    a: "御社側の実装はゼロで始められます。照会はAPI 1本、結果はダッシュボードでも確認できます。費用は成果報酬型（督促コスト削減の実証後に請求）を予定しており、先行リスクはありません。",
  },
];

export default function PartnersPage() {
  return (
    <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-16 flex flex-col gap-14">
      {/* 1. ヒーロー */}
      <section className="flex flex-col items-center gap-6 text-center">
        <Badge variant="outline" className="font-mono">
          PayProof for 電力事業者
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl leading-tight">
          督促しなくていいお客様が、
          <br />
          契約の瞬間にわかる。
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted-foreground">
          未払いの大半は、悪意ではなく遅延やうっかりです。それでも督促は全員に同じコストがかかる——
          PayProofは、お客様本人の同意で前の電力会社の支払い実績を検証し、
          督促リソースを本当に必要なセグメントに集中させる与信インフラです。
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" render={<a href="mailto:contact@payproof.example?subject=%E3%83%92%E3%82%A2%E3%83%AA%E3%83%B3%E3%82%B0%E5%8D%94%E5%8A%9B" />}>
            30分ヒアリングにご協力ください →
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<Link href="/dashboard" />}
          >
            管理画面デモを見る
          </Button>
        </div>
      </section>

      {/* 2. ペイン共感 */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">約50日の回収サイクル</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            検針から送電停止まで約50日。その間の架電・ハガキ・停止手続きの人件費は、支払う意思のあるお客様の分まで一律にかかっています。
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">契約時に判断材料がない</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            クレカ（CIC）や通信（TCA）と違い、電力業界には支払い情報の共有機関がなく、申込者の支払い実績を確認する手段がありません。
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">コストは全員に転嫁</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            貸倒と督促のコストは最終的に全契約者の電気料金へ。真面目に払うお客様ほど損をする構造が放置されています。
          </CardContent>
        </Card>
      </section>

      {/* 3. 仕組み */}
      <SectionPanel
        title="仕組み — 御社の実装はゼロ"
        bodyClassName="grid gap-4 p-6 sm:grid-cols-3"
      >
        {[
          {
            step: "1. 本人が開示に同意",
            body: "契約申込時、お客様が「支払い履歴を開示して割引を受ける」を選択。開示は完全に任意です。",
          },
          {
            step: "2. 前の電力会社へ照会",
            body: "本人同意起点で、前の電力会社が保有する支払い履歴を照会・検証（相互参照）。自己申告ではなく検証済みの事実だけを使います。",
          },
          {
            step: "3. 御社はティアのみ受領",
            body: "受け取るのはA/B/C/実績構築中のティアと署名付き証明のみ。生の支払いデータを御社が保持することはありません。",
          },
        ].map((s) => (
          <div key={s.step} className="flex flex-col gap-2">
            <p className="text-sm font-semibold">{s.step}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </div>
        ))}
      </SectionPanel>

      {/* 4. ROIシミュレータ */}
      <RoiSimulator />

      {/* 5. 割引=CAC・照会料収入 */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              割引はコストではなく、優良顧客のCACです
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            3%割引（約¥2,880/年）は、広告費で不特定多数を集める代わりに、支払い実績が検証済みのお客様を選んで獲得するための費用です。貸倒ゼロが見込める顧客の獲得単価として、既存のマーケティング費と比較してください。
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              解約されたお客様のデータが、収益になります
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            相互参照は双方向です。御社を解約したお客様の実績が他社から照会されるたび、提供側の御社に照会料が入ります。参加するほど、保有データが収益資産に変わります。
          </CardContent>
        </Card>
      </section>

      {/* 6. FAQ */}
      <SectionPanel
        title="よくあるご質問 — 正直にお答えします"
        bodyClassName="flex flex-col divide-y"
      >
        {FAQ.map((f) => (
          <div key={f.q} className="flex flex-col gap-2 p-5">
            <p className="text-sm font-semibold">Q. {f.q}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A. {f.a}
            </p>
          </div>
        ))}
      </SectionPanel>

      {/* 7. CTA */}
      <section className="flex flex-col items-center gap-4 rounded-lg border bg-muted/40 px-6 py-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          まずは、督促の実態を教えてください。
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          電力業界には未回収・督促コストの公式統計がありません。私たちは導入営業の前に、現場の実数を学ぶことから始めています。30分のオンラインヒアリングにご協力いただける事業者様を探しています。
        </p>
        <Button size="lg" render={<a href="mailto:contact@payproof.example?subject=%E3%83%92%E3%82%A2%E3%83%AA%E3%83%B3%E3%82%B0%E5%8D%94%E5%8A%9B" />}>
          ヒアリングに協力する →
        </Button>
        <p className="font-mono text-xs text-muted-foreground">
          成果報酬型 / 御社実装ゼロ / 個人データ非保持
        </p>
      </section>
    </main>
  );
}
