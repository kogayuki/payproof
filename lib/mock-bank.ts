// モック銀行明細データ
// 実サービスでは電子決済等代行業者（Moneytree / マネーフォワード等）のAPI経由で
// 本人同意のもと取得する入出金明細を、デモ用に再現したもの。

export type BankTransaction = {
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // 出金はマイナス
  isUtility: boolean; // 公共料金(電気)の引き落としか
  daysLate: number; // 引き落とし予定日からの遅延日数（0 = 期日内）
};

export type Persona = {
  id: "taro" | "jiro" | "hana";
  name: string;
  label: string;
  bank: string;
  description: string;
  transactions: BankTransaction[];
};

function buildTransactions(
  latePattern: Record<number, number>, // monthIndex -> daysLate（記載なしは期日内）
  months = 24
): BankTransaction[] {
  const txs: BankTransaction[] = [];
  // 直近{months}ヶ月分の電気料金引き落とし（〜2026-07）
  const base = new Date(2024, 7 + (24 - months), 27);
  for (let i = 0; i < months; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() + i, 27);
    const daysLate = latePattern[i] ?? 0;
    const paid = new Date(d);
    paid.setDate(paid.getDate() + daysLate);
    const season = d.getMonth();
    // 夏冬は電気代が上がる、それっぽい金額
    const amount =
      -1 *
      (6800 +
        (season <= 1 || season === 11 ? 3200 : 0) +
        (season >= 6 && season <= 8 ? 2400 : 0) +
        ((i * 613) % 900));
    txs.push({
      date: paid.toISOString().slice(0, 10),
      description: "デンリョク電気料金",
      amount,
      isUtility: true,
      daysLate,
    });
    // ノイズとしてその他の取引も混ぜる（検証時に「抽出」を見せるため）
    txs.push({
      date: new Date(d.getFullYear(), d.getMonth(), 25)
        .toISOString()
        .slice(0, 10),
      description: "給与振込",
      amount: 284000,
      isUtility: false,
      daysLate: 0,
    });
    txs.push({
      date: new Date(d.getFullYear(), d.getMonth(), 10)
        .toISOString()
        .slice(0, 10),
      description: "スーパーマルナカ",
      amount: -4980,
      isUtility: false,
      daysLate: 0,
    });
  }
  return txs.sort((a, b) => a.date.localeCompare(b.date));
}

export const personas: Persona[] = [
  {
    id: "taro",
    name: "佐藤 太郎",
    label: "24ヶ月の実績・遅延なし",
    bank: "みずほ銀行",
    description: "引っ越しに伴い電力を新規契約する会社員。支払いはいつも期日内。",
    transactions: buildTransactions({}),
  },
  {
    id: "jiro",
    name: "高橋 次郎",
    label: "24ヶ月の実績・遅延2回（最長42日）",
    bank: "三井住友銀行",
    description:
      "繁忙期に口座残高が不足し、過去に2回だけ支払いが遅れたことがある。",
    transactions: buildTransactions({
      14: 35,
      21: 42,
    }),
  },
  {
    id: "hana",
    name: "新井 花子",
    label: "履歴6ヶ月（引っ越し直後の新社会人）",
    bank: "ゆうちょ銀行",
    description:
      "今年就職して一人暮らしを始めたばかり。遅延はないが履歴が短い（thin-file）。",
    transactions: buildTransactions({}, 6),
  },
];

export function getPersona(id: string): Persona | undefined {
  return personas.find((p) => p.id === id);
}
