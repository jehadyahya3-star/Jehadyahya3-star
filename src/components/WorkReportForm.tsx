import React, { useState, useEffect, useRef } from 'react';
import { 
  ContractType, 
  WorkPeriod, 
  WorkReport, 
  Equipment, 
  Company, 
  Driver, 
  OperationalCosts 
} from '../types';
import { 
  FileCheck, 
  Plus, 
  Trash2, 
  Clock, 
  Calculator, 
  Fuel, 
  DollarSign, 
  CheckCircle2, 
  PenTool, 
  RotateCcw,
  Gauge,
  AlertCircle
} from 'lucide-react';

interface WorkReportFormProps {
  equipmentList: Equipment[];
  companiesList: Company[];
  driversList: Driver[];
  onSaveReport: (report: WorkReport) => void;
  onCancel?: () => void;
  existingReport?: WorkReport | null;
}

export const WorkReportForm: React.FC<WorkReportFormProps> = ({
  equipmentList,
  companiesList,
  driversList,
  onSaveReport,
  onCancel,
  existingReport
}) => {
  // 1. Basic Information
  const [reportNumber, setReportNumber] = useState(
    existingReport?.reportNumber || `REP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [date, setDate] = useState(
    existingReport?.date || new Date().toISOString().split('T')[0]
  );
  const [contractType, setContractType] = useState<ContractType>(
    existingReport?.contractType || 'daily'
  );
  const [selectedEquipmentName, setSelectedEquipmentName] = useState(
    existingReport?.equipmentName || (equipmentList[0]?.name || '')
  );
  const [selectedCompanyName, setSelectedCompanyName] = useState(
    existingReport?.companyName || (companiesList[0]?.name || '')
  );
  const [selectedDriverName, setSelectedDriverName] = useState(
    existingReport?.driverName || (driversList[0]?.name || '')
  );
  const [driverPhone, setDriverPhone] = useState(
    existingReport?.driverPhone || (driversList[0]?.phone || '')
  );
  const [driverSalaryType, setDriverSalaryType] = useState(
    existingReport?.driverSalaryType || 'يومية'
  );

  // Auto fill equipment & driver info on selection
  useEffect(() => {
    const eq = equipmentList.find(e => e.name === selectedEquipmentName);
    if (eq && eq.companyName) {
      setSelectedCompanyName(eq.companyName);
    }
  }, [selectedEquipmentName, equipmentList]);

  useEffect(() => {
    const dr = driversList.find(d => d.name === selectedDriverName);
    if (dr) {
      setDriverPhone(dr.phone);
      setDriverSalaryType(dr.salaryType);
    }
  }, [selectedDriverName, driversList]);

  // 2. Work Shift Periods (up to 3 periods)
  const [periods, setPeriods] = useState<WorkPeriod[]>(
    existingReport?.periods || [
      {
        id: 'p-1',
        periodName: 'الفترة الأولى',
        startTime: '07:00',
        endTime: '12:00',
        durationHours: 5,
        breakMinutes: 0,
        netHours: 5,
        notes: ''
      }
    ]
  );

  // 3. Counter & Meters
  const [meterStart, setMeterStart] = useState<number>(existingReport?.meterStart || 1000);
  const [meterEnd, setMeterEnd] = useState<number>(existingReport?.meterEnd || 1008);
  const [quantityMeters, setQuantityMeters] = useState<number>(existingReport?.quantityMeters || 0);

  // 4. Financial Rates
  const [ratePerUnit, setRatePerUnit] = useState<number>(existingReport?.ratePerUnit || 1200);

  // Auto set default rate based on contract type & equipment
  useEffect(() => {
    const eq = equipmentList.find(e => e.name === selectedEquipmentName);
    if (!eq) return;
    if (contractType === 'daily') setRatePerUnit(eq.dailyRate || 1200);
    else if (contractType === 'hourly') setRatePerUnit(eq.hourlyRate || 180);
    else if (contractType === 'monthly') setRatePerUnit(Math.round((eq.monthlyRate || 30000) / 26));
    else if (contractType === 'meter') setRatePerUnit(eq.meterRate || 40);
    else if (contractType === 'salary') setRatePerUnit(150);
  }, [contractType, selectedEquipmentName, equipmentList]);

  // 5. Operational Costs
  const [costs, setCosts] = useState<OperationalCosts>(
    existingReport?.costs || {
      dieselLiters: 150,
      dieselCostPerLiter: 2.3,
      dieselTotalCost: 345,
      oilCost: 0,
      greaseCost: 20,
      sparePartsCost: 0,
      maintenanceCost: 0
    }
  );

  // 6. Driver Advance & Notes
  const [driverAdvance, setDriverAdvance] = useState<number>(existingReport?.driverAdvance || 150);
  const [notes, setNotes] = useState<string>(existingReport?.notes || '');

  // 7. Signature Canvas State & Handler
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string | undefined>(existingReport?.driverSignature);

  // Handle shift period recalculations
  const updatePeriod = (index: number, field: keyof WorkPeriod, value: any) => {
    const updated = [...periods];
    const item = { ...updated[index], [field]: value };

    // Calculate duration if times changed
    if (field === 'startTime' || field === 'endTime' || field === 'breakMinutes') {
      if (item.startTime && item.endTime) {
        const [sh, sm] = item.startTime.split(':').map(Number);
        const [eh, em] = item.endTime.split(':').map(Number);
        let startMinutes = sh * 60 + sm;
        let endMinutes = eh * 60 + em;
        if (endMinutes < startMinutes) endMinutes += 24 * 60; // Cross midnight
        const diffMinutes = endMinutes - startMinutes - (item.breakMinutes || 0);
        item.durationHours = parseFloat((Math.max(0, diffMinutes) / 60).toFixed(2));
        item.netHours = item.durationHours;
      }
    }

    updated[index] = item;
    setPeriods(updated);
  };

  const addPeriod = () => {
    if (periods.length >= 3) return;
    const nextName = periods.length === 1 ? 'الفترة الثانية' : 'الفترة الثالثة';
    setPeriods([
      ...periods,
      {
        id: `p-${Date.now()}`,
        periodName: nextName,
        startTime: '13:00',
        endTime: '17:00',
        durationHours: 4,
        breakMinutes: 0,
        netHours: 4,
        notes: ''
      }
    ]);
  };

  const removePeriod = (index: number) => {
    if (periods.length <= 1) return;
    setPeriods(periods.filter((_, i) => i !== index));
  };

  // Sum of total net work hours across all periods
  const totalNetHours = periods.reduce((acc, p) => acc + (p.netHours || 0), 0);

  // Financial gross calculation based on contract type
  let grossAmount = 0;
  if (contractType === 'daily' || contractType === 'salary' || contractType === 'monthly') {
    grossAmount = ratePerUnit;
  } else if (contractType === 'hourly') {
    grossAmount = totalNetHours * ratePerUnit;
  } else if (contractType === 'meter') {
    grossAmount = (quantityMeters || 0) * ratePerUnit;
  }

  // Net due from company (Gross Amount - Driver Advance credited to company)
  const netCompanyDue = Math.max(0, grossAmount - (driverAdvance || 0));

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureData(undefined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedEquipment = equipmentList.find(e => e.name === selectedEquipmentName);

    const report: WorkReport = {
      id: existingReport?.id || `wr-${Date.now()}`,
      reportNumber,
      date,
      contractType,
      companyName: selectedCompanyName,
      equipmentName: selectedEquipmentName,
      equipmentRegNumber: selectedEquipment?.regNumber || 'أ ب ج 1234',
      driverName: selectedDriverName,
      driverPhone,
      driverSalaryType,
      periods,
      totalNetHours,
      ratePerUnit,
      meterStart,
      meterEnd,
      quantityMeters: contractType === 'meter' ? quantityMeters : (meterEnd - meterStart),
      grossAmount,
      costs: {
        ...costs,
        dieselTotalCost: (costs.dieselLiters || 0) * (costs.dieselCostPerLiter || 2.3)
      },
      driverAdvance,
      netCompanyDue,
      driverSignature: signatureData,
      notes,
      createdAt: existingReport?.createdAt || new Date().toISOString()
    };

    onSaveReport(report);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Form Title & Top Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-amber-500" />
            <span>تسجيل يوم عمل جديد (سجل تشغيل معدة)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            يرجى إدخال كافة بيانات الوردية، فترات العمل، السلفة، والتكاليف بدقة متناهية
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">رقم التقرير:</span>
          <input
            type="text"
            value={reportNumber}
            onChange={(e) => setReportNumber(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-black text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center w-36"
            required
          />
        </div>
      </div>

      {/* Contract Mode Selector Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <label className="text-xs font-black text-slate-700 block">
          اختيار نوع العقد التشغيلي:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { id: 'daily', label: 'عقد يومي', sub: 'مبلغ مقطوع باليوم' },
            { id: 'hourly', label: 'عقد بالساعة', sub: 'حساب دقيق بالساعات' },
            { id: 'meter', label: 'عقد بالمتر', sub: 'حساب الكميات بالأنظار' },
            { id: 'monthly', label: 'عقد شهري', sub: 'حساب النسبة اليومية' },
            { id: 'salary', label: 'عقد براتب', sub: 'ساعات عمل راتب' }
          ].map((mode) => (
            <button
              type="button"
              key={mode.id}
              onClick={() => setContractType(mode.id as ContractType)}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                contractType === mode.id
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-md'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
              }`}
            >
              <div className="text-sm">{mode.label}</div>
              <div className={`text-[10px] mt-0.5 ${contractType === mode.id ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                {mode.sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Date & Company Selection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
            <span>بيانات التاريخ والشركة</span>
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">التاريخ:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">اسم المعدة:</label>
            <select
              value={selectedEquipmentName}
              onChange={(e) => setSelectedEquipmentName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {equipmentList.map((eq) => (
                <option key={eq.id} value={eq.name}>{eq.name} ({eq.regNumber})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">الشركة المؤجرة:</label>
            <select
              value={selectedCompanyName}
              onChange={(e) => setSelectedCompanyName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {companiesList.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Driver Details */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
            <span>بيانات السائق والسُلفة</span>
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">اسم السائق:</label>
            <select
              value={selectedDriverName}
              onChange={(e) => setSelectedDriverName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {driversList.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">رقم الجوال:</label>
            <input
              type="text"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-amber-700 mb-1 block">السلفة اليومية للسائق (تُقيد على الشركة):</label>
            <div className="relative">
              <input
                type="number"
                value={driverAdvance}
                onChange={(e) => setDriverAdvance(parseFloat(e.target.value) || 0)}
                className="w-full bg-amber-50/50 border border-amber-300 rounded-xl px-3 py-2 text-sm font-black text-amber-700 focus:ring-2 focus:ring-amber-500 focus:outline-none pl-12"
                placeholder="0"
              />
              <span className="absolute left-3 top-2.5 text-xs font-bold text-amber-600">ر.س</span>
            </div>
          </div>
        </div>

        {/* Counter Meters & Financial Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-blue-600" />
            <span>عداد الساعات والأسعار</span>
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">عداد بداية:</label>
              <input
                type="number"
                value={meterStart}
                onChange={(e) => setMeterStart(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">عداد نهاية:</label>
              <input
                type="number"
                value={meterEnd}
                onChange={(e) => setMeterEnd(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              />
            </div>
          </div>

          {contractType === 'meter' && (
            <div>
              <label className="text-xs font-bold text-emerald-700 mb-1 block">كمية الأمتار الإنجاز:</label>
              <input
                type="number"
                value={quantityMeters}
                onChange={(e) => setQuantityMeters(parseFloat(e.target.value) || 0)}
                className="w-full bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-2 text-xs font-black text-emerald-800"
                placeholder="أدخل عدد الأمتار"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              {contractType === 'daily' && 'سعر اليومية الإجمالي (ر.س):'}
              {contractType === 'hourly' && 'سعر التشغيل بالساعة للمعدة (ر.س/ساعة):'}
              {contractType === 'meter' && 'سعر المتر المربع/المكعب (ر.س):'}
              {contractType === 'monthly' && 'المعدل اليومي للعقد الشهري (ر.س):'}
              {contractType === 'salary' && 'قيمة يوم عمل الراتب (ر.س):'}
            </label>
            <input
              type="number"
              value={ratePerUnit}
              onChange={(e) => setRatePerUnit(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-amber-500"
              required
            />

            {/* Auto Total Cost Calculation Callout */}
            <div className="mt-3 bg-amber-50/80 p-3 rounded-xl border border-amber-200/80 text-xs text-amber-950 font-bold space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>ساعات التشغيل الفعالة:</span>
                <span className="font-extrabold text-slate-900">{totalNetHours} ساعة</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>سعر التشغيل بالساعة:</span>
                <span className="font-extrabold text-slate-900">{ratePerUnit} ر.س</span>
              </div>
              <div className="flex items-center justify-between border-t border-amber-300/60 pt-1.5 text-xs font-black text-amber-900">
                <span>التكلفة الإجمالية تلقائياً (الساعات × السعر):</span>
                <span className="text-sm font-black text-emerald-700">{grossAmount.toLocaleString('ar-SA')} ر.س</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Work Shift Periods Section (Up to 3 Shift Periods) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>فترات وساعات العمل بالوردية</span>
            </h3>
            <p className="text-xs text-slate-500">حساب تلقائي لصافي الساعات وإتاحة حتى 3 فترات عمل يومياً</p>
          </div>

          {periods.length < 3 && (
            <button
              type="button"
              onClick={addPeriod}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-600" />
              <span>إضافة فترة أخرى</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {periods.map((p, idx) => (
            <div key={p.id} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-6 gap-3 items-center">
              <div className="sm:col-span-1 font-bold text-xs text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>{p.periodName}</span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block">وقت البدء:</label>
                <input
                  type="time"
                  value={p.startTime}
                  onChange={(e) => updatePeriod(idx, 'startTime', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block">وقت الانتهاء:</label>
                <input
                  type="time"
                  value={p.endTime}
                  onChange={(e) => updatePeriod(idx, 'endTime', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block">خصم توقف (دقيقة):</label>
                <input
                  type="number"
                  value={p.breakMinutes}
                  onChange={(e) => updatePeriod(idx, 'breakMinutes', parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold"
                />
              </div>

              <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 text-center">
                <span className="text-[10px] font-bold text-blue-600 block">الصافي:</span>
                <span className="text-sm font-extrabold text-blue-900">{p.netHours} ساعة</span>
              </div>

              <div className="flex items-center justify-end">
                {periods.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePeriod(idx)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between font-bold text-xs sm:text-sm">
          <span>مجموع ساعات الوردية الفعلية:</span>
          <span className="text-amber-400 text-base">{totalNetHours} ساعة عمل</span>
        </div>
      </div>

      {/* Operational Costs Entry */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
          <Fuel className="w-4 h-4 text-amber-500" />
          <span>التكاليف التشغيلية ومصروفات اليوم</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
            <label className="text-xs font-bold text-amber-900 block mb-1">الديزل (كمية اللترات):</label>
            <input
              type="number"
              value={costs.dieselLiters}
              onChange={(e) => setCosts({ ...costs, dieselLiters: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
            />
            <div className="text-[10px] font-bold text-amber-700 mt-1">
              التكلفة: {(costs.dieselLiters * costs.dieselCostPerLiter).toFixed(2)} ر.س
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">مبلغ الزيوت (ر.س):</label>
            <input
              type="number"
              value={costs.oilCost}
              onChange={(e) => setCosts({ ...costs, oilCost: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">مبلغ التشحيم (ر.س):</label>
            <input
              type="number"
              value={costs.greaseCost}
              onChange={(e) => setCosts({ ...costs, greaseCost: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">قطع غيار وصيانة (ر.س):</label>
            <input
              type="number"
              value={costs.sparePartsCost}
              onChange={(e) => setCosts({ ...costs, sparePartsCost: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Final Financial Summary & Signature Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Real-time Calculation Summary Box */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-lg border border-slate-700 space-y-3.5">
          <h3 className="font-black text-amber-400 text-sm flex items-center gap-2 border-b border-slate-700 pb-2">
            <Calculator className="w-4 h-4" />
            <span>ملخص الاحتساب المالي لليوم</span>
          </h3>

          <div className="flex justify-between items-center text-xs text-slate-300">
            <span>إجمالي المستحق من الشركة:</span>
            <span className="font-extrabold text-white text-sm">{grossAmount} ر.س</span>
          </div>

          <div className="flex justify-between items-center text-xs text-amber-300">
            <span>تخصم السلفة اليومية للسائق:</span>
            <span className="font-extrabold text-amber-400 text-sm">- {driverAdvance} ر.س</span>
          </div>

          <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-200">الصافي المتبقي للشركة:</span>
            <span className="text-xl font-black text-emerald-400">{netCompanyDue} ر.س</span>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-bold block mb-1">ملاحظات حقل العمل:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-950/60 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="اكتب أي ملاحظات تتعلق بظروف العمل أو التوقفات..."
            />
          </div>
        </div>

        {/* Digital Signature Canvas Pad */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <PenTool className="w-4 h-4 text-slate-700" />
              <span>توقيع السائق / المشرف الميداني</span>
            </h3>

            <button
              type="button"
              onClick={clearCanvas}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>مسح التوقيع</span>
            </button>
          </div>

          <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50 relative overflow-hidden">
            <canvas
              ref={canvasRef}
              width={350}
              height={110}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-28 cursor-crosshair touch-none"
            />
            {!signatureData && !isDrawing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-semibold">
                وقّع بالماوس أو الإصبع هنا
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Form Submit & Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-sm cursor-pointer"
          >
            إلغاء
          </button>
        )}
        
        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black px-8 py-3.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-transform active:scale-95"
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>حفظ واستخراج التقرير</span>
        </button>
      </div>

    </form>
  );
};
