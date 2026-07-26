import React, { useState } from 'react';
import { Project, Equipment, WorkReport, SUPPORTED_CURRENCIES } from '../types';
import { 
  FolderKanban, 
  Plus, 
  CheckCircle2, 
  Building2, 
  HardHat, 
  MapPin, 
  Phone, 
  X, 
  Edit3, 
  Trash2, 
  ArrowRightLeft,
  Briefcase,
  Coins
} from 'lucide-react';

interface ProjectManagerModalProps {
  projects: Project[];
  activeProjectId: string;
  equipmentList: Equipment[];
  reportsList: WorkReport[];
  onSelectProject: (projectId: string) => void;
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onClose: () => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  projects,
  activeProjectId,
  equipmentList,
  reportsList,
  onSelectProject,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onClose
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [managerName, setManagerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [budget, setBudget] = useState<number | string>(250000);
  const [currency, setCurrency] = useState('ر.ي');

  const handleOpenAdd = () => {
    setEditingProject(null);
    setName('');
    setLocation('صنعاء - حي الحصبة');
    setManagerName('');
    setCompanyName('شركة المقاولات العامة');
    setPhone('0500000000');
    setCode(`PRJ-${Math.floor(10 + Math.random() * 90)}`);
    setBudget(250000);
    setCurrency('ر.ي');
    setShowAddForm(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setName(project.name);
    setLocation(project.location);
    setManagerName(project.managerName);
    setCompanyName(project.companyName);
    setPhone(project.phone);
    setCode(project.code || '');
    setBudget(project.budget || 250000);
    setCurrency(project.currency || 'ر.ي');
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const projectData: Project = {
      id: editingProject?.id || `proj-${Date.now()}`,
      name,
      location,
      managerName,
      companyName,
      phone,
      code: code || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      budget: Number(budget) || 0,
      currency: currency || 'ر.ي',
      status: 'active',
      createdAt: editingProject?.createdAt || new Date().toISOString()
    };

    if (editingProject) {
      onUpdateProject(projectData);
    } else {
      onAddProject(projectData);
      // Auto-switch to newly created project
      onSelectProject(projectData.id);
    }

    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3 flex-shrink-0">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-amber-500" />
              <span>إدارة والتنقل بين المشاريع التشغيلية</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              اختر المشروع النشط للعمل عليه، أو قم بإضافة مشروع إنشائي جديد للأسطول
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          
          {!showAddForm ? (
            <>
              {/* Action Top Bar */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  عدد المشاريع المسجلة: <strong className="text-slate-900">{projects.length}</strong>
                </span>
                <button
                  onClick={handleOpenAdd}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>إضافة مشروع جديد</span>
                </button>
              </div>

              {/* Projects Grid List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj) => {
                  const isActive = proj.id === activeProjectId;
                  const projEqCount = equipmentList.filter(e => e.projectId === proj.id || (!e.projectId && proj.id === 'proj-1')).length;
                  const projRepCount = reportsList.filter(r => r.projectId === proj.id || (!r.projectId && proj.id === 'proj-1')).length;

                  return (
                    <div 
                      key={proj.id} 
                      className={`p-4 rounded-2xl border transition-all space-y-3 relative flex flex-col justify-between ${
                        isActive 
                          ? 'border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-400/50' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>المشروع الحالي النشط</span>
                        </div>
                      )}

                      <div className="space-y-1.5 pr-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md">
                            {proj.code || 'PRJ'}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
                            {proj.name}
                          </h4>
                        </div>

                        <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 pt-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{proj.companyName}</span>
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-500" />
                            <span>{proj.location}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <HardHat className="w-3 h-3 text-slate-400" />
                            <span>{proj.managerName}</span>
                          </span>
                        </div>
                      </div>

                      {/* Stats Strip */}
                      <div className="bg-slate-100 rounded-xl p-2.5 grid grid-cols-3 text-center text-xs font-bold text-slate-700 gap-1">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-normal">الميزانية المرصودة</span>
                          <span className="text-emerald-700 font-black">{(proj.budget || 0).toLocaleString('ar-SA')} {proj.currency || 'ر.ي'}</span>
                        </div>
                        <div className="border-r border-slate-200 pr-2">
                          <span className="text-[10px] text-slate-400 block font-normal">المعدات</span>
                          <span className="text-slate-900">{projEqCount} معدة</span>
                        </div>
                        <div className="border-r border-slate-200 pr-2">
                          <span className="text-[10px] text-slate-400 block font-normal">اليوميات</span>
                          <span className="text-amber-700">{projRepCount} تقرير</span>
                        </div>
                      </div>

                      {/* Buttons Action Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(proj)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60"
                            title="تعديل تفاصيل المشروع"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {projects.length > 1 && (
                            <button
                              onClick={() => onDeleteProject(proj.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              title="حذف المشروع"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {isActive ? (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> جاري العمل عليه
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectProject(proj.id);
                              onClose();
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                            <span>الدخول للمشروع</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Add / Edit Project Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-500" />
                  <span>{editingProject ? 'تعديل بيانات المشروع' : 'إضافة مشروع تشغيلي جديد'}</span>
                </h4>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)} 
                  className="text-slate-400 hover:text-slate-600"
                >
                  إلغاء
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم المشروع الكامل:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: مشروع سكة الحديد - القطاع الشرقي"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 text-sm"
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
                      placeholder="250000"
                      min="0"
                      className="w-full bg-amber-50/50 border border-amber-300 rounded-xl p-2 font-extrabold text-amber-900 pl-16"
                      required
                    />
                    <span className="absolute left-3 top-2 text-xs font-black text-amber-800">{currency}</span>
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
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-extrabold text-slate-900 text-xs cursor-pointer focus:ring-2 focus:ring-amber-400"
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
                <label className="font-bold text-slate-700 block mb-1">كود/رمز المشروع:</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="PRJ-101"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الشركة المنفذة / المالك:</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="اسم الشركة"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المهندس / المشرف المسؤول:</label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="اسم المهندس المشرف"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم جوال التواصل:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">موقع المشروع / المدينة:</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="مثال: الدمام - المدينة الصناعية الثانية"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold hover:bg-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2 rounded-xl shadow-md cursor-pointer"
                >
                  {editingProject ? 'حفظ التغييرات' : 'حفظ واختيار هذا المشروع'}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
