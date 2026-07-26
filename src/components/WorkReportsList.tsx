import React, { useState } from 'react';
import { WorkReport, ProjectInfo } from '../types';
import { 
  formatCurrency, 
  getContractTypeName, 
  exportReportsToExcel, 
  exportReportsToPDF, 
  printElement 
} from '../utils/exportUtils';
import { 
  signInWithGoogle, 
  exportReportToGoogleDoc, 
  getAccessToken 
} from '../utils/googleDocs';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Eye, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Truck, 
  User, 
  PenTool, 
  FileSpreadsheet, 
  FileCheck,
  Calendar,
  RotateCcw,
  SlidersHorizontal,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface WorkReportsListProps {
  reports: WorkReport[];
  projectInfo: ProjectInfo;
  onEditReport: (report: WorkReport) => void;
  onDeleteReport: (reportId: string) => void;
  onOpenNewReport: () => void;
}

export const WorkReportsList: React.FC<WorkReportsListProps> = ({
  reports,
  projectInfo,
  onEditReport,
  onDeleteReport,
  onOpenNewReport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDriverFilter, setSelectedDriverFilter] = useState('all');
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState('all');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('all');
  const [selectedContractFilter, setSelectedContractFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<WorkReport | null>(null);

  // Google Docs Export States
  const [isExportingDoc, setIsExportingDoc] = useState(false);
  const [createdDocUrl, setCreatedDocUrl] = useState<string | null>(null);

  const handleExportToGoogleDoc = async () => {
    try {
      setIsExportingDoc(true);
      let token = await getAccessToken();
      if (!token) {
        const authRes = await signInWithGoogle();
        token = authRes?.accessToken || null;
      }

      if (!token) {
        alert('يرجى تسجيل الدخول بحساب جوجل لإتمام التصدير');
        return;
      }

      let docText = `تقرير سجلات وتقارير يومية العمل - ${projectInfo.name}\n`;
      docText += `تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}\n`;
      docText += `المشروع: ${projectInfo.name} | الموقع: ${projectInfo.location || 'غير محدد'}\n`;
      docText += `فلترة التقرير: ${getFilterSummaryText()}\n\n`;
      docText += `--------------------------------------------------\n`;
      docText += `ملخص الإحصائيات:\n`;
      docText += `عدد التقارير: ${filteredReports.length}\n`;
      docText += `إجمالي الساعات الصافية: ${filteredReports.reduce((s, r) => s + (r.totalNetHours || 0), 0)} ساعة\n`;
      docText += `إجمالي كمية الديزل: ${filteredReports.reduce((s, r) => s + (r.dieselLiters || 0), 0)} لتر\n`;
      docText += `إجمالي المستحقات المالية: ${filteredReports.reduce((s, r) => s + (r.grossAmount || 0), 0)} ${projectInfo.currency || 'ر.ي'}\n`;
      docText += `--------------------------------------------------\n\n`;

      docText += `تفاصيل السجلات:\n`;
      filteredReports.forEach((r, idx) => {
        docText += `${idx + 1}. تقرير رقم: ${r.reportNumber} | التاريخ: ${r.date}\n`;
        docText += `   المعدة: ${r.equipmentName} | السائق: ${r.driverName} | الشركة: ${r.companyName}\n`;
        docText += `   ساعات العمل الصافية: ${r.totalNetHours} س | الديزل: ${r.dieselLiters || 0} لتر\n`;
        docText += `   المبلغ الإجمالي: ${r.grossAmount || 0} ${projectInfo.currency || 'ر.ي'}\n`;
        if (r.workDescription) docText += `   بيان العمل: ${r.workDescription}\n`;
        docText += `\n`;
      });

      const docTitle = `تقرير يومية العمل - ${projectInfo.name} - ${new Date().toISOString().slice(0, 10)}`;
      const result = await exportReportToGoogleDoc(docTitle, docText, token);
      
      setCreatedDocUrl(result.documentUrl);
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء التصدير لمستندات جوجل: ' + (err.message || err));
    } finally {
      setIsExportingDoc(false);
    }
  };

  // Extract unique filter lists
  const companies = Array.from(new Set(reports.map(r => r.companyName))).filter(Boolean);
  const equipmentNames = Array.from(new Set(reports.map(r => r.equipmentName))).filter(Boolean);
  const driverNames = Array.from(new Set(reports.map(r => r.driverName))).filter(Boolean);

  // Filter reports
  const filteredReports = reports.filter(r => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = 
      !query ||
      r.reportNumber.toLowerCase().includes(query) ||
      r.driverName.toLowerCase().includes(query) ||
      r.equipmentName.toLowerCase().includes(query) ||
      r.companyName.toLowerCase().includes(query) ||
      r.date.includes(query);

    const matchesDate = !selectedDate || r.date === selectedDate;
    const matchesDriver = selectedDriverFilter === 'all' || r.driverName === selectedDriverFilter;
    const matchesEquipment = selectedEquipmentFilter === 'all' || r.equipmentName === selectedEquipmentFilter;
    const matchesCompany = selectedCompanyFilter === 'all' || r.companyName === selectedCompanyFilter;
    const matchesContract = selectedContractFilter === 'all' || r.contractType === selectedContractFilter;

    return matchesSearch && matchesDate && matchesDriver && matchesEquipment && matchesCompany && matchesContract;
  });

  // Construct active filter summary text for PDF export
  const getFilterSummaryText = () => {
    const parts: string[] = [];
    if (searchTerm) parts.push(`البحث: "${searchTerm}"`);
    if (selectedDate) parts.push(`التاريخ: ${selectedDate}`);
    if (selectedEquipmentFilter !== 'all') parts.push(`المعدة: ${selectedEquipmentFilter}`);
    if (selectedDriverFilter !== 'all') parts.push(`السائق: ${selectedDriverFilter}`);
    if (selectedCompanyFilter !== 'all') parts.push(`الشركة: ${selectedCompanyFilter}`);
    if (selectedContractFilter !== 'all') parts.push(`نوع العقد: ${getContractTypeName(selectedContractFilter)}`);
    return parts.length > 0 ? parts.join(' | ') : 'كافة تقارير المشروع الكلية';
  };

  const hasActiveFilters = 
    searchTerm !== '' || 
    selectedDate !== '' || 
    selectedDriverFilter !== 'all' || 
    selectedEquipmentFilter !== 'all' || 
    selectedCompanyFilter !== 'all' || 
    selectedContractFilter !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDate('');
    setSelectedDriverFilter('all');
    setSelectedEquipmentFilter('all');
    setSelectedCompanyFilter('all');
    setSelectedContractFilter('all');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-500" />
              <span>سجلات وتقارير يومية العمل</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              عرض كافـة السجلات، البحث بالشركة أو المعدة، التصدير لـ PDF و Excel وطباعة التقارير
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportReportsToExcel(filteredReports)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>تصدير Excel</span>
            </button>

            <button
              onClick={() => exportReportsToPDF(filteredReports, projectInfo, 'كشف تقارير يومية العمل المفلترة', getFilterSummaryText())}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-rose-600" />
              <span>تصدير PDF</span>
            </button>

            <button
              onClick={handleExportToGoogleDoc}
              disabled={isExportingDoc}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="إنشاء مستند تقرير مفصل في مستندات جوجل (Google Docs)"
            >
              {isExportingDoc ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 text-blue-600" />
              )}
              <span>{isExportingDoc ? 'جاري التصدير...' : 'مستندات جوجل (Docs)'}</span>
            </button>

            <button
              onClick={onOpenNewReport}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer"
            >
              + إضافة تقرير
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-3">
          {/* Main Search Input */}
          <div className="relative">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute right-3.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث شامل برقم التقرير، اسم السائق، اسم المعدة، الشركة..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-9 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                title="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Advanced Filter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-1">
            
            {/* Filter by Specific Date */}
            <div className="relative">
              <label className="text-[10px] font-bold text-slate-500 block mb-1">تاريخ يومية العمل:</label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate('')}
                    className="absolute left-2 top-2 text-slate-400 hover:text-rose-600 text-xs"
                    title="مسح التاريخ"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter by Equipment */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">اسم المعدة:</label>
              <select
                value={selectedEquipmentFilter}
                onChange={(e) => setSelectedEquipmentFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">كافة المعدات ({equipmentNames.length})</option>
                {equipmentNames.map((eq, i) => (
                  <option key={i} value={eq}>{eq}</option>
                ))}
              </select>
            </div>

            {/* Filter by Driver */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">اسم السائق:</label>
              <select
                value={selectedDriverFilter}
                onChange={(e) => setSelectedDriverFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">كافة السائقين ({driverNames.length})</option>
                {driverNames.map((driver, i) => (
                  <option key={i} value={driver}>{driver}</option>
                ))}
              </select>
            </div>

            {/* Filter by Company */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">الشركة المؤجرة:</label>
              <select
                value={selectedCompanyFilter}
                onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">كافة الشركات ({companies.length})</option>
                {companies.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Filter by Contract Type */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">نوع العقد:</label>
              <select
                value={selectedContractFilter}
                onChange={(e) => setSelectedContractFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">كافة أنواع العقود</option>
                <option value="daily">يومي</option>
                <option value="hourly">ساعة</option>
                <option value="meter">متر</option>
                <option value="monthly">شهري</option>
                <option value="salary">راتب</option>
              </select>
            </div>

          </div>

          {/* Filter Summary Status & Reset Action */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
              <span>تم العثور على <strong className="text-slate-900 font-extrabold">{filteredReports.length}</strong> من أصل <strong className="text-slate-700">{reports.length}</strong> تقرير عمل</span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1.5 text-xs bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-lg border border-amber-200/60 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط الفلاتر</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reports Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-900 text-white font-bold">
              <tr>
                <th className="p-3.5">رقم التقرير</th>
                <th className="p-3.5">التاريخ</th>
                <th className="p-3.5">اسم المعدة واللوحة</th>
                <th className="p-3.5">الشركة المؤجرة</th>
                <th className="p-3.5">السائق</th>
                <th className="p-3.5 text-center">نوع العقد</th>
                <th className="p-3.5 text-center">الساعات</th>
                <th className="p-3.5 text-center">السلفة</th>
                <th className="p-3.5 text-left">الصافي</th>
                <th className="p-3.5 text-center">خيارات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-bold">
                    لا توجد تقارير مطابقة لمحددات البحث الحالية
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-amber-600">{report.reportNumber}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{report.date}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{report.equipmentName}</div>
                      <div className="text-[10px] text-slate-400">{report.equipmentRegNumber}</div>
                    </td>
                    <td className="p-3.5 font-medium">{report.companyName}</td>
                    <td className="p-3.5 font-medium">{report.driverName}</td>
                    <td className="p-3.5 text-center">
                      <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-lg text-xs">
                        {getContractTypeName(report.contractType)}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-bold text-blue-600">
                      {report.totalNetHours} س
                    </td>
                    <td className="p-3.5 text-center font-bold text-amber-600">
                      {report.driverAdvance} ر.س
                    </td>
                    <td className="p-3.5 text-left font-extrabold text-emerald-700">
                      {formatCurrency(report.netCompanyDue)}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedReport(report)}
                          title="معاينة وطباعة التقرير"
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditReport(report)}
                          title="تعديل البيانات"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteReport(report.id)}
                          title="حذف التقرير"
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Report View / Print Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl my-8 relative">
            
            {/* Modal Top Actions Header */}
            <div className="flex items-center justify-between border-b pb-4 no-print">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-lg">
                  تفاصيل كشف يومية العمل ({selectedReport.reportNumber})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => printElement('single-report-print')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة المستند</span>
                </button>

                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Container Document */}
            <div id="single-report-print" className="space-y-6 p-4 border border-slate-200 rounded-xl bg-white">
              
              {/* Report Document Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-black text-slate-900">{projectInfo.name}</h1>
                  <p className="text-xs text-slate-600 mt-1">{projectInfo.companyName} | هاتف: {projectInfo.phone}</p>
                  <p className="text-xs text-slate-500">الموقع: {projectInfo.location}</p>
                </div>

                <div className="text-left">
                  <div className="bg-amber-500 text-slate-950 font-black px-3 py-1 rounded-lg text-xs inline-block">
                    كشف يومية عمل
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-2">رقم: {selectedReport.reportNumber}</div>
                  <div className="text-xs text-slate-600">التاريخ: {selectedReport.date}</div>
                </div>
              </div>

              {/* Equipment & Driver Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-500 block">المعدة:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedReport.equipmentName}</span>
                  <span className="text-slate-600 block">رقم اللوحة: {selectedReport.equipmentRegNumber}</span>
                </div>

                <div>
                  <span className="font-bold text-slate-500 block">الشركة المؤجرة:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedReport.companyName}</span>
                  <span className="text-slate-600 block">نوع العقد: {getContractTypeName(selectedReport.contractType)}</span>
                </div>

                <div>
                  <span className="font-bold text-slate-500 block">السائق المستلم:</span>
                  <span className="font-bold text-slate-800">{selectedReport.driverName} ({selectedReport.driverPhone})</span>
                </div>

                <div>
                  <span className="font-bold text-slate-500 block">قراءة العدادات:</span>
                  <span className="font-bold text-slate-800">من {selectedReport.meterStart} إلى {selectedReport.meterEnd}</span>
                </div>
              </div>

              {/* Shift Periods Table */}
              <div>
                <h4 className="font-bold text-xs text-slate-700 mb-2">فترات وساعات العمل بالوردية:</h4>
                <table className="w-full text-right text-xs border border-slate-200">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2 border">الفترة</th>
                      <th className="p-2 border">وقت البدء</th>
                      <th className="p-2 border">وقت الانتهاء</th>
                      <th className="p-2 border text-center">الخصم (د)</th>
                      <th className="p-2 border text-center">الصافي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.periods.map((p, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2 border font-bold">{p.periodName}</td>
                        <td className="p-2 border">{p.startTime}</td>
                        <td className="p-2 border">{p.endTime}</td>
                        <td className="p-2 border text-center">{p.breakMinutes || 0} د</td>
                        <td className="p-2 border text-center font-bold text-blue-700">{p.netHours} ساعة</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Statement */}
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>ساعات التشغيل الفعالة:</span>
                  <span className="font-bold text-white">{selectedReport.totalNetHours} ساعة</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>سعر التشغيل بالساعة:</span>
                  <span className="font-bold text-white">{selectedReport.ratePerUnit} ر.س / ساعة</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800 pt-2 font-bold">
                  <span>التكلفة الإجمالية للتقرير (ساعات التشغيل × السعر):</span>
                  <span className="font-black text-amber-400 text-sm">{selectedReport.grossAmount} ر.س</span>
                </div>
                <div className="flex justify-between items-center text-rose-300 pt-1">
                  <span>تخصم السلفة اليومية المقيدة للسائق:</span>
                  <span className="font-bold text-rose-400">- {selectedReport.driverAdvance} ر.س</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-700 pt-2 text-sm font-black">
                  <span>الصافي المتبقي للشركة:</span>
                  <span className="text-emerald-400 text-base">{selectedReport.netCompanyDue} ر.س</span>
                </div>
              </div>

              {/* Driver Digital Signature View */}
              {selectedReport.driverSignature && (
                <div className="pt-2 border-t flex justify-between items-end text-xs">
                  <div>
                    <span className="font-bold text-slate-500 block">توقيع السائق / المشرف:</span>
                    <img
                      src={selectedReport.driverSignature}
                      alt="توقيع السائق"
                      className="h-12 border rounded-lg bg-slate-50 mt-1 p-1"
                    />
                  </div>
                  <div className="text-left text-slate-400 text-[10px]">
                    اعتماد المشرف الميداني
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* Google Docs Success Modal */}
      {createdDocUrl && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-center shadow-2xl border border-blue-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <FileText className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-lg">تم إنشاء مستند جوجل بنجاح!</h3>
              <p className="text-xs text-slate-600">
                تم حفظ التقرير في حساب جوجل دوكس الخاص بك. يمكنك فتحه والتعديل عليه أو مشاركته مع فريق العمل.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={createdDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <span>فتح المستند في Google Docs</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => setCreatedDocUrl(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
