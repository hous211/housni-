import { BudgetState, Transaction, SavingsGoal, CategoryID } from '../types';

export const INITIAL_BUDGET: BudgetState = {
  obligations: {
    id: 'obligations',
    title: 'الالتزامات الأساسية',
    description: 'الإيجار، الفواتير، الديون، وأقساط الضروريات (قاعدة 50%)',
    allocated: 5000,
    spent: 3150,
    color: '#ef4444', // Red
    icon: 'ShieldCheck'
  },
  investment: {
    id: 'investment',
    title: 'الاستثمار الاستراتيجي',
    description: 'الأسهم، الصناديق الاستثمارية، وتنمية المحفظة',
    allocated: 2000,
    spent: 800,
    color: '#3b82f6', // Blue
    icon: 'TrendingUp'
  },
  savings: {
    id: 'savings',
    title: 'الادخار للمستقبل',
    description: 'صندوق الطوارئ، السفر، وأي مبالغ مركونة',
    allocated: 1500,
    spent: 500,
    color: '#10b981', // Green
    icon: 'PiggyBank'
  },
  entertainment: {
    id: 'entertainment',
    title: 'الترفيه ونمط الحياة',
    description: 'المطاعم، المقاهي، السفر الترفيهي، والتسوق غير الضروري',
    allocated: 1500,
    spent: 1240,
    color: '#f59e0b', // Amber
    icon: 'Sparkles'
  }
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    title: 'راتب الشهر الأساسي',
    amount: 10000,
    type: 'income',
    categoryId: 'income',
    date: '2026-06-01',
    notes: 'تم استلام الراتب الأساسي وإيداعه بالمحفظة'
  },
  {
    id: 'tx-2',
    title: 'إيجار السكن الشهري',
    amount: 2500,
    type: 'expense',
    categoryId: 'obligations',
    date: '2026-06-02',
    notes: 'الالتزام الشهري للمسكن'
  },
  {
    id: 'tx-3',
    title: 'استثمار في صناديق استثمارية',
    amount: 500,
    type: 'expense',
    categoryId: 'investment',
    date: '2526-06-05',
    notes: 'شراء وثائق صندوق أسهم محلية للنمو'
  },
  {
    id: 'tx-4',
    title: 'فاتورة الكهرباء والماء',
    amount: 450,
    type: 'expense',
    categoryId: 'obligations',
    date: '2026-06-08',
    notes: 'فاتورة الصيف والمياه'
  },
  {
    id: 'tx-5',
    title: 'عشاء مع الأصدقاء',
    amount: 220,
    type: 'expense',
    categoryId: 'entertainment',
    date: '2026-06-10',
    notes: 'مطعم مأكولات بحرية'
  },
  {
    id: 'tx-6',
    title: 'شراء ملابس جديدة',
    amount: 500,
    type: 'expense',
    categoryId: 'entertainment',
    date: '2026-06-12',
    notes: 'تسوق لشهر الصيف'
  },
  {
    id: 'tx-7',
    title: 'أرباح أسهم موزعة',
    amount: 300,
    type: 'income',
    categoryId: 'investment',
    date: '2026-06-14',
    notes: 'تصدير تلقائي: تم إعادة استثمارها فورياً',
    autoTracked: true
  },
  {
    id: 'tx-8',
    title: 'صندوق الطوارئ العائلي',
    amount: 500,
    type: 'expense',
    categoryId: 'savings',
    date: '2026-06-15',
    notes: 'اقتطاع شهري للادخار الآمن'
  },
  {
    id: 'tx-9',
    title: 'فاتورة اشتراك الإنترنت الجوال',
    amount: 200,
    type: 'expense',
    categoryId: 'obligations',
    date: '2026-06-16',
    notes: 'الباقة اللامحدودة'
  },
  {
    id: 'tx-10',
    title: 'شراء قهوة وحلويات',
    amount: 120,
    type: 'expense',
    categoryId: 'entertainment',
    date: '2026-06-18',
    notes: 'مشتريات مقهى متكررة'
  },
  {
    id: 'tx-11',
    title: 'مكافأة عمل إضافي',
    amount: 1500,
    type: 'income',
    categoryId: 'income',
    date: '2026-06-19',
    notes: 'إنجاز المشروع الإضافي'
  },
  {
    id: 'tx-12',
    title: 'اشتراك منصة ترفيهية',
    amount: 50,
    type: 'expense',
    categoryId: 'entertainment',
    date: '2026-06-20',
    notes: 'فاتورة نتفليكس/سبوتيفاي'
  },
  {
    id: 'tx-13',
    title: 'شراء أسهم شركة عملاقة',
    amount: 300,
    type: 'expense',
    categoryId: 'investment',
    date: '2026-06-20',
    notes: 'شراء مباشر من المحفظة'
  }
];

export const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    title: 'صندوق الطوارئ الأمن (6 أشهر)',
    target: 15000,
    currentValue: 6500,
    deadline: '2026-12-31'
  },
  {
    id: 'goal-2',
    title: 'الدفعة الأولى لسيارة الأحلام',
    target: 40000,
    currentValue: 12800,
    deadline: '2027-06-30'
  },
  {
    id: 'goal-3',
    title: 'رحلة استجمام عائلية في الشتاء',
    target: 8000,
    currentValue: 4500,
    deadline: '2026-11-15'
  }
];

// Helper functions for LocalStorage management
export const loadFinancialState = () => {
  try {
    const savedState = localStorage.getItem('dananir_budget_state');
    const savedTransactions = localStorage.getItem('dananir_transactions');
    const savedGoals = localStorage.getItem('dananir_saving_goals');
    
    return {
      budgetState: savedState ? JSON.parse(savedState) as BudgetState : INITIAL_BUDGET,
      transactions: savedTransactions ? JSON.parse(savedTransactions) as Transaction[] : INITIAL_TRANSACTIONS,
      goals: savedGoals ? JSON.parse(savedGoals) as SavingsGoal[] : INITIAL_GOALS
    };
  } catch (error) {
    console.error("Error loading localStorage state:", error);
    return {
      budgetState: INITIAL_BUDGET,
      transactions: INITIAL_TRANSACTIONS,
      goals: INITIAL_GOALS
    };
  }
};

export const saveFinancialState = (
  budgetState: BudgetState,
  transactions: Transaction[],
  goals: SavingsGoal[]
) => {
  try {
    localStorage.setItem('dananir_budget_state', JSON.stringify(budgetState));
    localStorage.setItem('dananir_transactions', JSON.stringify(transactions));
    localStorage.setItem('dananir_saving_goals', JSON.stringify(goals));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};
