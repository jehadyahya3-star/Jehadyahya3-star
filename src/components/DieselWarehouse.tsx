import React, { useState } from 'react';
import { DieselTransaction, Equipment, Driver, ProjectInfo } from '../types';
import { exportDieselToExcel, exportDieselToPDF, formatCurrency } from '../utils/exportUtils';
import { 
  Fuel, 
  PlusCircle, 
  MinusCircle, 
  AlertTriangle, 
  FileSpreadsheet, 
  Download,
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  X, 
  CheckCircle2, 
  Truck, 
  User,
  FileText,
  Calendar,
  Filter,
  RotateCcw
} from 'lucide-react';

interface DieselWarehouseProps {
  transactions: DieselTransaction[];
  equipmentList: Equipment[];
  driversList: Driver[];
  projectInfo?: ProjectInfo;
  onAddTransaction: (transaction: DieselTransaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const DieselWarehouse: React.FC<DieselWarehouseProps> = ({
  transactions,
  equipmentList,
  driversList,
  projectInfo = { name: 'مشروع إدارة المعدات والمباني', companyName: '', managerName: '', location: '', phone: '', currency: 'ر.ي' },
  onAddTransaction,
  onDeleteTransaction
}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'receive' | 'consume'>('consume');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'receive' | 'consume'>('all');

  // Date Range Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form States
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [voucherNumber, setVoucherNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [deliveryDriverName, setDeliveryDriverName] = useState('');
  const [quantityLiters, setQuantityLiters] = useState<number>(150);
  const [pricePerLiter, setPricePerLiter] = useState<number>(2.3);
  const [equipmentName, setEquipmentName] = useState(equipmentList[0]?.name || '');
  const [driverName, setDriverName] = useState(driversList[0]?.name || '');
  const [storekeeperName, setStorekeeperName] = useState(projectInfo.managerName ? `أمين المخزن (${projectInfo.managerName})` : 'أمين المخزن - مدير الموقع');
  const [supplierOrSource, setSupplierOrSource] = useState('محطة التوريد المركزية');
  const [notes, setNotes] = useState('');

  // Stock Metrics Calculations
  const totalReceived = transactions
    .filter(t => t.type === 'receive')
    .reduce((acc, t) => acc + (t.quantityLiters || 0), 0);
  const totalConsumed = transactions
    .filter(t => t.type === 'consume')
    .reduce((acc, t) => acc + (t.quantityLiters || 0), 0);
  const currentBalance = totalReceived - totalConsumed;
  const isLowStock = currentBalance < 1000;

  // Date Range Presets
  const handleSetThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(today);
  };

  const handleSetLastMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  const handleClearDateFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleOpenModal = (type: 'receive' | 'consume') => {
    setModalType(type);
    setVoucherNumber('');
    setInvoiceNumber('');
    setDeliveryDriverName('');
    if (type === 'receive') {
      setQuantityLiters(1000);
    } else {
      setQuantityLiters(150);
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTransaction: DieselTransaction = {
      id: `ds-${Date.now()}`,
      date,
      type: modalType,
      voucherNumber: voucherNumber.trim() || undefined,
      invoiceNumber: modalType === 'receive' ? (invoiceNumber.trim() || undefined) : undefined,
      deliveryDriverName: modalType === 'receive' ? (deliveryDriverName.trim() || undefined) : undefined,
      quantityLiters,
      pricePerLiter,
      totalCost: quantityLiters * pricePerLiter,
      equipmentName: modalType === 'consume' ? equipmentName : 'مخزن المشروع الرئيسي',
      driverName: modalType === 'consume' ? driverName : storekeeperName,
      supplierOrSource: modalType === 'receive' ? supplierOrSource : 'مخزن المشروع',
      notes,
      createdAt: new Date().toISOString()
    };

    onAddTransaction(newTransaction);
    setShowModal(false);
    setVoucherNumber('');
    setInvoiceNumber('');
    setDeliveryDriverName('');
    setNotes('');
  };

  const filteredTransactions = transactions.filter(t => {
    if (activeTypeFilter !== 'all' && t.type !== activeTypeFilter) {
      return false;
    }

    if (startDate && t.date < startDate) {
      return false;
    }

    if (endDate && t.date > endDate) {
      return false;
    }

    if (!searchTerm) return true;

    const query = searchTerm.toLowerCase();
    return (
      (t.equipmentName && t.equipmentName.toLowerCase().includes(query)) ||
      (t.driverName && t.driverName.toLowerCase().includes(query)) ||
      (t.deliveryDriverName && t.deliveryDriverName.toLowerCase().includes(query)) ||
      (t.supplierOrSource && t.supplierOrSource.toLowerCase().includes(query)) ||
      (t.voucherNumber && t.voucherNumber.toLowerCase().includes(query)) ||
      (t.invoiceNumber && t.invoiceNumber.toLowerCase().includes(query)) ||
      t.date.includes(query)
    );
  });

  // Filtered totals
  const filteredReceived = filteredTransactions
    .filter(t => t.type === 'receive')
    .reduce((acc, t) => acc + (t.quantityLiters || 0), 0);

  const filteredConsumed = filteredTransactions
    .filter(t => t.type === 'consume')
    .reduce((acc, t) => acc + (t.quantityLiters || 0), 0);

  const filteredCost = filteredTransactions
    .reduce((acc, t) => acc + (t.totalCost || 0), 0);

  const dateFilterSummaryText = [
    startDate ? `من: ${startDate}` : null,
    endDate ? `إلى: ${endDate}` : null,
    searchTerm ? `بحث: "${searchTerm}"` : null
  ].filter(Boolean).join(' | ');

  const currencySymbol = projectInfo?.currency || 'ر.ي';

  return (
    <div className="space-y-6">
      
      {/* Top Header & Metrics Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1 text-slate-950/80 font-bold text-xs">
            <Fuel className="w-5 h-5 stroke-[2.5]" />
            <span>نظام التحكم بالوقود والمخزون التشغيلي</span>
          </div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">
            مخزن الديزل ومتابعة التوريد والاستهلاك
          </h2>
          <p className="text-slate-900/80 text-xs font-semibold mt-1">
            تسجيل حركات الشحن الوارد وصرف الديزل اليومي مع أرقام السندات اليدوية لكل شحنة وتعبئة
          </p>
        </div>

        {/* Current Stock Level Badge */}
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg border border-slate-800 text-center min-w-56">
          <span className="text-xs text-slate-400 font-bold block">رصيد الديزل الحالي بالخزان:</span>
          <div className="text-3xl font-black text-amber-400 my-1">
            {currentBalance.toLocaleString('ar-SA')} <span className="text-xs font-normal text-slate-300">لتر</span>
          </div>
          {isLowStock && (
            <div className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>تنبيه: المخزون منخفض!</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons & Ledger Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenModal('receive')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل وارد (سند استلام شحنة ديزل)</span>
          </button>

          <button
            onClick={() => handleOpenModal('consume')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <MinusCircle className="w-4 h-4" />
            <span>تسجيل صادر (سند صرف للمعدة)</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportDieselToExcel(filteredTransactions)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => exportDieselToPDF(
              filteredTransactions, 
              projectInfo, 
              activeTypeFilter === 'consume' 
                ? 'كشف سندات وتقارير صرف الديزل للمعدات' 
                : activeTypeFilter === 'receive' 
                  ? 'كشف سندات وشحنات استلام الديزل الوارد' 
                  : 'كشف وحركات مخزن وقود الديزل الإجمالي', 
              dateFilterSummaryText || undefined
            )}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-rose-600" />
            <span>تصدير PDF</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>فلتر النطاق الزمني:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-slate-300 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500">من:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-slate-300 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500">إلى:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>

            {(startDate || endDate) && (
              <button
                onClick={handleClearDateFilter}
                className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                title="إلغاء فلتر التاريخ"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={handleSetThisMonth}
              className="px-2.5 py-1 rounded-lg bg-white text-slate-800 hover:bg-amber-100 transition-colors cursor-pointer text-[11px] font-bold shadow-2xs"
            >
              هذا الشهر
            </button>
            <button
              onClick={handleSetLastMonth}
              className="px-2.5 py-1 rounded-lg bg-white text-slate-800 hover:bg-amber-100 transition-colors cursor-pointer text-[11px] font-bold shadow-2xs"
            >
              الشهر الماضي
            </button>
            {(startDate || endDate) && (
              <button
                onClick={handleClearDateFilter}
                className="px-2.5 py-1 rounded-lg text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer text-[11px] font-extrabold"
              >
                عرض الكل
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary Stats Pill */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold bg-white px-3.5 py-2 border border-slate-200 rounded-xl shadow-2xs text-slate-700 self-start lg:self-auto">
          <span className="text-slate-600">السجلات: <strong className="text-slate-900 font-black">{filteredTransactions.length}</strong></span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700">وارد: <strong>{filteredReceived.toLocaleString('ar-SA')} لتر</strong></span>
          <span className="text-slate-300">|</span>
          <span className="text-amber-700">صادر: <strong>{filteredConsumed.toLocaleString('ar-SA')} لتر</strong></span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-900">التكلفة: <strong>{formatCurrency(filteredCost, currencySymbol)}</strong></span>
        </div>
      </div>

      {/* Transactions History Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Filter Tabs and Search Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start">
            <button
              onClick={() => setActiveTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTypeFilter === 'all' 
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTypeFilter('consume')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                activeTypeFilter === 'consume' 
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>سندات الصرف ({transactions.filter(t => t.type === 'consume').length})</span>
            </button>
            <button
              onClick={() => setActiveTypeFilter('receive')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                activeTypeFilter === 'receive' 
                  ? 'bg-emerald-600 text-white shadow-sm font-extrabold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>سندات الاستلام ({transactions.filter(t => t.type === 'receive').length})</span>
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالرقم، المعدة، السائق أو السند..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-900 text-white font-bold">
              <tr>
                <th className="p-3.5">التاريخ</th>
                <th className="p-3.5 text-center">نوع الحركة</th>
                <th className="p-3.5 text-center">رقم السند اليدوي</th>
                <th className="p-3.5">الجهة / المعدة المستفيدة</th>
                <th className="p-3.5">المستلم (أمين المخزن / السائق)</th>
                <th className="p-3.5">المورد / المصدر</th>
                <th className="p-3.5 text-center">الكمية (لتر)</th>
                <th className="p-3.5 text-left">التكلفة الإجمالية ({currencySymbol})</th>
                <th className="p-3.5 text-center">خيارات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-bold">
                    لا توجد حركات ديزل مطابقة للفلترة والحركة المحددة
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-900">{t.date}</td>
                    <td className="p-3.5 text-center">
                      {t.type === 'receive' ? (
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-lg text-xs inline-flex items-center gap-1">
                          <ArrowDownRight className="w-3.5 h-3.5" /> وارد (استلام)
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 font-extrabold px-2.5 py-1 rounded-lg text-xs inline-flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5" /> صادر (للمعدة)
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {t.voucherNumber ? (
                          <span className="bg-slate-100 text-slate-900 border border-slate-300 px-2 py-0.5 rounded font-mono font-black text-xs inline-flex items-center gap-1">
                            <FileText className="w-3 h-3 text-slate-500" />
                            <span>سند: {t.voucherNumber}</span>
                          </span>
                        ) : null}
                        {t.invoiceNumber ? (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold text-[11px] inline-flex items-center gap-1">
                            <span>فاتورة: {t.invoiceNumber}</span>
                          </span>
                        ) : null}
                        {!t.voucherNumber && !t.invoiceNumber && (
                          <span className="text-slate-300 font-normal">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">
                      {t.type === 'receive' ? (
                        <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                          <span>{t.equipmentName || 'مخزن المشروع الرئيسي'}</span>
                        </span>
                      ) : (
                        <span className="text-slate-900 font-black">{t.equipmentName || '-'}</span>
                      )}
                    </td>
                    <td className="p-3.5 font-medium">
                      {t.type === 'receive' ? (
                        <div className="flex flex-col gap-0.5">
                          {t.driverName && (
                            <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                              <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>مستلم: {t.driverName}</span>
                            </span>
                          )}
                          {t.deliveryDriverName && (
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-600 text-xs">
                              <Truck className="w-3 h-3 text-blue-600 shrink-0" />
                              <span>سائق الناقلة: {t.deliveryDriverName}</span>
                            </span>
                          )}
                          {!t.driverName && !t.deliveryDriverName && (
                            <span className="text-slate-400">-</span>
                          )}
                        </div>
                      ) : (
                        t.driverName ? (
                          <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{t.driverName}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )
                      )}
                    </td>
                    <td className="p-3.5 font-medium text-slate-600">
                      {t.type === 'receive' ? (t.supplierOrSource || 'محطة التوريد') : 'مخزن المشروع'}
                    </td>
                    <td className="p-3.5 text-center font-black text-slate-900">
                      {t.quantityLiters.toLocaleString('ar-SA')} لتر
                    </td>
                    <td className="p-3.5 text-left font-extrabold text-slate-900">
                      {formatCurrency(t.totalCost, currencySymbol)}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="حذف الحركة"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal (Receive or Consume) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Fuel className="w-5 h-5 text-amber-500" />
                <span>{modalType === 'receive' ? 'تسجيل شحنة ديزل واردة' : 'تسجيل تعبئة ديزل لمعدة'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">التاريخ:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <FileText className={`w-3.5 h-3.5 ${modalType === 'receive' ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <span>{modalType === 'receive' ? 'رقم سند الاستلام / الصرف المخزني اليدوي:' : 'رقم سند الصرف اليدوي:'}</span>
                  </label>
                  <input
                    type="text"
                    value={voucherNumber}
                    onChange={(e) => setVoucherNumber(e.target.value)}
                    placeholder={modalType === 'receive' ? 'مثال: REC-901' : 'مثال: PAY-104'}
                    className={`w-full border rounded-xl p-2 font-bold text-slate-900 ${
                      modalType === 'receive' 
                        ? 'bg-emerald-50/50 border-emerald-300 focus:ring-2 focus:ring-emerald-400' 
                        : 'bg-amber-50/50 border-amber-300 focus:ring-2 focus:ring-amber-400'
                    }`}
                  />
                </div>
              </div>

              {modalType === 'receive' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>رقم الفاتورة / أمر التوريد (إن وجد):</span>
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="مثال: INV-88214"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الكمية (لتر):</label>
                  <input
                    type="number"
                    value={quantityLiters}
                    onChange={(e) => setQuantityLiters(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">سعر اللتر ({currencySymbol}):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricePerLiter}
                    onChange={(e) => setPricePerLiter(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                    required
                  />
                </div>
              </div>

              {modalType === 'receive' ? (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>الجهة المستلمة دائماً: <strong>مخزن المشروع الرئيسي</strong> (يتم تفريغ الاستلام في خزان المخزن ثم الصرف للمعدات).</span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">وارد من (الجهة الموردة / الشركة / المحطة):</label>
                    <input
                      type="text"
                      value={supplierOrSource}
                      onChange={(e) => setSupplierOrSource(e.target.value)}
                      placeholder="مثال: شركة النفط - محطة السهل"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <span>اسم سائق الناقلة (الذي وصل الديزل للمشروع):</span>
                    </label>
                    <input
                      type="text"
                      value={deliveryDriverName}
                      onChange={(e) => setDeliveryDriverName(e.target.value)}
                      placeholder="مثال: سالم أحمد (سائق الوايت / الناقلة)"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>اسم مستلم الشحنة (أمين / مدير المخزن):</span>
                    </label>
                    <input
                      type="text"
                      value={storekeeperName}
                      onChange={(e) => setStorekeeperName(e.target.value)}
                      placeholder="مثال: علي السقاف (أمين المخزن)"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>الجهة الصادرة: <strong>صرف مباشر من مخزن الوقود الرئيسي للمشروع</strong>.</span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">المعدة المستفيدة من التعبئة:</label>
                    <select
                      value={equipmentName}
                      onChange={(e) => setEquipmentName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold cursor-pointer"
                    >
                      {equipmentList.map((eq) => (
                        <option key={eq.id} value={eq.name}>{eq.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">السائق / المشغل المستلم للمعدة:</label>
                    <select
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold cursor-pointer"
                    >
                      {driversList.map((dr) => (
                        <option key={dr.id} value={dr.name}>{dr.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">ملاحظات الحركة:</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold"
                  placeholder="ملاحظات إضافية بخصوص سند الصرف أو الاستلام..."
                />
              </div>

              <div className="bg-slate-900 text-white p-3 rounded-xl flex justify-between font-bold">
                <span>التكلفة الإجمالية:</span>
                <span className="text-amber-400">{(quantityLiters * pricePerLiter).toFixed(2)} {currencySymbol}</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2 rounded-xl cursor-pointer"
                >
                  حفظ الحركة والسند
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
