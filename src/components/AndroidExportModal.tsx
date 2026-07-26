import React, { useState } from 'react';
import { X, Smartphone, Download, Play, CheckCircle2, ShieldCheck, FileCode, Layers, ArrowLeft, Copy, ExternalLink, Sparkles, Building2, Phone } from 'lucide-react';

interface AndroidExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidExportModal: React.FC<AndroidExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const commandSteps = [
    { label: 'بناء ملفات الويب المجمعة', cmd: 'npm run build' },
    { label: 'مزامنة مشروع الأندرويد Capacitor', cmd: 'npx cap sync android' },
    { label: 'فتح المشروع في Android Studio', cmd: 'npx cap open android' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto font-['Cairo',sans-serif] dir-rtl" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl text-slate-100 shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>تصدير تطبيق أندرويد (APK / AAB)</span>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  جاهز للرفع
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                تطبيق أندرويد متوافق مع كافة الإصدارات ومجهز للنشر في متجر Google Play
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Status Alert Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-black text-amber-300">المشروع مهيأ ومبني بالكامل بواسطة Capacitor Android:</h4>
              <p className="text-slate-300 font-bold leading-relaxed">
                تم إنشاء مجلد <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 font-mono font-bold">/android</code> وضبط <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 font-mono font-bold">com.engjehadsystem.equipment</code> بنجاح وتفعيل دعم RTL والدعم لكافة إصدارات الأندرويد.
              </p>
            </div>
          </div>

          {/* Method 1: Android Studio / Capacitor (Standard Native APK & Play Store) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                <h4 className="font-extrabold text-white text-sm">البناء والتصدير بـ Android Studio (APK + AAB لـ Google Play):</h4>
              </div>
              <span className="text-[10px] bg-slate-800 text-amber-400 font-mono px-2 py-0.5 rounded-md font-bold">Capacitor SDK</span>
            </div>

            <p className="text-xs text-slate-300 font-bold leading-relaxed">
              قم بتحميل مشروع الكود المصدري من زر (تنزيل ZIP / GitHub) في أعلى التطبيق ثم نفذ الأوامر التالية في مجلد المشروع:
            </p>

            <div className="space-y-2">
              {commandSteps.map((item, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">{item.label}</span>
                    <code className="text-amber-400 font-mono font-bold">{item.cmd}</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.cmd, idx)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title="نسخ الأمر"
                  >
                    {copiedIndex === idx ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">{copiedIndex === idx ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-2">
              <p className="font-bold text-amber-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>خطوات استخراج APK/AAB داخل Android Studio:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] font-bold pr-2">
                <li>من القائمة العلوية اختر: <strong className="text-white">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> للحصول على ملف APK مباشر للإنستول.</li>
                <li>للنشر في متجر Google Play: اختر <strong className="text-white">Build &gt; Generate Signed Bundle / APK</strong> واختر <strong className="text-amber-400">Android App Bundle (.aab)</strong>.</li>
              </ul>
            </div>
          </div>

          {/* Method 2: PWABuilder / Online 1-Click APK */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
              <h4 className="font-extrabold text-white text-sm">البناء السريع أونلاين بضغطة زر (PWABuilder / WebAPK):</h4>
            </div>
            <p className="text-xs text-slate-300 font-bold leading-relaxed">
              إذا كنت تفضل الحصول على ملف APK جاهز فوراً دون الحاجة لتثبيت Android Studio:
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 font-bold pr-2">
              <li>انسخ رابط التطبيق المشارك الحالي (أو الرابط المنشور).</li>
              <li>توجه إلى موقع <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-bold inline-flex items-center gap-1">PWABuilder.com <ExternalLink className="w-3 h-3" /></a></li>
              <li>أدخل رابط التطبيق واضغط <strong className="text-white">Package for Android</strong> لتنزيل APK مجمع وباقة Google Play جاهزة للتثبيت فوراً.</li>
            </ol>
          </div>

          {/* Google Play Requirements Summary */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h4 className="font-extrabold text-white text-sm">متطلبات رفع التطبيق على Google Play Console:</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-300">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-amber-400 block mb-0.5">Package ID:</span>
                <code className="text-white font-mono dir-ltr block text-[11px]">com.engjehadsystem.equipment</code>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-amber-400 block mb-0.5">اسم التطبيق بالمتجر:</span>
                <span className="text-white block text-[11px]">نظام إدارة المعدات ومخزن الديزل</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-amber-400 block mb-0.5">الإصدار الموصى به:</span>
                <span className="text-white block text-[11px]">Target SDK 34 / Android 14+</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-amber-400 block mb-0.5">امتداد الملف للرفع:</span>
                <span className="text-emerald-400 font-extrabold block text-[11px]">Android App Bundle (.aab)</span>
              </div>
            </div>
          </div>

          {/* Developer Contact Footer Card */}
          <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-black text-xs mb-1">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>تصميم وإعداد المهندس جهاد مفتاح</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-200 dir-ltr mt-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>للتواصل والمساعدة في الرفع : </span>
              <a href="tel:00967770999936" className="text-amber-400 font-mono font-black hover:underline">
                00967770999936
              </a>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-amber-500/20"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
