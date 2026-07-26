import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Fuel, 
  HardHat, 
  Building2, 
  Users, 
  PlusCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  reportsCount: number;
  lowStockAlert: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  reportsCount,
  lowStockAlert
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم والإحصائيات',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'new-report',
      label: 'تسجيل يوم عمل جديد',
      icon: PlusCircle,
      badge: null,
      highlight: true
    },
    {
      id: 'reports-list',
      label: 'سجلات وتقارير العمل',
      icon: FileText,
      badge: reportsCount > 0 ? reportsCount : null
    },
    {
      id: 'diesel-warehouse',
      label: 'مخزن وتوريد الديزل',
      icon: Fuel,
      badge: lowStockAlert ? 'تنبيه' : null,
      badgeColor: lowStockAlert ? 'bg-rose-500 text-white' : 'bg-amber-500/20 text-amber-600'
    },
    {
      id: 'equipment-manager',
      label: 'إدارة المعدات والعقود',
      icon: HardHat,
      badge: null
    },
    {
      id: 'companies-accounts',
      label: 'كشوفات الحسابات والشركات',
      icon: Building2,
      badge: null
    },
    {
      id: 'drivers-manager',
      label: 'إدارة السائقين والسُلف',
      icon: Users,
      badge: null
    }
  ];

  return (
    <aside className="bg-white border-b lg:border-b-0 lg:border-l border-slate-200 lg:w-64 flex-shrink-0 no-print flex flex-col justify-between">
      <div className="p-3 sm:p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 hidden lg:block px-3">
          القائمة الرئيسية
        </p>
        
        <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between whitespace-nowrap lg:whitespace-normal px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-amber-400 shadow-md shadow-slate-900/10'
                    : item.highlight
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isActive ? 'text-amber-400' : item.highlight ? 'text-amber-600' : 'text-slate-500'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full mr-2 ${
                    item.badgeColor || (isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700')
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Developer Credit Info Card at bottom of Sidebar */}
      <div className="p-3 m-3 hidden lg:block bg-gradient-to-br from-slate-900 to-slate-950 text-slate-200 rounded-2xl border border-amber-500/30 text-xs shadow-md">
        <div className="text-[11px] font-extrabold text-amber-400 mb-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>تصميم وإعداد:</span>
          </div>
        </div>
        <p className="font-extrabold text-white text-xs leading-snug">
          المهندس جهاد مفتاح
        </p>
        <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-bold text-slate-300 dir-ltr flex items-center justify-between">
          <span className="text-slate-400">للتواصل:</span>
          <a 
            href="tel:00967770999936" 
            className="text-amber-400 hover:underline font-mono font-bold"
          >
            00967770999936
          </a>
        </div>
      </div>
    </aside>
  );
};
