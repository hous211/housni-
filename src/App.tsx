import React, { useState, useEffect } from 'react';
import { loadFinancialState, saveFinancialState } from './data/mockData';
import { BudgetState, Transaction, SavingsGoal, CategoryID } from './types';
import BudgetSummary from './components/BudgetSummary';
import BudgetCharts from './components/BudgetCharts';
import TransactionForm from './components/TransactionForm';
import SavingsGoals from './components/SavingsGoals';
import SmartAdvisor from './components/SmartAdvisor';
import SalaryDistributor from './components/SalaryDistributor';

import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Upload, 
  Search, 
  Trash2, 
  BarChart3, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  PiggyBank, 
  Target, 
  BrainCircuit, 
  Wallet,
  AlertCircle,
  Clock,
  Filter,
  Check
} from 'lucide-react';

export default function App() {
  // Load initial persistent state
  const { budgetState: initialBudget, transactions: initialTxs, goals: initialGoals } = loadFinancialState();
  
  const [budgetState, setBudgetState] = useState<BudgetState>(initialBudget);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTxs);
  const [goals, setGoals] = useState<SavingsGoal[]>(initialGoals);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'goals' | 'advisor'>('dashboard');
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);

  // Transactions ledger list filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryID | 'all' | 'income'>('all');

  // Sync state to localStorage every time something changes
  useEffect(() => {
    saveFinancialState(budgetState, transactions, goals);
  }, [budgetState, transactions, goals]);

  // Real-time calculation of totals
  const totalIncomes = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentBalance = totalIncomes - totalExpenses;

  // Add Transaction & automatically update the category spent budget (Active automated tracking)
  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'autoTracked'>) => {
    const id = 'tx-' + Math.random().toString(36).substr(2, 9);
    const tx: Transaction = { 
      ...newTx, 
      id,
      autoTracked: false
    };

    setTransactions(prev => [tx, ...prev]);

    // Recalculate relevant category spended amount
    if (tx.type === 'expense') {
      const catId = tx.categoryId as CategoryID;
      setBudgetState(prev => {
        const cat = prev[catId];
        return {
          ...prev,
          [catId]: {
            ...cat,
            spent: cat.spent + tx.amount
          }
        };
      });
    } else {
      // If income got tagged to a category, let's treat it as reducing net expense (paying back/reimbursing)
      const catId = tx.categoryId;
      if (catId && catId !== 'income') {
        setBudgetState(prev => {
          const cat = prev[catId as CategoryID];
          return {
            ...prev,
            [catId as CategoryID]: {
              ...cat,
              spent: Math.max(0, cat.spent - tx.amount)
            }
          };
        });
      }
    }
  };

  // Delete transaction & undo its spent changes automatically (Active tracking symmetry)
  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    setTransactions(prev => prev.filter(t => t.id !== id));

    if (tx.type === 'expense') {
      const catId = tx.categoryId as CategoryID;
      setBudgetState(prev => {
        const cat = prev[catId];
        return {
          ...prev,
          [catId]: {
            ...cat,
            spent: Math.max(0, cat.spent - tx.amount)
          }
        };
      });
    } else {
      const catId = tx.categoryId;
      if (catId && catId !== 'income') {
        setBudgetState(prev => {
          const cat = prev[catId as CategoryID];
          return {
            ...prev,
            [catId as CategoryID]: {
              ...cat,
              spent: cat.spent + tx.amount
            }
          };
        });
      }
    }
  };

  // Adjust monthly budget allocation limit
  const handleAdjustBudget = (category: CategoryID, amount: number) => {
    setBudgetState(prev => {
      const cat = prev[category];
      return {
        ...prev,
        [category]: {
          ...cat,
          allocated: Math.max(100, cat.allocated + amount)
        }
      };
    });
  };

  // Settle deficit or reimburse a category after spending from it (Add Funds to Category directly)
  const handleRepayCategory = (category: CategoryID, amount: number, type: 'reimburse' | 'allocate', notes: string) => {
    if (amount <= 0) return;

    if (type === 'reimburse') {
      handleAddTransaction({
        title: `إيداع وسداد لنفقات (${budgetState[category].title})`,
        amount: amount,
        type: 'income',
        categoryId: category,
        date: new Date().toISOString().split('T')[0],
        notes: notes || 'سداد مباشر لتعويض المصروفات وتصفير العجز تلقائياً.'
      });
      showToast(`تم إيداع وسداد بقيمة ${amount.toLocaleString('en-US')} أ.م للحقيبة النفقية لـ ${budgetState[category].title}!`);
    } else {
      setBudgetState(prev => {
        const cat = prev[category];
        return {
          ...prev,
          [category]: {
            ...cat,
            allocated: cat.allocated + amount
          }
        };
      });
      showToast(`تم تغذية موازنة حقيبة ${budgetState[category].title} بـ ${amount.toLocaleString('en-US')} أ.م إضافي!`);
    }
  };

  // Distribute monthly salary based on percentages (Creates Income transaction & adjusts category allocated budgets dynamically)
  const handleApplySalary = (salaryAmount: number, allocations: { [key in CategoryID]: number }) => {
    // 1. Add salary transaction
    handleAddTransaction({
      title: "إيداع وتوزيع الراتب الشهري الذكي 💰",
      amount: salaryAmount,
      type: "income",
      categoryId: "income",
      date: new Date().toISOString().split("T")[0],
      notes: "إقرار وتوزيع الراتب بنسب مئوية مخصصة تلقائياً على الحقائب المفتوحة."
    });

    // 2. Adjust allocated budgets for each category
    setBudgetState(prev => {
      const updated = { ...prev };
      Object.keys(allocations).forEach((key) => {
        const catId = key as CategoryID;
        updated[catId] = {
          ...updated[catId],
          allocated: allocations[catId]
        };
      });
      return updated;
    });
  };

  // Savings goal handler
  const handleAddGoal = (goal: { title: string; target: number; deadline?: string }) => {
    const newGoal: SavingsGoal = {
      id: 'goal-' + Math.random().toString(36).substr(2, 9),
      title: goal.title,
      target: goal.target,
      currentValue: 0,
      deadline: goal.deadline
    };
    setGoals(prev => [...prev, newGoal]);
  };

  // Fund savings goals (Deducts from savings category balance and marks transaction)
  const handleFundGoal = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        return { ...g, currentValue: g.currentValue + amount };
      }
      return g;
    }));

    const targetGoal = goals.find(g => g.id === id);
    const goalTitle = targetGoal ? targetGoal.title : "الهدف المالي";

    handleAddTransaction({
      title: `تخصيص ادخار لـ (${goalTitle})`,
      amount,
      type: 'expense',
      categoryId: 'savings',
      date: new Date().toISOString().split('T')[0],
      notes: `تحويل تلقائي آمن لتغذية المستهدف المالي.`
    });
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Export data as backup file
  const handleExportData = () => {
    const dataToBackup = {
      budgetState,
      transactions,
      goals
    };
    const blob = new Blob([JSON.stringify(dataToBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dananir_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('تم تصدير نسخة احتياطية بنجاح!');
  };

  // Import data from backup file
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.budgetState && imported.transactions && imported.goals) {
          setBudgetState(imported.budgetState);
          setTransactions(imported.transactions);
          setGoals(imported.goals);
          showToast('تم استعادة البيانات المالية بنجاح!');
        } else {
          showToast('ملف النسخة الاحتياطية غير صالح للمطابقة!');
        }
      } catch (err) {
        showToast('فشل قراءة الملف المالي التابع!');
      }
    };
    reader.readAsText(file);
  };

  const showToast = (message: string) => {
    setBackupSuccess(message);
    setTimeout(() => setBackupSuccess(null), 3500);
  };

  // Filters calculation
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' ? true : t.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' ? true : 
                            categoryFilter === 'income' ? t.categoryId === 'income' : t.categoryId === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  const getCategoryTheme = (id: string) => {
    switch (id) {
      case 'obligations': return { color: '#ef4444', name: 'الالتزامات الأساسية', bg: 'bg-rose-50 text-rose-700 border-rose-100' };
      case 'investment': return { color: '#3b82f6', name: 'الاستثمار الاستراتيجي', bg: 'bg-blue-50 text-blue-700 border-blue-100' };
      case 'savings': return { color: '#10b981', name: 'الادخار للمستقبل', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
      case 'entertainment': return { color: '#f59e0b', name: 'الترفيه ونمط الحياة', bg: 'bg-amber-50 text-amber-700 border-amber-100' };
      default: return { color: '#64748b', name: 'دخل حر عام', bg: 'bg-slate-50 text-slate-700 border-slate-150' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 pb-16 antialiased font-sans">
      
      {/* Dynamic Toast Feedback bar */}
      {backupSuccess && (
        <div className="fixed top-5 left-5 right-5 sm:left-auto sm:right-5 bg-slate-900 border border-slate-700 text-white rounded-xl px-5 py-3.5 shadow-xl flex items-center gap-2 z-50 animate-fadeIn font-bold text-xs">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{backupSuccess}</span>
        </div>
      )}

      {/* TOP HEADER PRESTIGE BAR */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-40 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 bg-gradient-to-tr from-indigo-600 to-indigo-700 hover:scale-105 transition-transform text-white rounded-2xl shadow-md cursor-pointer">
              <Coins className="w-6 h-6 animate-pulse" />
              <div className="absolute -top-1 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
              <div className="absolute -top-1 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight leading-none flex items-center gap-1.5">
                دنانير <span className="text-indigo-600 font-medium text-xs font-mono bg-indigo-50 px-1.5 py-0.5 rounded">Smart</span>
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-none">الإدارة الذكية والآمنة للأموال والمحافظ بالتتبع المباشر</p>
            </div>
          </div>

          {/* Backup data controls */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={handleExportData}
              className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-white shadow-sm"
              title="تصدير ميزانيتك في ملف احتياطي"
            >
              <Download className="w-3.5 h-3.5" />
              تصدير الموازنة
            </button>
            <label className="cursor-pointer px-3.5 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-750 bg-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              <span>استيراد نسخة</span>
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportData} 
                className="hidden" 
              />
            </label>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <div className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded font-mono font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              توقيت النظام: 2026-06-21
            </div>
          </div>

        </div>
      </header>

      {/* MAIN LIQUIDITY CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Balance card */}
          <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">الرصيد المتاح الكلي (السيولة)</span>
            <h2 className="text-3xl sm:text-4xl font-black font-mono mt-2 tracking-tight">
              {currentBalance.toLocaleString('en-US')} <span className="text-xs font-normal">أوقية موريتانية</span>
            </h2>
            <div className="mt-4 pt-4 border-t border-indigo-900 flex items-center justify-between text-xs text-indigo-200">
              <span className="flex items-center gap-1">
                <Wallet className="w-4 h-4 text-emerald-400" />
                حالة الحساب: مستقر آمن
              </span>
              <span className="font-bold underline cursor-pointer" onClick={() => setActiveTab('transactions')}>
                عرض سجل العمليات
              </span>
            </div>
          </div>

          {/* Income widget */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
              <ArrowUpRight className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400">إجمالي النقدية والزيادات المستملة</span>
              <h3 className="text-2xl font-black font-mono text-slate-800 mt-1">
                {totalIncomes.toLocaleString('en-US')} <span className="text-xs font-bold">أ.م</span>
              </h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">تتبع مؤتمت نشط للمكاسب</p>
            </div>
          </div>

          {/* Outflow widget */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
              <ArrowDownRight className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400">إجمالي الصرف الفعلي (النقص)</span>
              <h3 className="text-2xl font-black font-mono text-slate-800 mt-1">
                {totalExpenses.toLocaleString('en-US')} <span className="text-xs font-bold">أ.م</span>
              </h3>
              <p className="text-[10px] text-rose-600 font-semibold mt-1">سحب تلقائي وفق حدود ميزانيتك</p>
            </div>
          </div>

        </div>
      </section>

      {/* DASHBOARD NAVIGATION PANEL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-12 gap-8">
          
          {/* Navigation drawer (column-span-3) */}
          <aside className="col-span-12 lg:col-span-3 space-y-3">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col gap-1.5">
              <h3 className="text-xs font-extrabold text-slate-400 tracking-wider mb-2 pr-2">لوحة الاستكشاف والتتبع</h3>
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4.5 h-4.5" />
                <span>الميزانية والرسوم البيانية</span>
              </button>

              <button
                onClick={() => setActiveTab('transactions')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right cursor-pointer ${
                  activeTab === 'transactions'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-4.5 h-4.5" />
                <span>سجل تتبع المعاملات الحية</span>
                <span className="mr-auto font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full font-bold">
                  {transactions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('goals')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right cursor-pointer ${
                  activeTab === 'goals'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Target className="w-4.5 h-4.5" />
                <span>محفظة الأهداف المالية</span>
                <span className="mr-auto font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full font-bold">
                  {goals.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('advisor')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-right cursor-pointer ${
                  activeTab === 'advisor'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-800'
                }`}
              >
                <BrainCircuit className="w-4.5 h-4.5 text-indigo-500" />
                <span>مستشارك المالي الذكي (AI)</span>
                <span className="mr-auto w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
              </button>
            </div>

            {/* Smart info widget */}
            <div className="bg-gradient-to-tr from-indigo-50 to-purple-50 border border-indigo-100/50 rounded-2xl p-5 shadow-sm">
              <h4 className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                <BrainCircuit className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                تقسيم الميزانية الاحترافية ⚖️
              </h4>
              <p className="text-[11px] text-indigo-850 mt-2 leading-relaxed">
                يقسم نظام دنانير ميزانيتك وفقاً لعلم المال إلى ٤ أقسام رئيسية توازنية: <span className="font-bold text-emerald-700">الادخار</span>، <span className="font-bold text-blue-700">الاستثمار</span>، <span className="font-bold text-rose-700">الالتزامات</span>، و<span className="font-bold text-amber-700">الترفيه</span>.
              </p>
              <div className="mt-3.5 text-[10px] text-indigo-500 font-bold">
                تذكر: "الاستثمار" هو طريق مستقبلك المالي!
              </div>
            </div>
          </aside>

          {/* Tab contents (column-span-9) */}
          <section className="col-span-12 lg:col-span-9 space-y-6">
            
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Real-time salary insertion and percentage distributor */}
                <SalaryDistributor 
                  budgetState={budgetState} 
                  onApplySalary={handleApplySalary} 
                  showToast={showToast} 
                />

                {/* 4 Budget cards summary with adjustable targets and direct funding/repayment */}
                <BudgetSummary 
                  budgetState={budgetState} 
                  onAdjustBudget={handleAdjustBudget} 
                  onRepayCategory={handleRepayCategory}
                />

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  {/* SVG charts distribution */}
                  <div className="xl:col-span-7">
                    <BudgetCharts budgetState={budgetState} />
                  </div>
                  {/* Ledger Form widget */}
                  <div className="xl:col-span-5">
                    <TransactionForm 
                      budgetState={budgetState} 
                      onAddTransaction={handleAddTransaction} 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">دفتر القيود والتتبع المالي</h3>
                    <p className="text-xs text-slate-500 mt-0.5">تفاصيل جميع التدفقات والمصاريف مع ميزة تراجع الإلغاء الفوري</p>
                  </div>
                </div>

                {/* Ledger filters control */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl">
                  
                  {/* Search bar */}
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="ابحث باسم العملية أو الملاحظات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pr-9 pl-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Filter type dropdown */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200 shrink-0">
                      <button
                        onClick={() => setTypeFilter('all')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          typeFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        الكل
                      </button>
                      <button
                        onClick={() => setTypeFilter('income')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          typeFilter === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        الدخول
                      </button>
                      <button
                        onClick={() => setTypeFilter('expense')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          typeFilter === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        المصاريف
                      </button>
                    </div>

                    {/* Category Filter */}
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value as any)}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold focus:outline-none text-slate-700"
                    >
                      <option value="all">جميع الأقسام</option>
                      <option value="obligations">🛡️ الالتزامات</option>
                      <option value="investment">📈 الاستثمار</option>
                      <option value="savings">🐷 الادخار</option>
                      <option value="entertainment">✨ الترفيه</option>
                      <option value="income">💳 دخل عام حر</option>
                    </select>
                  </div>

                </div>

                {/* Ledger Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <th className="px-4 py-3">بيان العلمية والاسم</th>
                        <th className="px-4 py-3">النوع والمبلغ</th>
                        <th className="px-4 py-3">القسم المالي</th>
                        <th className="px-4 py-3">التاريخ</th>
                        <th className="px-4 py-3">الملاحظات</th>
                        <th className="px-4 py-3 text-left">التحكم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredTransactions.map((tx) => {
                        const themeObj = getCategoryTheme(tx.categoryId);
                        const isIncome = tx.type === 'income';

                        return (
                          <tr key={tx.id} className="hover:bg-slate-55/40 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-slate-800">
                              <span className="flex items-center gap-1.5">
                                {tx.title}
                                {tx.autoTracked && (
                                  <span className="bg-emerald-50 text-[10px] text-emerald-700 px-1 py-0.5 rounded border border-emerald-100">تلقائي</span>
                                )}
                              </span>
                            </td>
                            <td className={`px-4 py-3.5 font-mono font-black text-sm ${isIncome ? 'text-emerald-600' : 'text-slate-800'}`}>
                              {isIncome ? '+' : '-'} {tx.amount.toLocaleString('en-US')} أ.م
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold border ${themeObj.bg}`}>
                                {themeObj.name}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-slate-500 font-medium font-mono">{tx.date}</td>
                            <td className="px-4 py-3.5 text-slate-400 font-medium max-w-xs truncate" title={tx.notes}>
                              {tx.notes || '-'}
                            </td>
                            <td className="px-4 py-3.5 text-left">
                              <button
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="p-1 px-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                                title="حذف العملية من السجلات"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredTransactions.length === 0 && (
                    <div className="py-12 text-center text-slate-400 space-y-1 bg-slate-50/20">
                      <span className="text-3xl">📭</span>
                      <p className="font-bold text-sm text-slate-600">لم يتم العثور على أي عمليات مطابقة للفلاتر</p>
                      <p className="text-[11px] text-slate-400">تأكد من كتابة مسمى بحث دقيق أو تعديل قسم التصفية.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'goals' && (
              <SavingsGoals 
                goals={goals} 
                onAddGoal={handleAddGoal} 
                onFundGoal={handleFundGoal} 
                onDeleteGoal={handleDeleteGoal} 
              />
            )}

            {activeTab === 'advisor' && (
              <SmartAdvisor 
                budgetState={budgetState} 
                transactions={transactions} 
                currentBalance={currentBalance} 
                goals={goals} 
              />
            )}

          </section>

        </div>
      </main>
      
    </div>
  );
}
