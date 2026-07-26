import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { WorkReport, DieselTransaction, ProjectInfo } from '../types';

/**
 * Format currency with custom currency symbol (defaults to 'ر.ي' or provided symbol)
 */
export const formatCurrency = (amount: number, currencySymbol: string = 'ر.ي') => {
  const formatted = (amount || 0).toLocaleString('ar-SA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  return `${formatted} ${currencySymbol}`;
};

/**
 * Format date in localized Arabic format
 */
export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return dateString;
  }
};

/**
 * Export Work Reports to Excel (.xlsx)
 */
export const exportReportsToExcel = (reports: WorkReport[], filename: string = 'تقارير_العمل_والمعدات.xlsx') => {
  const dataToExport = reports.map((r, idx) => ({
    '#': idx + 1,
    'رقم التقرير': r.reportNumber,
    'التاريخ': r.date,
    'نوع العقد': getContractTypeName(r.contractType),
    'اسم الشركة': r.companyName,
    'اسم المعدة': r.equipmentName,
    'رقم اللوحة': r.equipmentRegNumber,
    'اسم السائق': r.driverName,
    'ساعات العمل': r.totalNetHours,
    'قراءة العداد (بداية)': r.meterStart,
    'قراءة العداد (نهاية)': r.meterEnd,
    'الكمية بالمتـر': r.quantityMeters || '-',
    'الفئات / السعر': r.ratePerUnit,
    'المبلغ الإجمالي': r.grossAmount,
    'تكلفة الديزل': r.costs?.dieselTotalCost || 0,
    'سلفة السائق اليومية': r.driverAdvance || 0,
    'الصافي المستحق': r.netCompanyDue,
    'الملاحظات': r.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'سجلات العمل');
  
  // Set sheet directional properties if available
  worksheet['!dir'] = 'rtl';
  
  XLSX.writeFile(workbook, filename);
};

/**
 * Export Diesel Transactions to Excel (.xlsx)
 */
export const exportDieselToExcel = (transactions: DieselTransaction[], filename: string = 'سجل_مخزن_الديزل.xlsx') => {
  const dataToExport = transactions.map((t, idx) => ({
    '#': idx + 1,
    'التاريخ': t.date,
    'نوع العملية': t.type === 'receive' ? 'استلام (وارد)' : 'صرف لمعدة (صادر)',
    'رقم سند الصرف/الاستلام': t.voucherNumber || '-',
    'رقم الفاتورة / أمر التوريد': t.invoiceNumber || '-',
    'الكمية (لتر)': t.quantityLiters,
    'سعر اللتر': t.pricePerLiter,
    'التكلفة الإجمالية': t.totalCost,
    'الجهة / المعدة المستفيدة': t.type === 'receive' ? (t.equipmentName || 'مخزن المشروع الرئيسي') : (t.equipmentName || '-'),
    'اسم المستلم (أمين المخزن/السائق)': t.driverName || '-',
    'سائق ناقلة التوريد (الوايت)': t.deliveryDriverName || '-',
    'وارد من (المورد / المصدر)': t.type === 'receive' ? (t.supplierOrSource || '-') : 'مخزن المشروع',
    'ملاحظات': t.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'حركات الديزل');
  worksheet['!dir'] = 'rtl';

  XLSX.writeFile(workbook, filename);
};

/**
 * Helper to translate contract type key
 */
export const getContractTypeName = (type: string) => {
  switch (type) {
    case 'daily': return 'يومي';
    case 'salary': return 'راتب';
    case 'hourly': return 'ساعة';
    case 'meter': return 'متر';
    case 'monthly': return 'شهري';
    default: return type;
  }
};

/**
 * Export Work Reports to PDF document with rich Arabic formatting, KPI cards, and print trigger
 */
export const exportReportsToPDF = (
  reports: WorkReport[], 
  projectInfo: ProjectInfo, 
  title: string = 'كشف تقارير يومية العمل والمعدات',
  filterSummary?: string
) => {
  const totalGross = reports.reduce((acc, curr) => acc + (curr.grossAmount || 0), 0);
  const totalAdvances = reports.reduce((acc, curr) => acc + (curr.driverAdvance || 0), 0);
  const totalNet = reports.reduce((acc, curr) => acc + (curr.netCompanyDue || 0), 0);
  const totalHours = reports.reduce((acc, curr) => acc + (curr.totalNetHours || 0), 0);

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const todayStr = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

  const rowsHtml = reports.length === 0 ? `
    <tr>
      <td colSpan="10" style="padding: 20px; text-align: center; color: #94a3b8; font-weight: bold;">
        لا توجد تقارير مطابقة لمحددات البحث
      </td>
    </tr>
  ` : reports.map((r, i) => `
    <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #d97706;">${i + 1}</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #0f172a;">${r.reportNumber}</td>
      <td style="padding: 8px 10px; text-align: center; font-size: 11px;">${r.date}</td>
      <td style="padding: 8px 10px; font-weight: bold; color: #0f172a;">
        ${r.equipmentName}
        ${r.equipmentRegNumber ? `<div style="font-size: 10px; color: #64748b; font-weight: normal;">${r.equipmentRegNumber}</div>` : ''}
      </td>
      <td style="padding: 8px 10px; color: #334155;">${r.companyName || '-'}</td>
      <td style="padding: 8px 10px; color: #334155;">${r.driverName || '-'}</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #2563eb;">${r.totalNetHours || 0} س</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #16a34a;">${(r.grossAmount || 0).toLocaleString('ar-SA')} ${projectInfo.currency || 'ر.ي'}</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #dc2626;">${(r.driverAdvance || 0).toLocaleString('ar-SA')} ${projectInfo.currency || 'ر.ي'}</td>
      <td style="padding: 8px 10px; text-align: left; font-weight: 900; color: #059669;">${(r.netCompanyDue || 0).toLocaleString('ar-SA')} ${projectInfo.currency || 'ر.ي'}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; font-family: 'Cairo', sans-serif; }
          body { padding: 25px; margin: 0; background: #fff; color: #0f172a; direction: rtl; font-size: 12px; }
          .document-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
          .project-title { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0; }
          .project-sub { font-size: 12px; color: #475569; margin-top: 4px; font-weight: 600; }
          .report-badge { background: #f59e0b; color: #0f172a; padding: 4px 12px; border-radius: 6px; font-weight: 900; font-size: 13px; display: inline-block; }
          .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
          .kpi-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; }
          .kpi-title { font-size: 10px; color: #64748b; font-weight: 700; }
          .kpi-value { font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th { background: #0f172a; color: #ffffff; padding: 10px; font-weight: 800; text-align: right; border: 1px solid #0f172a; }
          td { border: 1px solid #e2e8f0; }
          .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; text-align: center; }
          .sig-box { border-top: 2px stroke #cbd5e1; padding-top: 10px; font-weight: 700; color: #334155; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: left; background: #f1f5f9; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: bold; color: #334155;">جاهز للطباعة وتصدير PDF (اضغط زر الطباعة أو استخدم Ctrl+P وحفظ كـ PDF)</span>
          <button onclick="window.print()" style="background: #0f172a; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; font-family: 'Cairo', sans-serif;">
            🖨️ طباعة / حفظ كـ PDF
          </button>
        </div>

        <div class="document-header">
          <div>
            <h1 class="project-title">${projectInfo.name || 'مشروع إدارة المعدات والمباني'}</h1>
            <div class="project-sub">${projectInfo.companyName || 'الشركة المقاولة'} | هاتف: ${projectInfo.phone || '-'}</div>
            <div class="project-sub">الموقع: ${projectInfo.location || '-'} | المشرف المسؤول: ${projectInfo.managerName || '-'}</div>
          </div>
          <div style="text-align: left;">
            <div class="report-badge">${title}</div>
            <div style="font-size: 11px; font-weight: bold; margin-top: 6px; color: #475569;">تاريخ التصدير: ${todayStr}</div>
            <div style="font-size: 11px; color: #64748b;">إجمالي عدد السجلات: ${reports.length} تقرير</div>
          </div>
        </div>

        ${filterSummary ? `
          <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 8px 12px; border-radius: 6px; margin-bottom: 15px; font-weight: bold; color: #92400e; font-size: 11px;">
            🔍 معايير ومحددات الفلترة المطبقة: ${filterSummary}
          </div>
        ` : ''}

        <div class="summary-cards">
          <div class="kpi-card" style="border-right: 4px solid #2563eb;">
            <div class="kpi-title">إجمالي ساعات العمل</div>
            <div class="kpi-value" style="color: #1d4ed8;">${totalHours.toLocaleString('ar-SA')} ساعة</div>
          </div>
          <div class="kpi-card" style="border-right: 4px solid #16a34a;">
            <div class="kpi-title">إجمالي المستحقات الإجمالية</div>
            <div class="kpi-value" style="color: #15803d;">${totalGross.toLocaleString('ar-SA')} ${projectInfo.currency || 'ر.ي'}</div>
          </div>
          <div class="kpi-card" style="border-right: 4px solid #dc2626;">
            <div class="kpi-title">إجمالي السُلف اليومية</div>
            <div class="kpi-value" style="color: #b91c1c;">${totalAdvances.toLocaleString('ar-SA')} ${projectInfo.currency || 'ر.ي'}</div>
          </div>
          <div class="kpi-card" style="border-right: 4px solid #059669; background: #ecfdf5;">
            <div class="kpi-title">صافي المستحق للشركة</div>
            <div class="kpi-value" style="color: #047857;">${totalNet.toLocaleString('ar-SA')} ${projectInfo.currency || 'ر.ي'}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">#</th>
              <th style="text-align: center;">رقم التقرير</th>
              <th style="text-align: center;">التاريخ</th>
              <th>اسم المعدة واللوحة</th>
              <th>الشركة المؤجرة</th>
              <th>السائق</th>
              <th style="text-align: center;">الساعات</th>
              <th style="text-align: center;">الإجمالي</th>
              <th style="text-align: center;">السلفة</th>
              <th style="text-align: left;">الصافي</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-box">
            <div>إعداد ومراجعة المحاسب</div>
            <div style="margin-top: 35px; border-top: 1px dashed #94a3b8; width: 80%; margin-right: auto; margin-left: auto;">التوقيع</div>
          </div>
          <div class="sig-box">
            <div>توقيع المشرف الميداني</div>
            <div style="margin-top: 35px; border-top: 1px dashed #94a3b8; width: 80%; margin-right: auto; margin-left: auto;">التوقيع</div>
          </div>
          <div class="sig-box">
            <div>اعتماد مدير المشروع</div>
            <div style="margin-top: 35px; border-top: 1px dashed #94a3b8; width: 80%; margin-right: auto; margin-left: auto;">التوقيع والختم</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

/**
 * Export Diesel Transactions to PDF document with rich Arabic formatting and KPI cards
 */
export const exportDieselToPDF = (
  transactions: DieselTransaction[], 
  projectInfo: ProjectInfo, 
  title: string = 'كشف وحركات مخزن وقود الديزل',
  filterSummary?: string
) => {
  const totalReceived = transactions.filter(t => t.type === 'receive').reduce((sum, t) => sum + (t.quantityLiters || 0), 0);
  const totalConsumed = transactions.filter(t => t.type === 'consume').reduce((sum, t) => sum + (t.quantityLiters || 0), 0);
  const totalCost = transactions.reduce((sum, t) => sum + (t.totalCost || 0), 0);

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const todayStr = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

  const rowsHtml = transactions.length === 0 ? `
    <tr>
      <td colSpan="10" style="padding: 20px; text-align: center; color: #94a3b8; font-weight: bold;">
        لا توجد حركات ديزل مطابقة
      </td>
    </tr>
  ` : transactions.map((t, i) => `
    <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #d97706;">${i + 1}</td>
      <td style="padding: 8px 10px; text-align: center; font-size: 11px;">${t.date}</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: bold;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; ${
          t.type === 'receive' ? 'background: #dcfce7; color: #166534;' : 'background: #fee2e2; color: #991b1b;'
        }">
          ${t.type === 'receive' ? 'وارد (استلام)' : 'صادر (معدة)'}
        </span>
      </td>
      <td style="padding: 8px 10px; text-align: center; font-weight: bold;">
        <div style="display: flex; flex-direction: column; gap: 2px; align-items: center;">
          ${t.voucherNumber ? `<span style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 1px 5px; border-radius: 4px; color: #0f172a; font-weight: 900; font-family: monospace; font-size: 10px;">سند: ${t.voucherNumber}</span>` : ''}
          ${t.invoiceNumber ? `<span style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 1px 5px; border-radius: 4px; color: #065f46; font-weight: 800; font-family: monospace; font-size: 10px;">فاتورة: ${t.invoiceNumber}</span>` : ''}
          ${!t.voucherNumber && !t.invoiceNumber ? '<span style="color: #cbd5e1;">-</span>' : ''}
        </div>
      </td>
      <td style="padding: 8px 10px; font-weight: bold; color: #0f172a;">${t.type === 'receive' ? (t.equipmentName || 'مخزن المشروع الرئيسي') : (t.equipmentName || '-')}</td>
      <td style="padding: 8px 10px; color: #334155;">
        ${t.type === 'receive' ? `
          <div>
            <div style="font-weight: bold; color: #0f172a;">مستلم: ${t.driverName || 'أمين المخزن'}</div>
            ${t.deliveryDriverName ? `<div style="font-size: 10px; color: #2563eb; font-weight: bold; margin-top: 2px;">سائق الناقلة: ${t.deliveryDriverName}</div>` : ''}
          </div>
        ` : (t.driverName || '-')}
      </td>
      <td style="padding: 8px 10px; color: #334155;">${t.type === 'receive' ? (t.supplierOrSource || '-') : 'مخزن المشروع'}</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: 900; color: #2563eb;">${(t.quantityLiters || 0).toLocaleString('ar-SA')} لتر</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #475569;">${t.pricePerLiter || 2.3} ${projectInfo.currency || 'ر.ي'}</td>
      <td style="padding: 8px 10px; text-align: left; font-weight: 900; color: #0f172a;">${(t.totalCost || 0).toLocaleString('ar-SA')} ${projectInfo.currency || 'ر.ي'}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; font-family: 'Cairo', sans-serif; }
          body { padding: 25px; margin: 0; background: #fff; color: #0f172a; direction: rtl; font-size: 12px; }
          .document-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #d97706; padding-bottom: 15px; margin-bottom: 20px; }
          .project-title { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0; }
          .project-sub { font-size: 12px; color: #475569; margin-top: 4px; font-weight: 600; }
          .report-badge { background: #d97706; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-weight: 900; font-size: 13px; display: inline-block; }
          .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
          .kpi-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; }
          .kpi-title { font-size: 10px; color: #64748b; font-weight: 700; }
          .kpi-value { font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th { background: #0f172a; color: #ffffff; padding: 10px; font-weight: 800; text-align: right; border: 1px solid #0f172a; }
          td { border: 1px solid #e2e8f0; }
          .signatures { margin-top: 40px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; font-weight: bold; }
          .sig-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; background: #f8fafc; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: left; background: #f1f5f9; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: bold; color: #334155;">جاهز للطباعة وتصدير PDF لمخزن الديزل (استخدم Ctrl+P للطباعة أو حفظ كـ PDF)</span>
          <button onclick="window.print()" style="background: #d97706; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; font-family: 'Cairo', sans-serif;">
            🖨️ طباعة / حفظ كـ PDF
          </button>
        </div>

        <div class="document-header">
          <div>
            <h1 class="project-title">${projectInfo.name || 'مشروع إدارة المعدات'}</h1>
            <div class="project-sub">${projectInfo.companyName || 'الشركة المقاولة'} | هاتف: ${projectInfo.phone || '-'}</div>
          </div>
          <div style="text-align: left;">
            <div class="report-badge">${title}</div>
            <div style="font-size: 11px; font-weight: bold; margin-top: 6px; color: #475569;">تاريخ التصدير: ${todayStr}</div>
            <div style="font-size: 11px; color: #64748b;">عدد العمليات: ${transactions.length} حركة</div>
          </div>
        </div>

        ${filterSummary ? `
          <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 8px 12px; border-radius: 6px; margin-bottom: 15px; font-weight: bold; color: #92400e; font-size: 11px;">
            🔍 معايير البحث والفلترة: ${filterSummary}
          </div>
        ` : ''}

        <div class="summary-cards">
          <div class="kpi-card" style="border-right: 4px solid #16a34a;">
            <div class="kpi-title">إجمالي الوارد (الكميات المستلمة)</div>
            <div class="kpi-value" style="color: #15803d;">${totalReceived.toLocaleString('ar-SA')} لتر</div>
          </div>
          <div class="kpi-card" style="border-right: 4px solid #dc2626;">
            <div class="kpi-title">إجمالي المصروف للمعدات</div>
            <div class="kpi-value" style="color: #b91c1c;">${totalConsumed.toLocaleString('ar-SA')} لتر</div>
          </div>
          <div class="kpi-card" style="border-right: 4px solid #d97706;">
            <div class="kpi-title">التكلفة المالية الإجمالية للديزل</div>
            <div class="kpi-value" style="color: #b45309;">${totalCost.toLocaleString('ar-SA')} ${projectInfo.currency || 'ر.ي'}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">#</th>
              <th style="text-align: center;">التاريخ</th>
              <th style="text-align: center;">نوع الحركة</th>
              <th style="text-align: center;">رقم السند اليدوي</th>
              <th>الجهة / المعدة المستفيدة</th>
              <th>اسم المستلم (أمين المخزن / السائق)</th>
              <th>المورد / المصدر</th>
              <th style="text-align: center;">الكمية (لتر)</th>
              <th style="text-align: center;">سعر اللتر</th>
              <th style="text-align: left;">التكلفة الإجمالية</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-box">
            <div>مسئول المحروقات والمحطة</div>
            <div style="margin-top: 35px; border-top: 1px dashed #94a3b8; width: 80%; margin-right: auto; margin-left: auto;">التوقيع</div>
          </div>
          <div class="sig-box">
            <div>توقيع المستلم / السائق</div>
            <div style="margin-top: 35px; border-top: 1px dashed #94a3b8; width: 80%; margin-right: auto; margin-left: auto;">التوقيع</div>
          </div>
          <div class="sig-box">
            <div>اعتماد مدير المشروع</div>
            <div style="margin-top: 35px; border-top: 1px dashed #94a3b8; width: 80%; margin-right: auto; margin-left: auto;">التوقيع والختم</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

/**
 * Browser Print Utility
 */
export const printElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <html lang="ar" dir="rtl">
      <head>
        <title>طباعة التقرير</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px; color: #1e293b; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: right; }
          th { background-color: #0f172a; color: white; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; background: #e2e8f0; }
          .highlight { font-weight: bold; color: #0284c7; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
