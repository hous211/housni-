import React, { useState } from 'react';
import { BudgetState, CategoryID } from '../types';
import { 
  ShieldCheck, 
  TrendingUp, 
  PiggyBank, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  TrendingDown,
  Coins,
  Plus,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  HandCoins,
  History
} from 'lucide-react';

interface BudgetSummaryProps {
  budgetState: BudgetState;
  onAdjustBudget: (category: CategoryID, amount: number) => void;
  onRepayCategory?: (category: CategoryID, amount: number, type: 'reimburse' | 'allocate', notes: string) => void;
}

// Map key to corresponding icon for safe rendering
const getCategoryIcon = (id: CategoryID, className: string) => {
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

export default function BudgetSummary({ budgetState, onAdjustBudget, onRepayCategory }: BudgetSummaryProps) {
  const categories = Object.values(budgetState);

  // Form states for inline direct funding/repayment
  const [activeRepayCategory, setActiveRepayCategory] = useState<CategoryID | null>(null);
  const [inputAmount, setInputAmount] = useState<string>('');
  const [repayType, setRepayType] = useState<'reimburse' | 'allocate'>('reimburse');
  const [repayNotes, setRepayNotes] = useState<string>('');

  const handleToggleRepay = (catId: CategoryID, isExceeded: boolean, deficitAmount: number) => {
    if (activeRepayCategory === catId) {
      setActiveRepayCategory(null);
    } else {
      setActiveRepayCategory(catId);
      // Pre-fill with deficit amount if exists, or a friendly 100
      if (isExceeded && deficitAmount > 0) {
        setInputAmount(deficitAmount.toString());
        setRepayType('reimburse');
      } else {
        setInputAmount('200');
        setRepayType('reimburse');
      }
      setRepayNotes('');
    }
  };

  const handleQuickAdd = (value: number) => {
    const current = parseFloat(inputAmount) || 0;
    setInputAmount((current + value).toString());
  };

  const handleSubmitRepay = (catId: CategoryID) => {
    const amount = parseFloat(inputAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (onRepayCategory) {
      onRepayCategory(catId, amount, repayType, repayNotes);
    }

    // Reset inline form
    setActiveRepayCategory(null);
    setInputAmount('');
    setRepayNotes('');
  };

  return (
    <div id="budget-summary-section" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-l from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-600 rounded-lg mt-1">
            <Coins className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm sm:text-base">ميزة التتبع التلقائي والتمويل المباشر ⚡</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              يمكنك زيادة مخصص أي قسم أو إيداع أموال مباشرة لسداد العجز المنفق بعد الصرف لتعويض الفارق والموازنة بشكل لحظي.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1.5 animate-ping"></span>
            مُفعل تلقائياً
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => {
          const spentPercent = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;
          const isExceeded = category.spent > category.allocated;
          const isCloseToLimit = !isExceeded && spentPercent >= 85;
          const remaining = category.allocated - category.spent;
          const deficitAmount = isExceeded ? category.spent - category.allocated : 0;
          const isFormOpen = activeRepayCategory === category.id;

          return (
            <div 
              key={category.id}
              id={`budget-card-${category.id}`}
              className={`relative overflow-hidden bg-white border rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md ${
                isFormOpen ? 'ring-2 ring-indigo-505 border-indigo-200 shadow-md' : isExceeded ? 'border-rose-250 ring-1 ring-rose-100' : isCloseToLimit ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-100'
              }`}
            >
              {/* Top Section */}
              <div className="flex justify-between items-start gap-2 mb-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                    {category.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed min-h-[32px]">
                    {category.description}
                  </p>
                </div>
                <div 
                  className="p-2.5 rounded-xl shrink-0"
                  style={{ backgroundColor: `${category.color}15`, color: category.color }}
                >
                  {getCategoryIcon(category.id, 'w-5 h-5')}
                </div>
              </div>

              {/* Allocation Data */}
              <div className="space-y-3 mt-4">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>المصروف الفعلي:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {category.spent.toLocaleString('en-US')} / {category.allocated.toLocaleString('en-US')} أ.م
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${Math.min(spentPercent, 100)}%`,
                      backgroundColor: isExceeded ? '#ef4444' : isCloseToLimit ? '#f59e0b' : category.color
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className={`px-2 py-0.5 rounded-md font-medium font-mono ${
                    isExceeded ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-700'
                  }`}>
                    {spentPercent.toFixed(0)}% من الحد
                  </span>
                  
                  <span className={`font-medium ${isExceeded ? 'text-rose-600' : remaining >= 0 ? 'text-slate-600' : 'text-slate-500'}`}>
                    {isExceeded ? (
                      <span className="flex items-center gap-1 text-xs text-rose-600 font-bold">
                        <TrendingDown className="w-4 h-4" />
                        عجز: {deficitAmount.toLocaleString('en-US')} أ.م
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-600">
                        متبقي: {remaining.toLocaleString('en-US')} أ.م
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Smart Warning Card alert */}
              {isExceeded && (
                <div className="mt-4 p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs leading-relaxed flex items-start gap-1.5 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">تنبيه تلقائي:</span> تجاوزت الميزانية! ننصح بتغذية الحساب أو سداد العجز مباشرة لتعويض الضرر.
                  </div>
                </div>
              )}

              {isCloseToLimit && !isExceeded && (
                <div className="mt-4 p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 text-xs leading-relaxed flex items-start gap-1.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">اقتراب من الحد:</span> استهلكت أكثر من ٨٥٪ من مخصص القسم المالي.
                  </div>
                </div>
              )}

              {!isExceeded && !isCloseToLimit && (
                <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs leading-relaxed flex items-start gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">حالة ممتازة:</span> الصرف ضمن الحدود الموصوفة في هذا القسم. تابع هذا الانضباط!
                  </div>
                </div>
              )}

              {/* Repay / Deposit collapse trigger button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <button 
                      onClick={() => onAdjustBudget(category.id, -200)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition-colors"
                      title="تقليل الميزانية بمقدار ٢٠٠"
                    >
                      -٢٠٠
                    </button>
                    <button 
                      onClick={() => onAdjustBudget(category.id, 200)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded text-xs font-bold transition-colors"
                      title="زيادة الميزانية بمقدار ٢٠٠"
                    >
                      +٢٠٠
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleToggleRepay(category.id, isExceeded, deficitAmount)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      isFormOpen 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إيداع وسداد مالي</span>
                  </button>
                </div>

                {/* Inline funding/repayment form */}
                {isFormOpen && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-3 animate-fadeIn">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1.5">طبيعة العملية المالية:</span>
                      <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-lg border border-slate-100">
                        <button
                          type="button"
                          onClick={() => setRepayType('reimburse')}
                          className={`py-1 text-[10px] font-bold rounded-md transition-colors ${
                            repayType === 'reimburse'
                              ? 'bg-emerald-500 text-white'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          سداد الإنفاق (رصيد موجب)
                        </button>
                        <button
                          type="button"
                          onClick={() => setRepayType('allocate')}
                          className={`py-1 text-[10px] font-bold rounded-md transition-colors ${
                            repayType === 'allocate'
                              ? 'bg-indigo-505 bg-indigo-600 text-white'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          تغذية ميزانية (زيادة الحد)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor={`deposit-amount-input-${category.id}`} className="text-xs font-bold text-slate-700 block mb-1">
                        المبلغ المطلوب (أ.م):
                      </label>
                      <input 
                        id={`deposit-amount-input-${category.id}`}
                        type="number" 
                        min="1"
                        placeholder="الكمية بالدرهم..."
                        className="w-full text-xs font-mono font-bold bg-white text-slate-800 border border-slate-200 rounded-lg p-2 focus:outline-inner focus:ring-1 focus:ring-emerald-500"
                        value={inputAmount}
                        onChange={(e) => setInputAmount(e.target.value)}
                      />
                    </div>

                    {/* Quick values buttons */}
                    <div className="flex flex-wrap gap-1">
                      <button 
                        type="button" 
                        onClick={() => handleQuickAdd(50)} 
                        className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-mono font-bold"
                      >
                        +٥٠
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleQuickAdd(100)} 
                        className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-mono font-bold"
                      >
                        +١٠٠
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleQuickAdd(200)} 
                        className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-mono font-bold"
                      >
                        +٢٠٠
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleQuickAdd(500)} 
                        className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-mono font-bold"
                      >
                        +٥٠٠
                      </button>
                    </div>

                    <div>
                      <label htmlFor={`deposit-notes-input-${category.id}`} className="text-xs font-bold text-slate-700 block mb-1">
                        ملاحظة المعاملة الحية (اختياري):
                      </label>
                      <input 
                        id={`deposit-notes-input-${category.id}`}
                        type="text" 
                        placeholder="مثال: سداد المصروف أو تغذية طارئة..."
                        className="w-full text-xs bg-white text-slate-800 border border-slate-200 rounded-lg p-2 focus:outline-none"
                        value={repayNotes}
                        onChange={(e) => setRepayNotes(e.target.value)}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSubmitRepay(category.id)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>تأكيد الإيداع والسداد المعزز</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
