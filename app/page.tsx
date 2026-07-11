import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-16 flex flex-col gap-12">
      <section className="flex flex-col gap-6 text-center items-center">
        <Badge variant="outline" className="font-mono">
          PayProof — MVP Demo
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          支払い実績が、
          <br />
          あなたの信用になる。
        </h1>
        <p className="text-muted-foreground max-w-xl leading-relaxed">
          電力業界には、クレカや通信のような未払い情報の共有機関がありません。
          真面目に払ってきた人も、踏み倒す人も、契約時には区別できない——
          PayProofは、あなた自身が支払い履歴を開示することで、
          保証金免除などのリワードをその場で受け取れる仕組みです。
        </p>
        <Button size="lg" render={<Link href="/apply" />}>
          電力契約デモをはじめる →
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. 開示を選ぶ</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            契約申込時に「支払い履歴を開示して特典を受ける」を選択。開示は完全に任意です。
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. 実績を検証</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            銀行明細から公共料金の支払い実績を自動抽出。自己申告ではなく、検証済みの事実だけを使います。
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">3. その場でリワード</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            無延滞が証明されれば、保証金（3ヶ月分・数万円）が即座に免除されます。
          </CardContent>
        </Card>
      </section>

      <p className="text-center text-xs text-muted-foreground font-mono">
        demo build — 銀行連携はモックデータで再現しています
      </p>
    </main>
  );
}
