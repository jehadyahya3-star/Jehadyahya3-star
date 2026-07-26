import React, { useState } from 'react';
import { Company, WorkReport, ProjectInfo } from '../types';
import { formatCurrency } from '../utils/exportUtils';
import { Building2, Plus, DollarSign, Receipt, FileText, ArrowUpRight } from 'lucide-react';

interface CompaniesAndAccountsProps {
  companies: Company[];
  reports: WorkReport[];
  projectInfo?: ProjectInfo;
  onAddCompany: (company: Company) => void;
}

export const CompaniesAndAccounts: React.FC<CompaniesAndAccountsProps> = ({
  companies,
  reports,
  projectInfo,
  onAddCompany
}) => {
  const currencySymbol = projectInfo?.currency || 'ر.ي';
  const formatCurr = (amount: number) => formatCurrency(amount, currencySymbol);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-500" />
            <span>كشوفات الحسابات والشركات المؤجرة</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            متابعة إجمالي استحقاقات الشركات، السُلف الميدانية المخصومة، والمستحقات المتبقية ({currencySymbol})
          </p>
        </div>
      </div>

      {/* Companies Financial Ledger Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {companies.map((c) => {
          // Calculate stats for company
          const companyReports = reports.filter(r => r.companyName === c.name);
          const totalWorkGross = companyReports.reduce((acc, r) => acc + (r.grossAmount || 0), 0);
          const totalAdvances = companyReports.reduce((acc, r) => acc + (r.driverAdvance || 0), 0);
          const netRemaining = totalWorkGross - totalAdvances;

          return (
            <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="border-b pb-3">
                <h3 className="font-extrabold text-slate-900 text-base">{c.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">مسؤول الاتصال: {c.contactPerson} ({c.phone})</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>إجمالي قيمة تشغيل المعدات:</span>
                  <span className="font-extrabold text-slate-900">{formatCurr(totalWorkGross)}</span>
                </div>

                <div className="flex justify-between items-center text-amber-700">
                  <span>إجمالي السُلف الميدانية المقتطعة:</span>
                  <span className="font-extrabold text-amber-600">- {formatCurr(totalAdvances)}</span>
                </div>

                <div className="border-t pt-2 flex justify-between items-center text-sm font-black text-emerald-800">
                  <span>الصافي المستحق النهائي:</span>
                  <span>{formatCurr(netRemaining)}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 flex justify-between items-center">
                <span>عدد أيام العمل المسجلة:</span>
                <span className="font-bold text-slate-900">{companyReports.length} يوم عمل</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
