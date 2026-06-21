import React, { useState } from 'react';
import { SavingsGoal } from '../types';
import { Target, Calendar, Plus, Trophy, Trash2, CheckCircle } from 'lucide-react';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: { title: string; target: number; deadline?: string }) => void;
  onFundGoal: (id: string, amount: number) => void;
  onDeleteGoal: (id: string) => void;
}

export default function SavingsGoals({ goals, onAddGoal, onFundGoal, onDeleteGoal }: SavingsGoalsProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState<number | ''>('');
  const [newDeadline, setNewDeadline] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [amountToFund, setAmountToFund] = useState<{ [key: string]: number }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTarget || newTarget <= 0) return;

    onAddGoal({
      title: newTitle.trim(),
      target: Number(newTarget),
      deadline: newDeadline || undefined
    });

    setNewTitle('');
    setNewTarget('');
    setNewDeadline('');
    setShowAddForm(false);
  };

  const handleFund = (id: string) => {
    const fundAmount = amountToFund[id] || 0;
    if (fundAmount <= 0) return;
    onFundGoal(id, fundAmount);
    // Reset amount input for that goal
    setAmountToFund(prev => ({ ...prev, [id]: 0 }));
  };

  return (
    <div id="savings-goals-section" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            أهدافك المالية والادخارية التفاعلية
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            تتبع أهدافك الكبرى وادعمها مالياً مباشرة بكسر النفقات وتوجيهها للحقائب الكسبانية
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'إلغاء الإضافة' : 'إنشاء هدف مالي جديد'}
        </button>
      </div>

      {/* Add New Goal Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-4 animate-fadeIn">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">تحديد مواصفات الهدف المالي</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">اسم الهدف</label>
              <input
                type="text"
                required
                placeholder="مثال: شراء لابتوب للعمل، عطلة الصيف"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">المبلغ المالي المستهدف</label>
              <input
                type="number"
                required
                min="1"
                placeholder="مثال: 15000"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">تاريخ الإنجاز المتوقع (اختياري)</label>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow-sm transition-all"
          >
            حفظ الهدف المالي والبدء بالتتبع
          </button>
        </form>
      )}

      {/* Goals grid block */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const percent = goal.target > 0 ? (goal.currentValue / goal.target) * 100 : 0;
          const isCompleted = goal.currentValue >= goal.target;

          return (
            <div 
              key={goal.id} 
              id={`goal-item-${goal.id}`}
              className={`border rounded-xl p-5 shadow-sm transition-all relative ${
                isCompleted ? 'bg-emerald-50/40 border-emerald-100' : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 leading-snug">
                    {goal.title}
                    {isCompleted && <Trophy className="w-4 h-4 text-amber-500 shrink-0 animate-bounce" />}
                  </h4>
                  {goal.deadline && (
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      الموعد: {goal.deadline}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="p-1 px-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-all text-xs"
                  title="حذف الهدف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress and values */}
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-baseline text-xs text-slate-500">
                  <span>تم تجميع:</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {goal.currentValue.toLocaleString('en-US')} / {goal.target.toLocaleString('en-US')} أ.م
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {percent.toFixed(0)}% مكتمل
                  </span>
                  {!isCompleted && (
                    <span className="text-indigo-600 font-semibold text-[10px]">
                      متبقي {(goal.target - goal.currentValue).toLocaleString('en-US')} أ.م
                    </span>
                  )}
                </div>
              </div>

              {/* Fund goal controls */}
              {!isCompleted ? (
                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="مبلغ لتخصيصه..."
                    min="1"
                    value={amountToFund[goal.id] || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                      setAmountToFund(prev => ({ ...prev, [goal.id]: val }));
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 placeholder:text-slate-400"
                  />
                  <button
                    onClick={() => handleFund(goal.id)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
                  >
                    تغذية الهدف
                  </button>
                </div>
              ) : (
                <div className="mt-4 pt-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs px-2.5 py-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">تهانينا! لقد حققت هدفك المالي بنجاح!</span>
                </div>
              )}
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 py-10 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-1.5">
            <span className="text-3xl">🎯</span>
            <p className="font-bold text-slate-700 text-sm">لا توجد أهداف مالية نشطة في المحفظة</p>
            <p className="text-xs text-slate-500">حدد أهدافك الأولى لتدعيم الانضباط ومحاربة الإنفاق العشوائي.</p>
          </div>
        )}
      </div>
    </div>
  );
}
