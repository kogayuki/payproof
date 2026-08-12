// モック支払い履歴データ（電力会社間・相互参照モデル）
// 実サービスでは本人同意のもと、「前の電力会社」が保有する支払い履歴を
// 署名付きで開示する（銀行明細は使わない）。デモ用にその応答を再現したもの。
// ※ ファイル名は歴史的経緯（v0.4までは銀行明細モデル）。

export type PaymentRecord = {
  date: string; // 支払い日 YYYY-MM-DD
  amount: number; // 電気料金の請求額（円）
  daysLate: number; // 支払期日からの遅延日数（0 = 期日内）
};

export type Persona = {
  id: "taro" | "jiro" | "hana";
  name: string;
  label: string;
  prevProvider: string; // 前の電力会社（本人同意に基づく照会先）
  description: string;
  payments: PaymentRecord[];
};

function buildPayments(
  latePattern: Record<number, number>, // monthIndex -> daysLate（記載なしは期日内）
  months = 24
): PaymentRecord[] {
  const records: PaymentRecord[] = [];
  // 直近{months}ヶ月分の電気料金支払い（〜2026-07）
  const base = new Date(2024, 7 + (24 - months), 27);
  for (let i = 0; i < months; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() + i, 27);
    const daysLate = latePattern[i] ?? 0;
    const paid = new Date(d);
    paid.setDate(paid.getDate() + daysLate);
    const season = d.getMonth();
    // 夏冬は電気代が上がる、それっぽい金額
    const amount =
      6800 +
      (season <= 1 || season === 11 ? 3200 : 0) +
      (season >= 6 && season <= 8 ? 2400 : 0) +
      ((i * 613) % 900);
    records.push({
      date: paid.toISOString().slice(0, 10),
      amount,
      daysLate,
    });
  }
  return records.sort((a, b) => a.date.localeCompare(b.date));
}

export const personas: Persona[] = [
  {
    id: "taro",
    name: "佐藤 太郎",
    label: "24ヶ月の実績・遅延なし",
    prevProvider: "東京エナジーパワー",
    description: "引っ越しに伴い電力を新規契約する会社員。支払いはいつも期日内。",
    payments: buildPayments({}),
  },
  {
    id: "jiro",
    name: "高橋 次郎",
    label: "24ヶ月の実績・遅延2回（最長42日）",
    prevProvider: "関西でんきサービス",
    description:
      "繁忙期に口座残高が不足し、過去に2回だけ支払いが遅れたことがある。",
    payments: buildPayments({
      14: 35,
      21: 42,
    }),
  },
  {
    id: "hana",
    name: "新井 花子",
    label: "履歴6ヶ月（引っ越し直後の新社会人）",
    prevProvider: "さくら電力",
    description:
      "今年就職して一人暮らしを始めたばかり。遅延はないが履歴が短い（thin-file）。",
    payments: buildPayments({}, 6),
  },
];

export function getPersona(id: string): Persona | undefined {
  return personas.find((p) => p.id === id);
}
