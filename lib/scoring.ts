// 支払い実績スコアリング（MVP: 延滞回数ベースの単純ルール）
//
// 設計方針:
// - 「人を評価する」のではなく「検証可能な事実からティアを算出する」
// - 事業者に渡るのはティア（A/B/実績構築中）のみ。生の延滞回数・日数は渡さない
// - 非開示は「ペナルティ」ではなく、標準条件（割引なし）の適用
// - 開示した全員に何らかの改善があるよう設計する（開示インセンティブを二値にしない）
// - リワードは電気料金の割引（原資は貸倒削減・督促コスト削減分）。保証金・審査は現代の
//   電力契約には存在しないため前提にしない（v0.5で全面撤廃）
import type { PaymentRecord } from "./mock-bank";

export type Tier = "A" | "B" | "C" | "building";

export const TIER_INFO: Record<
  Tier,
  { label: string; discountRate: number; rewardLabel: string; note: string }
> = {
  A: {
    label: "Aランク",
    discountRate: 3,
    rewardLabel: "電気料金 3%割引（開示特典・その場で適用）",
    note: "12ヶ月以上の支払い実績・重大な遅延なし",
  },
  B: {
    label: "Bランク",
    discountRate: 1,
    rewardLabel: "電気料金 1%割引",
    note: "実績を確認。一部に遅延があるため割引率は1%を適用",
  },
  C: {
    label: "Cランク",
    discountRate: 0,
    rewardLabel: "標準条件を適用（今後12ヶ月遅延がなければ割引対象）",
    note: "遅延が複数回確認されたため標準条件を適用",
  },
  building: {
    label: "実績構築中",
    discountRate: 0,
    rewardLabel:
      "ウェルカム特典 — 口座振替のご登録で初月1%割引。実績12ヶ月でAランクを自動判定",
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
  discountRate: number; // 適用される電気料金の割引率（%）
  rewardLabel: string;
};

export function scorePayments(payments: PaymentRecord[]): ScoreResult {
  const months = payments.length;
  const late = payments.filter((t) => t.daysLate >= 30);
  const maxDaysLate = Math.max(0, ...payments.map((t) => t.daysLate));

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
    onTimeCount: payments.filter((t) => t.daysLate === 0).length,
    lateCount: late.length,
    maxDaysLate,
    tier,
    verified: months > 0,
    discountRate: info.discountRate,
    rewardLabel: info.rewardLabel,
  };
}
