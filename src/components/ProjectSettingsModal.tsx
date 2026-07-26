import React, { useState } from 'react';
import { ProjectInfo, SUPPORTED_CURRENCIES } from '../types';
import { Settings, X, Coins } from 'lucide-react';

interface ProjectSettingsModalProps {
  projectInfo: ProjectInfo;
  onSave: (info: ProjectInfo) => void;
  onClose: () => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  projectInfo,
  onSave,
  onClose
}) => {
  const [name, setName] = useState(projectInfo.name);
  const [companyName, setCompanyName] = useState(projectInfo.companyName);
  const [managerName, setManagerName] = useState(projectInfo.managerName);
  const [location, setLocation] = useState(projectInfo.location);
  const [phone, setPhone] = useState(projectInfo.phone);
  const [budget, setBudget] = useState<number | string>(projectInfo.budget || 250000);
  const [currency, setCurrency] = useState(projectInfo.currency || 'ر.ي');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      name, 
      companyName, 
      managerName, 
      location, 
      phone,
      budget: Number(budget) || 0,
      currency
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            <span>تعديل إعدادات وبيانات المشروع الرئيسي</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">اسم المشروع الرئيسي:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold text-slate-900 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">الميزانية المرصودة للمشروع:</label>
              <div className="relative">
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-amber-50/50 border border-amber-300 rounded-xl p-2.5 font-extrabold text-amber-900 text-sm pl-16"
                  placeholder="250000"
                  min="0"
                  required
                />
                <span className="absolute left-3 top-2.5 text-xs font-black text-amber-800">{currency}</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>عملة المشروع:</span>
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-extrabold text-slate-900 text-xs cursor-pointer focus:ring-2 focus:ring-amber-400"
              >
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.symbol}>
                    {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">اسم الشركة المنفذة / المقاول الرئيسي:</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">اسم المهندس / المشرف العام:</label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">هاتف التواصل:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">موقع / مدينة المشروع:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2 rounded-xl cursor-pointer"
            >
              حفظ التغييرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
