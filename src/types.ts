export type ContractType = 'daily' | 'salary' | 'hourly' | 'meter' | 'monthly';

export interface WorkPeriod {
  id: string;
  periodName: 'الفترة الأولى' | 'الفترة الثانية' | 'الفترة الثالثة';
  startTime: string;
  endTime: string;
  durationHours: number;
  breakMinutes: number;
  netHours: number;
  notes?: string;
}

export interface OperationalCosts {
  dieselLiters: number;
  dieselCostPerLiter: number;
  dieselTotalCost: number;
  oilCost: number;
  greaseCost: number;
  sparePartsCost: number;
  maintenanceCost: number;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  managerName: string;
  companyName: string;
  phone: string;
  code?: string;
  budget?: number; // الميزانية المرصودة للمشروع
  currency?: string; // عملة المشروع (ر.ي, ر.س, $, الخ)
  status?: 'active' | 'completed' | 'archived';
  createdAt?: string;
}

export interface WorkReport {
  id: string;
  projectId?: string;
  reportNumber: string;
  date: string;
  contractType: ContractType;
  companyName: string;
  equipmentName: string;
  equipmentRegNumber: string;
  driverName: string;
  driverPhone: string;
  driverSalaryType: string;
  
  // Hours & Metrics
  periods: WorkPeriod[];
  totalNetHours: number;
  ratePerUnit: number; // Daily rate, Hourly rate, Meter rate, etc.
  
  // Meter / Counter readings
  meterStart: number;
  meterEnd: number;
  quantityMeters: number; // For meter-based contract
  
  // Financials
  grossAmount: number;
  costs: OperationalCosts;
  driverAdvance: number; // السلفة اليومية المقيدة على الشركة
  netCompanyDue: number; // الصافي المستحق من الشركة
  
  driverSignature?: string; // Base64 image string
  notes?: string;
  createdAt: string;
}

export interface DieselTransaction {
  id: string;
  projectId?: string;
  voucherNumber?: string; // رقم سند الصرف اليدوي أو رقم سند الاستلام
  invoiceNumber?: string; // رقم الفاتورة / رقم الصرف المخزني للمورد
  deliveryDriverName?: string; // اسم سائق الناقلة التي أوصلت الشحنة للمشروع
  date: string;
  type: 'receive' | 'consume'; // استلام من المورد / صرف لمعدة
  quantityLiters: number;
  pricePerLiter: number;
  totalCost: number;
  equipmentName?: string;
  driverName?: string;
  supplierOrSource?: string;
  notes?: string;
  createdAt: string;
}

export interface Equipment {
  id: string;
  projectId?: string;
  name: string;
  type: string; // حفار، بوكلين، قلاب، شاول، رافعة
  regNumber: string;
  companyName: string;
  status: 'active' | 'maintenance' | 'idle';
  hourlyRate: number;
  dailyRate: number;
  monthlyRate: number;
  meterRate?: number;
  driverName: string;
  createdAt: string;
  // Periodic Maintenance fields
  maintenanceDueDate?: string; // YYYY-MM-DD
  maintenanceTargetHours?: number; // target cumulative hours for next maintenance
  maintenanceIntervalHours?: number; // maintenance interval in hours (e.g. 250h)
  maintenanceNotes?: string; // notes or tasks for maintenance
  lastMaintenanceDate?: string; // YYYY-MM-DD
  lastMaintenanceHours?: number; // hours reading at last maintenance
}

export interface Company {
  id: string;
  projectId?: string;
  name: string;
  contactPerson: string;
  phone: string;
  address?: string;
  totalWorkAmount: number;
  totalAdvances: number;
  totalPaid: number;
  remainingBalance: number;
}

export interface Driver {
  id: string;
  projectId?: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: 'active' | 'inactive';
  salaryType: 'يومية' | 'شهري' | 'بالساعة';
  defaultRate: number;
  assignedEquipment?: string;
}

export interface ProjectInfo {
  name: string;
  location: string;
  managerName: string;
  companyName: string;
  phone: string;
  budget?: number;
  currency?: string;
}

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'YER', symbol: 'ر.ي', name: 'الريال اليمني (ر.ي)' },
  { code: 'SAR', symbol: 'ر.س', name: 'الريال السعودي (ر.س)' },
  { code: 'USD', symbol: '$', name: 'الدولار الأمريكي ($)' },
  { code: 'AED', symbol: 'د.إ', name: 'الدرهم الإماراتي (د.إ)' },
  { code: 'OMR', symbol: 'ر.ع', name: 'الريال العماني (ر.ع)' },
  { code: 'KWD', symbol: 'د.ك', name: 'الدينار الكويتي (د.ك)' },
  { code: 'EGP', symbol: 'ج.م', name: 'الجنيه المصري (ج.م)' },
  { code: 'QAR', symbol: 'ر.ق', name: 'الريال القطري (ر.ق)' },
  { code: 'BHD', symbol: 'د.ب', name: 'الدينار البحريني (د.ب)' },
  { code: 'EUR', symbol: '€', name: 'اليورو (€)' },
];
