import React from 'react';
import { 
  Truck, 
  PlusCircle, 
  Settings, 
  Database, 
  Calendar,
  HardHat,
  FolderKanban,
  ChevronDown,
  LogOut,
  UserCheck,
  Smartphone
} from 'lucide-react';
import { Project, ProjectInfo } from '../types';

interface NavbarProps {
  currentProject: Project;
  totalProjectsCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewReport: () => void;
  onOpenProjectsManager: () => void;
  onOpenProjectSettings: () => void;
  onOpenBackupModal: () => void;
  onOpenAndroidExport?: () => void;
  totalReportsCount: number;
  currentUser?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  totalProjectsCount,
  activeTab,
  setActiveTab,
  onOpenNewReport,
  onOpenProjectsManager,
  onOpenProjectSettings,
  onOpenBackupModal,
  onOpenAndroidExport,
  totalReportsCount,
  currentUser,
  onLogout
}) => {
  const currentDate = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-slate-900 text-white shadow-lg border-b border-slate-800 sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Project Switcher Info */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 p-2.5 rounded-xl shadow-md flex items-center justify-center">
              <Truck className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenProjectsManager}
                  className="group text-right focus:outline-none flex items-center gap-2 hover:bg-slate-800/80 p-1.5 -mr-1.5 rounded-xl transition-colors cursor-pointer"
                  title="انقر للتنقل بين المشاريع أو إضافة مشروع جديد"
                >
                  <h1 className="text-base sm:text-lg font-black text-white group-hover:text-amber-400 transition-colors tracking-tight leading-tight">
                    {currentProject.name || 'مشروع جديد'}
                  </h1>
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                    <FolderKanban className="w-3 h-3" />
                    <span>{totalProjectsCount > 1 ? `تنقل (${totalProjectsCount} مشاريع)` : 'إدارة المشاريع'}</span>
                    <ChevronDown className="w-3 h-3" />
                  </span>
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span className="font-semibold text-slate-300">{currentProject.companyName}</span>
                <span className="inline-block w-1 h-1 rounded-full bg-slate-600"></span>
                <span className="flex items-center gap-1 text-slate-300 font-semibold">
                  <HardHat className="w-3 h-3 text-amber-400" /> {currentProject.managerName}
                </span>
                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-600"></span>
                <span className="hidden sm:inline-block text-slate-400">{currentProject.location}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="hidden md:flex items-center space-x-2.5 space-x-reverse">
            <button
              onClick={onOpenProjectsManager}
              className="bg-slate-800 hover:bg-slate-700/80 text-amber-400 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer shadow-xs"
            >
              <FolderKanban className="w-4 h-4 text-amber-400" />
              <span>المشاريع ({totalProjectsCount})</span>
            </button>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-slate-200">{currentDate}</span>
            </div>

            <button
              onClick={onOpenNewReport}
              className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>تسجيل يوم عمل</span>
            </button>

            <button
              onClick={onOpenBackupModal}
              title="النسخ الاحتياطي وإدارة البيانات"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {onOpenAndroidExport && (
              <button
                onClick={onOpenAndroidExport}
                title="تصدير تطبيق أندرويد (APK / Google Play)"
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>تطبيق أندرويد</span>
              </button>
            )}

            <button
              onClick={onOpenProjectSettings}
              title="تعديل بيانات هذا المشروع"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Current User Badge & Logout Button */}
            {currentUser && (
              <div className="flex items-center gap-1.5 border-r border-slate-800 pr-2.5">
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{currentUser}</span>
                </span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="تسجيل الخروج من النظام"
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">خروج</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onOpenProjectsManager}
              className="bg-slate-800 text-amber-400 p-2 rounded-xl text-xs flex items-center gap-1 border border-slate-700"
              title="المشاريع"
            >
              <FolderKanban className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenNewReport}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                title="تسجيل الخروج"
                className="bg-rose-500/20 text-rose-300 p-2 rounded-xl text-xs border border-rose-500/30"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};


