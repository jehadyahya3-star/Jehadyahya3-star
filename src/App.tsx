import React, { useState, useEffect } from 'react';
import { 
  WorkReport, 
  DieselTransaction, 
  Equipment, 
  Company, 
  Driver, 
  Project,
  ProjectInfo 
} from './types';
import { 
  INITIAL_PROJECTS,
  INITIAL_PROJECT_INFO, 
  INITIAL_COMPANIES, 
  INITIAL_EQUIPMENT, 
  INITIAL_DRIVERS, 
  INITIAL_DIESEL_TRANSACTIONS, 
  INITIAL_WORK_REPORTS 
} from './data/initialData';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { WorkReportForm } from './components/WorkReportForm';
import { WorkReportsList } from './components/WorkReportsList';
import { DieselWarehouse } from './components/DieselWarehouse';
import { EquipmentManager } from './components/EquipmentManager';
import { CompaniesAndAccounts } from './components/CompaniesAndAccounts';
import { DriversManager } from './components/DriversManager';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { ProjectSettingsModal } from './components/ProjectSettingsModal';
import { DataBackupModal } from './components/DataBackupModal';
import { LoginScreen } from './components/LoginScreen';

export default function App() {
  // User Session Authentication State
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('eq_user_session');
  });

  const handleLoginSuccess = (username: string) => {
    localStorage.setItem('eq_user_session', username);
    setCurrentUser(username);
    showToast(`مرحباً بك يا ${username}! تم تسجيل الدخول بنجاح`);
  };

  const handleLogout = () => {
    if (window.confirm('هل أنت تأكد من تسجيل الخروج من النظام؟')) {
      localStorage.removeItem('eq_user_session');
      setCurrentUser(null);
    }
  };

  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Multi-Project States
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('eq_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const saved = localStorage.getItem('eq_active_project_id');
    return saved || INITIAL_PROJECTS[0]?.id || 'proj-1';
  });

  const currentProject = projects.find(p => p.id === activeProjectId) || projects[0] || INITIAL_PROJECTS[0];

  const projectInfo: ProjectInfo = {
    name: currentProject.name,
    location: currentProject.location,
    managerName: currentProject.managerName,
    companyName: currentProject.companyName,
    phone: currentProject.phone,
    budget: currentProject.budget || 250000,
    currency: currentProject.currency || 'ر.ي'
  };

  // App Data States with localStorage persistence
  const [reports, setReports] = useState<WorkReport[]>(() => {
    const saved = localStorage.getItem('eq_reports');
    return saved ? JSON.parse(saved) : INITIAL_WORK_REPORTS;
  });

  const [dieselTransactions, setDieselTransactions] = useState<DieselTransaction[]>(() => {
    const saved = localStorage.getItem('eq_diesel');
    return saved ? JSON.parse(saved) : INITIAL_DIESEL_TRANSACTIONS;
  });

  const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem('eq_equipment');
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENT;
  });

  const [companiesList, setCompaniesList] = useState<Company[]>(() => {
    const saved = localStorage.getItem('eq_companies');
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });

  const [driversList, setDriversList] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('eq_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  // Edit State
  const [editingReport, setEditingReport] = useState<WorkReport | null>(null);

  // Modals
  const [showProjectsManagerModal, setShowProjectsManagerModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  // Toast Banner State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('eq_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('eq_active_project_id', activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    localStorage.setItem('eq_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('eq_diesel', JSON.stringify(dieselTransactions));
  }, [dieselTransactions]);

  useEffect(() => {
    localStorage.setItem('eq_equipment', JSON.stringify(equipmentList));
  }, [equipmentList]);

  useEffect(() => {
    localStorage.setItem('eq_companies', JSON.stringify(companiesList));
  }, [companiesList]);

  useEffect(() => {
    localStorage.setItem('eq_drivers', JSON.stringify(driversList));
  }, [driversList]);

  // Active Project Isolated Data Subsets
  const activeReports = reports.filter(r => r.projectId === activeProjectId || (!r.projectId && activeProjectId === 'proj-1'));
  const activeDiesel = dieselTransactions.filter(d => d.projectId === activeProjectId || (!d.projectId && activeProjectId === 'proj-1'));
  const activeEquipment = equipmentList.filter(e => e.projectId === activeProjectId || (!e.projectId && activeProjectId === 'proj-1'));
  const activeCompanies = companiesList.filter(c => c.projectId === activeProjectId || (!c.projectId && activeProjectId === 'proj-1'));
  const activeDrivers = driversList.filter(dr => dr.projectId === activeProjectId || (!dr.projectId && activeProjectId === 'proj-1'));

  // Project Switch & CRUD Handlers
  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    const target = projects.find(p => p.id === projectId);
    if (target) {
      showToast(`🔄 تم الانتقال للعمل على: ${target.name}`);
    }
  };

  const handleAddProject = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    showToast(`✅ تم إضافة مشروع جديد: ${newProject.name}`);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    showToast('✅ تم تعديل تفاصيل المشروع');
  };

  const handleDeleteProject = (projectId: string) => {
    if (projects.length <= 1) {
      alert('لا يمكن حذف المشروع الوحيد في النظام');
      return;
    }
    if (window.confirm('هل أنت تأكد من حذف هذا المشروع وببياناته؟')) {
      const remaining = projects.filter(p => p.id !== projectId);
      setProjects(remaining);
      if (activeProjectId === projectId) {
        setActiveProjectId(remaining[0].id);
      }
      showToast('🗑️ تم حذف المشروع');
    }
  };

  // Handler: Save/Update Work Report
  const handleSaveReport = (report: WorkReport) => {
    const reportWithProject = {
      ...report,
      projectId: report.projectId || activeProjectId
    };

    const existingIdx = reports.findIndex(r => r.id === report.id);
    if (existingIdx >= 0) {
      const updated = [...reports];
      updated[existingIdx] = reportWithProject;
      setReports(updated);
      showToast('✅ تم تعديل التقرير بنجاح');
    } else {
      setReports([reportWithProject, ...reports]);
      showToast('✅ تم تسجيل يوم العمل بنجاح');
    }

    // Auto record diesel usage in diesel warehouse if diesel liters specified
    if (report.costs?.dieselLiters && report.costs.dieselLiters > 0) {
      const newDieselTx: DieselTransaction = {
        id: `ds-auto-${Date.now()}`,
        projectId: activeProjectId,
        date: report.date,
        type: 'consume',
        quantityLiters: report.costs.dieselLiters,
        pricePerLiter: report.costs.dieselCostPerLiter || 2.3,
        totalCost: report.costs.dieselTotalCost || (report.costs.dieselLiters * 2.3),
        equipmentName: report.equipmentName,
        driverName: report.driverName,
        notes: `تعبئة تلقائية من التقرير رقم ${report.reportNumber}`,
        createdAt: new Date().toISOString()
      };
      setDieselTransactions(prev => [newDieselTx, ...prev]);
    }

    setEditingReport(null);
    setActiveTab('reports-list');
  };

  // Handler: Delete Work Report
  const handleDeleteReport = (reportId: string) => {
    if (window.confirm('هل أنت أصل من حذف هذا التقرير؟')) {
      setReports(prev => prev.filter(r => r.id !== reportId));
      showToast('🗑️ تم حذف التقرير');
    }
  };

  // Handler: Edit Report
  const handleEditReport = (report: WorkReport) => {
    setEditingReport(report);
    setActiveTab('new-report');
  };

  // Diesel Handlers
  const handleAddDieselTransaction = (tx: DieselTransaction) => {
    const txWithProject = {
      ...tx,
      projectId: tx.projectId || activeProjectId
    };
    setDieselTransactions([txWithProject, ...dieselTransactions]);
    showToast('✅ تم تسجيل حركة الديزل');
  };

  const handleDeleteDieselTransaction = (id: string) => {
    setDieselTransactions(prev => prev.filter(t => t.id !== id));
    showToast('🗑️ تم حذف حركة الديزل');
  };

  // Equipment Handlers
  const handleAddEquipment = (eq: Equipment) => {
    const eqWithProject = {
      ...eq,
      projectId: eq.projectId || activeProjectId
    };
    setEquipmentList([...equipmentList, eqWithProject]);
    showToast('✅ تم إضافة المعدة للمشروع');
  };

  const handleUpdateEquipment = (eq: Equipment) => {
    setEquipmentList(prev => prev.map(item => item.id === eq.id ? eq : item));
    showToast('✅ تم تعديل بيانات المعدة');
  };

  const handleDeleteEquipment = (id: string) => {
    setEquipmentList(prev => prev.filter(e => e.id !== id));
    showToast('🗑️ تم حذف المعدة');
  };

  // Export JSON Backup
  const handleExportDataBackup = () => {
    const data = {
      projects,
      activeProjectId,
      reports,
      dieselTransactions,
      equipmentList,
      companiesList,
      driversList,
      backupDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `نسخة_احتياطية_مشاريع_المعدات_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    showToast('📥 تم تحميل ملف النسخة الاحتياطية');
  };

  // Import JSON Backup
  const handleImportDataBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.activeProjectId) setActiveProjectId(parsed.activeProjectId);
        if (parsed.reports) setReports(parsed.reports);
        if (parsed.dieselTransactions) setDieselTransactions(parsed.dieselTransactions);
        if (parsed.equipmentList) setEquipmentList(parsed.equipmentList);
        if (parsed.companiesList) setCompaniesList(parsed.companiesList);
        if (parsed.driversList) setDriversList(parsed.driversList);
        showToast('✅ تم استعادة كافة المشاريع والبيانات بنجاح');
        setShowBackupModal(false);
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف JSON');
      }
    };
    reader.readAsText(file);
  };

  // Reset to initial
  const handleResetData = () => {
    if (window.confirm('هل أنت متاكد من إعادة البيانات إلى الوضع الافتراضي؟')) {
      setProjects(INITIAL_PROJECTS);
      setActiveProjectId(INITIAL_PROJECTS[0].id);
      setReports(INITIAL_WORK_REPORTS);
      setDieselTransactions(INITIAL_DIESEL_TRANSACTIONS);
      setEquipmentList(INITIAL_EQUIPMENT);
      setCompaniesList(INITIAL_COMPANIES);
      setDriversList(INITIAL_DRIVERS);
      localStorage.clear();
      showToast('🔄 تم إعادة ضبط البيانات بنجاح');
      setShowBackupModal(false);
    }
  };

  // Calculate diesel alert for sidebar badge
  const totalReceivedDiesel = activeDiesel
    .filter(t => t.type === 'receive')
    .reduce((acc, t) => acc + t.quantityLiters, 0);
  const totalConsumedDiesel = activeDiesel
    .filter(t => t.type === 'consume')
    .reduce((acc, t) => acc + t.quantityLiters, 0);
  const isDieselLow = (totalReceivedDiesel - totalConsumedDiesel) < 1000;

  // If not logged in, show Login Screen strictly
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Cairo',sans-serif] text-slate-800">
      
      {/* Navbar Header */}
      <Navbar
        currentProject={currentProject}
        totalProjectsCount={projects.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewReport={() => {
          setEditingReport(null);
          setActiveTab('new-report');
        }}
        onOpenProjectsManager={() => setShowProjectsManagerModal(true)}
        onOpenProjectSettings={() => setShowProjectModal(true)}
        onOpenBackupModal={() => setShowBackupModal(true)}
        totalReportsCount={activeReports.length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'new-report') setEditingReport(null);
            setActiveTab(tab);
          }}
          reportsCount={activeReports.length}
          lowStockAlert={isDieselLow}
        />

        {/* Dynamic Page Content Stage */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          
          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="mb-4 bg-slate-900 text-amber-400 font-extrabold px-4 py-3 rounded-xl shadow-lg border border-slate-700 text-xs sm:text-sm flex items-center justify-between animate-bounce">
              <span>{toastMessage}</span>
              <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              reports={activeReports}
              dieselTransactions={activeDiesel}
              equipment={activeEquipment}
              companies={activeCompanies}
              drivers={activeDrivers}
              projectInfo={projectInfo}
              allProjects={projects}
              allDieselTransactions={dieselTransactions}
              allReports={reports}
              onNavigateTab={setActiveTab}
              onOpenNewReport={() => {
                setEditingReport(null);
                setActiveTab('new-report');
              }}
            />
          )}

          {activeTab === 'new-report' && (
            <WorkReportForm
              equipmentList={activeEquipment}
              companiesList={activeCompanies}
              driversList={activeDrivers}
              onSaveReport={handleSaveReport}
              onCancel={() => setActiveTab('reports-list')}
              existingReport={editingReport}
            />
          )}

          {activeTab === 'reports-list' && (
            <WorkReportsList
              reports={activeReports}
              projectInfo={projectInfo}
              onEditReport={handleEditReport}
              onDeleteReport={handleDeleteReport}
              onOpenNewReport={() => {
                setEditingReport(null);
                setActiveTab('new-report');
              }}
            />
          )}

          {activeTab === 'diesel-warehouse' && (
            <DieselWarehouse
              transactions={activeDiesel}
              equipmentList={activeEquipment}
              driversList={activeDrivers}
              projectInfo={projectInfo}
              onAddTransaction={handleAddDieselTransaction}
              onDeleteTransaction={handleDeleteDieselTransaction}
            />
          )}

          {activeTab === 'equipment-manager' && (
            <EquipmentManager
              equipmentList={activeEquipment}
              reports={activeReports}
              onAddEquipment={handleAddEquipment}
              onUpdateEquipment={handleUpdateEquipment}
              onDeleteEquipment={handleDeleteEquipment}
            />
          )}

          {activeTab === 'companies-accounts' && (
            <CompaniesAndAccounts
              companies={activeCompanies}
              reports={activeReports}
              projectInfo={projectInfo}
              onAddCompany={(c) => {
                const cWithProject = { ...c, projectId: activeProjectId };
                setCompaniesList([...companiesList, cWithProject]);
                showToast('✅ تم إضافة الشركة لهذا المشروع');
              }}
            />
          )}

          {activeTab === 'drivers-manager' && (
            <DriversManager
              drivers={activeDrivers}
              reports={activeReports}
              onAddDriver={(d) => {
                const dWithProject = { ...d, projectId: activeProjectId };
                setDriversList([...driversList, dWithProject]);
                showToast('✅ تم إضافة السائق لهذا المشروع');
              }}
            />
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-4 px-6 border-t border-slate-800 no-print mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-right">
          <div>
            <span className="font-bold text-slate-300">{currentProject.name}</span>
            <span className="mx-2 text-slate-700">|</span>
            <span className="text-slate-400">{currentProject.companyName} ({currentProject.location})</span>
          </div>
          <div className="bg-slate-900 border border-amber-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-amber-400 font-extrabold text-xs shadow-2xs">
            <span>تصميم وإعداد المهندس جهاد مفتاح</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-200">للتواصل :</span>
            <a href="tel:00967770999936" className="text-amber-400 font-mono underline font-extrabold dir-ltr">
              00967770999936
            </a>
          </div>
        </div>
      </footer>

      {/* Projects Switcher / Manager Modal */}
      {showProjectsManagerModal && (
        <ProjectManagerModal
          projects={projects}
          activeProjectId={activeProjectId}
          equipmentList={equipmentList}
          reportsList={reports}
          onSelectProject={handleSelectProject}
          onAddProject={handleAddProject}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          onClose={() => setShowProjectsManagerModal(false)}
        />
      )}

      {/* Project Settings Modal */}
      {showProjectModal && (
        <ProjectSettingsModal
          projectInfo={projectInfo}
          onSave={(updated) => {
            const updatedProject: Project = {
              ...currentProject,
              name: updated.name,
              companyName: updated.companyName,
              managerName: updated.managerName,
              location: updated.location,
              phone: updated.phone,
              budget: updated.budget || currentProject.budget || 250000,
              currency: updated.currency || currentProject.currency || 'ر.ي'
            };
            handleUpdateProject(updatedProject);
          }}
          onClose={() => setShowProjectModal(false)}
        />
      )}

      {/* Data Backup & Restore Modal */}
      {showBackupModal && (
        <DataBackupModal
          onExportData={handleExportDataBackup}
          onImportData={handleImportDataBackup}
          onResetData={handleResetData}
          onClose={() => setShowBackupModal(false)}
        />
      )}

    </div>
  );
}

