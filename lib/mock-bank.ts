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
  id: "taro" | "jiro";
  name: string;
  label: string;
  bank: string;
  description: string;
  transactions: BankTransaction[];
};

function buildTransactions(
  latePattern: Record<number, number> // monthIndex -> daysLate（記載なしは期日内）
): BankTransaction[] {
  const txs: BankTransaction[] = [];
  // 直近24ヶ月分の電気料金引き落とし（2024-08〜2026-07）
  const base = new Date(2024, 7, 27); // 2024-08-27
  for (let i = 0; i < 24; i++) {
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
    name: "誠実 太郎",
    label: "24ヶ月間、期日内に支払い",
    bank: "みずほ銀行",
    description: "引っ越しに伴い電力を新規契約する会社員。支払いはいつも期日内。",
    transactions: buildTransactions({}),
  },
  {
    id: "jiro",
    name: "滞納 次郎",
    label: "直近1年で4回の延滞・1回の未払い",
    bank: "三井住友銀行",
    description: "前の電力会社で未払いのまま乗り換えを繰り返している。",
    transactions: buildTransactions({
      14: 45,
      17: 62,
      19: 38,
      21: 90,
      23: 120,
    }),
  },
];

export function getPersona(id: string): Persona | undefined {
  return personas.find((p) => p.id === id);
}
