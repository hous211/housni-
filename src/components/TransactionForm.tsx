import React, { useState, useEffect } from 'react';
import { CategoryID, BudgetState } from '../types';
import { PlusCircle, Wallet, Calendar, AlertTriangle, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';

interface TransactionFormProps {
  budgetState: BudgetState;
  onAddTransaction: (tx: {
    title: string;
    amount: number;
    type: 'income' | 'expense';
    categoryId: CategoryID | 'income';
    date: string;
    notes: string;
  }) => void;
}

export default function TransactionForm({ budgetState, onAddTransaction }: TransactionFormProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState<CategoryID | 'income'>('obligations');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [liveWarning, setLiveWarning] = useState<string | null>(null);

  // Sync category selection when type changes
  useEffect(() => {
    if (type === 'income') {
      setCategoryId('income');
    } else if (categoryId === 'income') {
      setCategoryId('obligations');
    }
  }, [type]);

  // Real-time automatic tracking calculator (Live analysis)
  useEffect(() => {
    if (type === 'expense' && amount && categoryId !== 'income') {
      const category = budgetState[categoryId as CategoryID];
      const nextSpent = category.spent + Number(amount);
      if (nextSpent > category.allocated) {
        const overBy = nextSpent - category.allocated;
        setLiveWarning(
          `⚠️ تنبيه تتبع تلقائي: إقرار هذا المصروف سيتجاوز ميزانية "${category.title}" المخصصة بـ ${overBy.toLocaleString('en-US')} أ.م.`
        );
      } else if (nextSpent >= category.allocated * 0.85) {
        setLiveWarning(
          `ℹ️ تنبيه تتبع تلقائي: الصرف سيقترب جداً من سقف ميزانية "${category.title}" (يصل إلى ${(
            (nextSpent / category.allocated) *
            100
          ).toFixed(0)}%).`
        );
      } else {
        setLiveWarning(null);
      }
    } else if (type === 'income' && amount && categoryId === 'investment') {
      // Automatic tracking of investment dividends increase
      setLiveWarning(
        `🎉 رائع! تسجيل أرباح كدخل استثماري يعزز نمو المحفظة ويزيد العائد التراكمي للحقيبة التدفقية.`
      );
    } else {
      setLiveWarning(null);
    }
  }, [amount, categoryId, type, budgetState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || amount <= 0) return;

    onAddTransaction({
      title: title.trim(),
      amount: Number(amount),
      type,
      categoryId,
      date,
      notes: notes.trim()
    });

    // Reset Form
    setTitle('');
    setAmount('');
    setNotes('');
  };

  return (
    <div id="transaction-form-card" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-50 pb-4 mb-5">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">أدخل معاملة مالية جديدة</h3>
          <p className="text-xs text-slate-500 mt-0.5">سجل التدفقات الداخلة والخارجة للتتبع الفوري والمؤتمت</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-1.5 rounded-xl">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            تسجيل مصروف (نقص)
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            تسجيل دخــل (زيادة)
          </button>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">بيان المعاملة / الاسم</label>
          <div className="relative">
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              <Tag className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              placeholder="مثال: فاتورة الجوال، عشاء عمل، أرباح سهم سابك"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Amount & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">المبلغ المالي</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-xs font-bold text-slate-500">أ.م</span>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full pr-4 pl-12 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">التاريخ</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Category selector (only if Expense or specific Income) */}
        {type === 'expense' ? (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">اختيار القسم المالي لتتبع المستهدف</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value as CategoryID)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-medium"
            >
              <option value="obligations">🛡️ الالتزامات الأساسية (فواتير، إيجار، ديون)</option>
              <option value="investment">📈 الاستثمار الاستراتيجي (أسهم، أصول، محافظ)</option>
              <option value="savings">🐷 الادخار للمستقبل (صندوق طوارئ، تنمية أهداف)</option>
              <option value="entertainment">✨ الترفيه ونمط الحياة (مطاعم، كافيهات، تسوق كمالي)</option>
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">وجهة الإيداع الافتراضية</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value as CategoryID | 'income')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-medium"
            >
              <option value="income">💳 رصيد حر عام (يزيد الكاش الكلي)</option>
              <option value="investment">📈 أرباح مخصصة للاستثمار (تنمية الحقيبة الاستثمارية)</option>
              <option value="savings">🐷 إيداع ادخاري مباشر (تسجيل نمو في مدخرات الطوارئ)</option>
            </select>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">ملاحظات إضافية (اختياري)</label>
          <textarea
            rows={2}
            placeholder="مثال: تم الاقتطاع من الحساب الرئيسي مباشرة"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Live Tracking Warning Block */}
        {liveWarning && (
          <div 
            className={`p-3.5 border rounded-xl text-xs leading-relaxed flex items-start gap-1.5 animate-pulse ${
              type === 'expense' 
                ? 'bg-amber-50 border-amber-200 text-amber-800' 
                : 'bg-emerald-50 border-emerald-100 text-emerald-800'
            }`}
          >
            {type === 'expense' ? <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" /> : null}
            <div>{liveWarning}</div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!title || !amount}
          className="w-full mt-2 cursor-pointer flex items-center justify-center gap-1.5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-55 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          إضافة المعاملة للتتبع الحي الفوري
        </button>
      </form>
    </div>
  );
}
