import React, { useState } from 'react';
import { Driver, WorkReport } from '../types';
import { Users, Plus, Edit3, Trash2, Phone, ShieldCheck, Receipt } from 'lucide-react';

interface DriversManagerProps {
  drivers: Driver[];
  reports: WorkReport[];
  onAddDriver: (driver: Driver) => void;
}

export const DriversManager: React.FC<DriversManagerProps> = ({
  drivers,
  reports,
  onAddDriver
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            <span>إدارة السائقين والسُلف الشخصية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            متابعة بيانات السائقين، المعدات المعينة، وإجمالي السُلف المسحوبة
          </p>
        </div>
      </div>

      {/* Drivers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {drivers.map((d) => {
          const driverReports = reports.filter(r => r.driverName === d.name);
          const totalDriverHours = driverReports.reduce((acc, r) => acc + (r.totalNetHours || 0), 0);
          const totalAdvances = driverReports.reduce((acc, r) => acc + (r.driverAdvance || 0), 0);

          return (
            <div key={d.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-extrabold text-slate-900 text-sm">{d.name}</h3>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {d.salaryType}
                </span>
              </div>

              <div className="text-xs space-y-1 text-slate-600">
                <div>الجوال: <strong className="text-slate-900">{d.phone}</strong></div>
                <div>الرخصة: <strong className="text-slate-900">{d.licenseNumber}</strong></div>
                <div>المعدة: <strong className="text-amber-700">{d.assignedEquipment || 'غير محدد'}</strong></div>
              </div>

              <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span>إجمالي الساعات:</span>
                  <span className="font-bold text-blue-400">{totalDriverHours} س</span>
                </div>
                <div className="flex justify-between">
                  <span>إجمالي السُلف:</span>
                  <span className="font-bold text-amber-400">{totalAdvances} ر.س</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
