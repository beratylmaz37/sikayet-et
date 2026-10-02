import React from 'react';
import { ComplaintStatus } from '../types';
import { Clock, Wrench, CheckCircle2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  switch (status) {
    case 'İnceleniyor':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 rounded-md ${
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
          <span>İnceleniyor</span>
        </span>
      );

    case 'Çözüm Aşamasında':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200/80 rounded-md ${
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-indigo-600" />
          <span>Çözüm Aşamasında</span>
        </span>
      );

    case 'Çözüldü':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-md ${
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Çözüldü</span>
        </span>
      );

    case 'Reddedildi':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold text-rose-800 bg-rose-50 border border-rose-200/80 rounded-md ${
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Reddedildi</span>
        </span>
      );

    default:
      return null;
  }
};
