import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Phone, CheckCircle2, AlertCircle, Wrench, Building2, KeyRound, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const trimmedUser = username.trim();
      const trimmedPass = password.trim();

      // Check strictly against required username 'جهاد' and password '770999936'
      if (trimmedUser === 'جهاد' && trimmedPass === '770999936') {
        onLoginSuccess('جهاد');
      } else {
        if (trimmedUser !== 'جهاد' && trimmedPass !== '770999936') {
          setError('اسم المستخدم وكلمة المرور غير صحيحة!');
        } else if (trimmedUser !== 'جهاد') {
          setError('اسم المستخدم غير صحيح!');
        } else {
          setError('كلمة المرور غير صحيحة!');
        }
        setIsLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between items-center p-4 sm:p-6 font-['Cairo',sans-serif] text-slate-100 relative overflow-hidden dir-rtl" dir="rtl">
      
      {/* Abstract Background Glow Accent Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Space / Brand Header */}
      <div className="w-full max-w-md pt-6 text-center z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 mb-3 border border-amber-300/40">
          <Wrench className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
          نظام إدارة المعدات ومخزن الديزل
        </h1>
        <p className="text-xs text-amber-400 font-bold mt-1">
          إدارة المشاريع، الموردين، التقارير اليومية وحسابات المعدات
        </p>
      </div>

      {/* Login Card Form */}
      <div className="w-full max-w-md my-auto z-10 my-6">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-white">تسجيل الدخول للنظام</h2>
            </div>
            <span className="text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full">
              محمي بأمان
            </span>
          </div>

          {error && (
            <div className="mb-5 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>اسم المستخدم:</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  required
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-right"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>كلمة المرور:</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  required
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-right pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>جاري التحقق والدخول...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>دخول النظام</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Developer Credit Footer Card */}
      <div className="w-full max-w-md z-10 pb-4">
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 text-center shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-amber-400 font-black text-sm mb-1">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>تصميم وإعداد المهندس جهاد مفتاح</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300 dir-ltr mt-1">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>للتواصل : </span>
            <a 
              href="tel:00967770999936" 
              className="text-amber-400 hover:underline font-mono font-bold tracking-wider"
            >
              00967770999936
            </a>
          </div>
          <div className="mt-2 text-[10px] text-slate-400">
            جميع الحقوق محفوظة لنظام إدارة المشاريع والأعمال الميدانية © {new Date().getFullYear()}
          </div>
        </div>
      </div>

    </div>
  );
};
