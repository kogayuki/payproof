"use client";

// 事業者向けLP: 督促コスト削減のROIシミュレータ
// 公式統計が存在しないため、事業者自身の実数を入力してもらう設計。
// 注意: 割引コストは督促削減と相殺で見せない（賄えないのが実態）。
// 割引は「検証済み優良顧客の獲得・維持単価」として既存CACと比較する。
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionPanel } from "@/components/section-panel";

const yen = (n: number) => `¥${Math.round(n).toLocaleString("ja-JP")}`;

const DISCOUNT_PER_USER = 2880; // ティアA 3%×月額¥8,000想定の最大値/年

export function RoiSimulator() {
  const [contracts, setContracts] = useState(50000); // 契約件数
  const [lateRate, setLateRate] = useState(3); // 月間未払い発生率 %
  const [dunningCost, setDunningCost] = useState(800); // 督促単価 円/件
  const [discloseRate, setDiscloseRate] = useState(30); // 想定開示率 %
  const [cac, setCac] = useState(8000); // 現在の顧客獲得単価 円/件

  // 督促: 年間対応件数 × 単価。開示群（実績検証済み）が対象から外れる想定
  const annualDunning = contracts * (lateRate / 100) * 12 * dunningCost;
  const saved = annualDunning * (discloseRate / 100);

  const fields: {
    label: string;
    value: number;
    set: (n: number) => void;
    unit: string;
  }[] = [
    { label: "契約件数", value: contracts, set: setContracts, unit: "件" },
    { label: "月間未払い発生率", value: lateRate, set: setLateRate, unit: "%" },
    {
      label: "督促単価（架電・郵送・人件費の合計）",
      value: dunningCost,
      set: setDunningCost,
      unit: "円/件",
    },
    {
      label: "想定開示率",
      value: discloseRate,
      set: setDiscloseRate,
      unit: "%",
    },
    {
      label: "現在の顧客獲得単価（広告・代理店・キャンペーン）",
      value: cac,
      set: setCac,
      unit: "円/件",
    },
  ];

  return (
    <SectionPanel
      title="効果シミュレータ — 御社の実数でお試しください"
      bodyClassName="grid gap-6 p-6 sm:grid-cols-2"
    >
      <div className="flex flex-col gap-4">
        {fields.map((f) => (
          <div key={f.label} className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              {f.label}（{f.unit}）
            </Label>
            <Input
              type="number"
              min={0}
              value={f.value}
              onChange={(e) => f.set(Number(e.target.value) || 0)}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-center gap-5">
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-5 font-mono text-sm">
          <p className="text-xs font-semibold text-muted-foreground">
            効果① 督促オペレーションの削減
          </p>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-muted-foreground">現状の年間督促コスト</span>
            <span>{yen(annualDunning)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t pt-3">
            <span className="font-semibold">削減額 / 年（開示群が対象外に）</span>
            <span className="text-base font-bold text-primary">
              +{yen(saved)}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-5 font-mono text-sm">
          <p className="text-xs font-semibold text-muted-foreground">
            効果② 検証済み優良顧客の獲得単価
          </p>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-muted-foreground">現在の獲得単価（入力値）</span>
            <span>{yen(cac)} /件</span>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t pt-3">
            <span className="font-semibold">3%割引での獲得・維持費※</span>
            <span className="text-base font-bold text-primary">
              {yen(DISCOUNT_PER_USER)} /件/年
            </span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            広告は誰が来るか選べませんが、割引は支払い実績が検証済みの顧客だけに届きます。
          </p>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          ※ ティアA（3%割引・月額¥8,000想定）の最大値。B（1%）・実績構築中が混在する実際の平均はこれより小さくなります。
          割引原資は督促削減だけでは賄えないため、優良顧客獲得費（CAC）としての評価が導入判断の軸です——ここは正直にお伝えします。
        </p>
      </div>
    </SectionPanel>
  );
}
