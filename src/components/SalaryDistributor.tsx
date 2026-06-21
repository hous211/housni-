import React, { useState, useEffect } from 'react';
import { BudgetState, CategoryID } from '../types';
import { 
  Plus, 
  Minus, 
  Wallet, 
  Coins, 
  ArrowUpRight, 
  Percent, 
  AlertCircle, 
  CheckCircle, 
  Sparkles,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  PiggyBank
} from 'lucide-react';

interface SalaryDistributorProps {
  budgetState: BudgetState;
  onApplySalary: (salaryAmount: number, allocations: { [key in CategoryID]: number }) => void;
  showToast: (msg: string) => void;
}

// Key-to-icon mapping for correct rendering
const getCatIcon = (id: CategoryID, className: string) => {
  switch (id) {
    case 'obligations':
      return <ShieldCheck className={className} />;
    case 'investment':
      return <TrendingUp className={className} />;
    case 'savings':
      return <PiggyBank className={className} />;
    case 'entertainment':
      return <Sparkles className={className} />;
  }
};

export default function SalaryDistributor({ budgetState, onApplySalary, showToast }: SalaryDistributorProps) {
  const [salary, setSalary] = useState<number>(35000);
  const [isOpen, setIsOpen] = useState(true);

  // Percentages state
  const [percentages, setPercentages] = useState<{ [key in CategoryID]: number }>({
    obligations: 50,
    investment: 20,
    savings: 15,
    entertainment: 15
  });

  // Calculate allocated values based on current salary and percentages
  const calculatedAmounts = {
    obligations: Math.round((salary * percentages.obligations) / 100),
    investment: Math.round((salary * percentages.investment) / 100),
    savings: Math.round((salary * percentages.savings) / 100),
    entertainment: Math.round((salary * percentages.entertainment) / 100)
  };

  const totalPercentage = percentages.obligations + percentages.investment + percentages.savings + percentages.entertainment;
  const totalAllocatedAmount = calculatedAmounts.obligations + calculatedAmounts.investment + calculatedAmounts.savings + calculatedAmounts.entertainment;
  const remainingPercentage = 100 - totalPercentage;
  const remainingAmount = salary - totalAllocatedAmount;

  // Sync percentages with current budget state on initial load, or just fallback to sensible defaults
  useEffect(() => {
    // Attempt to calculate percentages based on current budget state if existing allocations exist
    const totalAlloc = Object.values(budgetState).reduce((a, b) => a + b.allocated, 0);
    if (totalAlloc > 0) {
      setPercentages({
        obligations: Math.round((budgetState.obligations.allocated / totalAlloc) * 100) || 50,
        investment: Math.round((budgetState.investment.allocated / totalAlloc) * 100) || 20,
        savings: Math.round((budgetState.savings.allocated / totalAlloc) * 100) || 15,
        entertainment: Math.round((budgetState.entertainment.allocated / totalAlloc) * 100) || 15
      });
      // Set salary to the total allocated if it exists
      setSalary(totalAlloc);
    }
  }, []);

  // Set preset templates
  const handleApplyPreset = (preset: 'balanced' | 'aggressive' | 'equal') => {
    if (preset === 'balanced') {
      setPercentages({ obligations: 50, investment: 25, savings: 15, entertainment: 10 });
      showToast('تم تطبيق المخطط المالي المتوازن (50٪ التزامات / 25٪ استثمار / 15٪ ادخار / 10٪ ترفيه)');
    } else if (preset === 'aggressive') {
      setPercentages({ obligations: 35, investment: 35, savings: 20, entertainment: 10 });
      showToast('تم تطبيق مخطط الاستثمار والادخار القوي!');
    } else {
      setPercentages({ obligations: 25, investment: 25, savings: 25, entertainment: 25 });
      showToast('تم تقسيم الراتب بالتساوي بين كافة الأقسام (25٪ لكل قسم)');
    }
  };

  const handlePercentageChange = (category: CategoryID, value: number) => {
    const updatedValue = Math.max(0, Math.min(100, value));
    setPercentages(prev => ({
      ...prev,
      [category]: updatedValue
    }));
  };

  const adjustPercent = (category: CategoryID, amount: number) => {
    setPercentages(prev => {
      const current = prev[category];
      const next = Math.max(0, Math.min(100, current + amount));
      return {
        ...prev,
        [category]: next
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (salary <= 0) {
      showToast('يرجى تحديد راتب شهري حقيقي أكبر من الصفر.');
      return;
    }

    if (totalPercentage > 100) {
      showToast('⚠️ لا يمكن تجاوز نسبة توزيع 100٪ من الراتب!');
      return;
    }

    onApplySalary(salary, calculatedAmounts);
    showToast(`💰 ممتاز! تم إيداع الراتب بقيمة ${salary.toLocaleString('en-US')} أ.م وتعديل وتوزيع مخصصات الأقسام تلقائياً طبقاً للنسب المئوية.`);
  };

  return (
    <div id="salary-distributor-card" className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
      
      {/* Card Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-900 text-white p-5 cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl text-emerald-400">
            <Wallet className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base">توزيع وإدارة الراتب الشهري الذكي ⚡</h3>
            <p className="text-slate-400 text-xs mt-0.5">أدخل راتبك وحدد نسبة حية لكل قسم مالي مع الحساب التلقائي</p>
          </div>
        </div>
        
        <button className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-300">
          {isOpen ? (
            <Minus className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 animate-fadeIn text-right" dir="rtl">
          
          {/* Salary input part */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
            <div className="md:col-span-4 space-y-2">
              <label htmlFor="monthly-salary-input" className="block text-xs font-bold text-slate-700">
                قيمة راتبك الشهري (أوقية موريتانية):
              </label>
              <div className="relative">
                <input 
                  id="monthly-salary-input"
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder="مثال: 35000"
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all text-left"
                  value={salary || ''}
                  onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                />
                <span className="absolute inset-y-0 left-3 flex items-center text-xs text-slate-500 font-bold pointer-events-none">
                  أ.م
                </span>
              </div>
            </div>

            {/* Presets distributor */}
            <div className="md:col-span-8 space-y-2">
              <span className="block text-xs font-bold text-slate-700">
                مخططات وقوالب توزيع الراتب الجاهزة:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('balanced')}
                  className="py-2.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-indigo-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Coins className="w-4 h-4 text-emerald-500" />
                  <span>المتوازن (50-25-15)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('aggressive')}
                  className="py-2.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-indigo-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4 text-indigo-505 text-indigo-500" />
                  <span>الادخار القوي</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('equal')}
                  className="py-2.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-indigo-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Percent className="w-4 h-4 text-slate-500" />
                  <span>بالتساوي (٢٥٪)</span>
                </button>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Core distribution categories grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(budgetState).map((key) => {
              const catId = key as CategoryID;
              const cat = budgetState[catId];
              const pct = percentages[catId];
              const calculatedAmt = calculatedAmounts[catId];

              return (
                <div 
                  key={catId} 
                  className="border border-slate-150 p-4 rounded-xl space-y-3 bg-slate-50/50 hover:bg-white hover:border-indigo-150 transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="p-1.5 rounded-lg text-white"
                        style={{ backgroundColor: cat.color }}
                      >
                        {getCatIcon(catId, 'w-4 h-4')}
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{cat.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => adjustPercent(catId, -5)}
                        className="p-1 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-10 text-center font-mono font-bold text-slate-800 text-xs bg-transparent focus:outline-none"
                          value={pct}
                          onChange={(e) => handlePercentageChange(catId, parseInt(e.target.value) || 0)}
                        />
                        <span className="text-[10px] text-slate-400 font-bold ml-1">%</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => adjustPercent(catId, 5)}
                        className="p-1 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Range slider */}
                  <div className="relative">
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      className="w-full accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                      value={pct}
                      onChange={(e) => handlePercentageChange(catId, parseInt(e.target.value) || 0)}
                    />
                  </div>

                  {/* Live calculated amount */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">القيمة المالية المحتسبة للقسم:</span>
                    <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 border border-slate-100 rounded">
                      {calculatedAmt.toLocaleString('en-US')} أ.م
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time sum total indicators and status alerts */}
          <div className="p-4 bg-slate-900/5 border border-slate-150 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* Total allocated sum */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2">
                <span className="text-slate-500">إجمالي التوزيع المختار:</span>
                <span className={`font-mono font-black ${
                  totalPercentage === 100 
                    ? 'text-emerald-600' 
                    : totalPercentage > 100 
                      ? 'text-rose-600' 
                      : 'text-indigo-650'
                }`}>
                  {totalPercentage}% / 100%
                </span>
                <span className="font-mono text-[11px] text-slate-500 font-bold bg-slate-100 px-1 rounded">
                  ({totalAllocatedAmount.toLocaleString('en-US')} أ.م)
                </span>
              </div>

              <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2">
                <span className="text-slate-500">متبقي غير موزع:</span>
                <span className={`font-mono font-black ${
                  remainingPercentage === 0 
                    ? 'text-emerald-600' 
                    : remainingPercentage < 0 
                      ? 'text-rose-600' 
                      : 'text-amber-600'
                }`}>
                  {remainingPercentage}% 
                </span>
                <span className="font-mono text-[11px] text-slate-500 font-bold bg-slate-100 px-1 rounded">
                  ({remainingAmount.toLocaleString('en-US')} أ.م)
                </span>
              </div>
            </div>

            {/* Smart info feedback badge */}
            <div className="flex items-center gap-1.5">
              {totalPercentage === 100 ? (
                <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>النسب متطابقة وذكية تماماً!</span>
                </div>
              ) : totalPercentage > 100 ? (
                <div className="text-xs text-rose-700 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>يرجى تقليل بعض النسب المئوية.</span>
                </div>
              ) : (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>تنبيه: يوجد رصيد إضافي غير مخصص بعد!</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit application */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={salary <= 0 || totalPercentage > 100}
              className={`px-6 py-3 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all duration-200 cursor-pointer ${
                salary > 0 && totalPercentage <= 100
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <ArrowUpRight className="w-4.5 h-4.5" />
              <span>إيداع الراتب وتحديث نسب الأقسام تلقائياً</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
