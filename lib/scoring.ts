// 支払い実績スコアリング（MVP: 延滞回数ベースの単純ルール）
import type { BankTransaction } from "./mock-bank";

export const DEFAULT_DEPOSIT = 24000; // 保証金 = 予想料金3ヶ月分の想定額

export type ScoreResult = {
  months: number; // 検証対象月数
  onTimeCount: number;
  lateCount: number; // 30日以上の遅延
  maxDaysLate: number;
  verified: boolean; // 「無延滞」を証明できたか
  deposit: number; // 適用される保証金
  rewardLabel: string;
};

export function scorePayments(transactions: BankTransaction[]): ScoreResult {
  const utility = transactions.filter((t) => t.isUtility);
  const late = utility.filter((t) => t.daysLate >= 30);
  const verified = late.length === 0 && utility.length >= 12;
  return {
    months: utility.length,
    onTimeCount: utility.filter((t) => t.daysLate === 0).length,
    lateCount: late.length,
    maxDaysLate: Math.max(0, ...utility.map((t) => t.daysLate)),
    verified,
    deposit: verified ? 0 : DEFAULT_DEPOSIT,
    rewardLabel: verified
      ? `保証金 ¥${DEFAULT_DEPOSIT.toLocaleString()} → ¥0（全額免除）`
      : "リワード適用なし",
  };
}
