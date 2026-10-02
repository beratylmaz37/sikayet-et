import React from 'react';
import { Complaint } from '../types';
import { 
  CheckCircle2, 
  MessageSquareWarning, 
  ThumbsUp, 
  TrendingUp, 
  Activity,
  Layers
} from 'lucide-react';

interface StatsBannerProps {
  complaints: Complaint[];
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ complaints }) => {
  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'Çözüldü').length;
  const inProgress = complaints.filter((c) => c.status === 'Çözüm Aşamasında').length;
  const totalUpvotes = complaints.reduce((sum, c) => sum + c.upvotes, 0);

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Most reported category
  const categoryCounts: { [key: string]: number } = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  let topCategory = '-';
  let topCategoryCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > topCategoryCount) {
      topCategory = cat;
      topCategoryCount = count;
    }
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs mb-8">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Platform Şeffaflık & Çözüm Özeti</h2>
            <p className="text-[11px] text-slate-500">Okulumuzda iletilen ve çözüme kavuşturulan talepler</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-semibold border border-emerald-200">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>%{resolutionRate} Çözüm Oranı</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <MessageSquareWarning className="w-3.5 h-3.5 text-indigo-600" />
            <span>Toplam Şikayet</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-sans tabular-nums">
            {total}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Sisteme girilen bildirim</p>
        </div>

        <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Çözülen Sorunlar</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-800 font-sans tabular-nums">
            {resolved}
          </div>
          <p className="text-[10px] text-emerald-600 mt-0.5">İdarece çözülen</p>
        </div>

        <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 mb-1">
            <ThumbsUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Toplam Destek</span>
          </div>
          <div className="text-2xl font-extrabold text-indigo-800 font-sans tabular-nums">
            {totalUpvotes}
          </div>
          <p className="text-[10px] text-indigo-500 mt-0.5">Kullanıcı oyları</p>
        </div>

        <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-1">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>En Çok Bildirilen</span>
          </div>
          <div className="text-sm font-bold text-amber-900 mt-1 truncate">
            {topCategory}
          </div>
          <p className="text-[10px] text-amber-700 mt-0.5">
            {topCategoryCount > 0 ? `${topCategoryCount} adet bildirim` : 'Henüz bildirim yok'}
          </p>
        </div>
      </div>
    </div>
  );
};
