// 支払い実績スコアリング（MVP: 延滞回数ベースの単純ルール）
//
// 設計方針:
// - 「人を評価する」のではなく「検証可能な事実からティアを算出する」
// - 事業者に渡るのはティア（A/B/実績構築中）のみ。生の延滞回数・日数は渡さない
// - 非開示は「ペナルティ」ではなく、リスク不明な相手に対する標準初期条件の適用
// - 開示した全員に何らかの改善があるよう設計する（開示インセンティブを二値にしない）
import type { BankTransaction } from "./mock-bank";

export const DEFAULT_DEPOSIT = 24000; // 標準初期条件 = 予想料金3ヶ月分の想定額

export type Tier = "A" | "B" | "C" | "building";

export const TIER_INFO: Record<
  Tier,
  { label: string; deposit: number; rewardLabel: string; note: string }
> = {
  A: {
    label: "Aランク",
    deposit: 0,
    rewardLabel: `保証金 ¥${DEFAULT_DEPOSIT.toLocaleString()} → ¥0（全額免除）+ 審査即通過`,
    note: "12ヶ月以上の支払い実績・重大な遅延なし",
  },
  B: {
    label: "Bランク",
    deposit: DEFAULT_DEPOSIT / 2,
    rewardLabel: `保証金 ¥${DEFAULT_DEPOSIT.toLocaleString()} → ¥${(
      DEFAULT_DEPOSIT / 2
    ).toLocaleString()}（半額）`,
    note: "実績を確認。一部に遅延があるため保証金は半額適用",
  },
  C: {
    label: "Cランク",
    deposit: DEFAULT_DEPOSIT,
    rewardLabel: "標準初期条件を適用",
    note: "遅延が複数回確認されたため標準初期条件を適用",
  },
  building: {
    label: "実績構築中",
    deposit: 0,
    rewardLabel: "実績構築プログラム適用 — 保証金¥0（口座振替登録が条件）",
    note: "履歴12ヶ月未満。12ヶ月の実績でAランクを自動判定",
  },
};

export type ScoreResult = {
  months: number; // 検証対象月数
  onTimeCount: number;
  lateCount: number; // 30日以上の遅延（本人のみに表示。事業者には渡さない）
  maxDaysLate: number;
  tier: Tier;
  verified: boolean; // 何らかの実績を検証できたか
  deposit: number; // 適用される保証金
  rewardLabel: string;
};

export function scorePayments(transactions: BankTransaction[]): ScoreResult {
  const utility = transactions.filter((t) => t.isUtility);
  const months = utility.length;
  const late = utility.filter((t) => t.daysLate >= 30);
  const maxDaysLate = Math.max(0, ...utility.map((t) => t.daysLate));

  let tier: Tier;
  if (months < 12) {
    tier = "building"; // thin-file: 履歴が薄いことは落ち度ではない
  } else if (late.length === 0) {
    tier = "A";
  } else if (late.length <= 2 && maxDaysLate < 60) {
    tier = "B";
  } else {
    tier = "C";
  }

  const info = TIER_INFO[tier];
  return {
    months,
    onTimeCount: utility.filter((t) => t.daysLate === 0).length,
    lateCount: late.length,
    maxDaysLate,
    tier,
    verified: months > 0,
    deposit: info.deposit,
    rewardLabel: info.rewardLabel,
  };
}
