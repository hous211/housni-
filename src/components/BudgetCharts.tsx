import React, { useState } from 'react';
import { BudgetState, CategoryID } from '../types';
import { ChartPie, BarChart3, HelpCircle, AlertCircle, Info } from 'lucide-react';

interface BudgetChartsProps {
  budgetState: BudgetState;
}

export default function BudgetCharts({ budgetState }: BudgetChartsProps) {
  const categories = Object.values(budgetState);
  const totalAllocated = categories.reduce((acc, curr) => acc + curr.allocated, 0);
  const totalSpent = categories.reduce((acc, curr) => acc + curr.spent, 0);
  
  const [activeTab, setActiveTab] = useState<'distribution' | 'comparison'>('distribution');
  const [hoveredCategory, setHoveredCategory] = useState<CategoryID | null>(null);

  // Math for SVG Donut
  let cumulativePercent = 0;
  const donutData = categories.map((cat) => {
    const percentage = totalAllocated > 0 ? (cat.allocated / totalAllocated) * 100 : 0;
    const item = {
      ...cat,
      percentage,
      startPercent: cumulativePercent
    };
    cumulativePercent += percentage;
    return item;
  });

  // Convert percentage to SVG DashArray
  const radius = 60;
  const circumference = 2 * Math.PI * radius; // ~376.99

  return (
    <div id="financial-charts-container" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4 mb-6">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            الرسوم البيانية الهيكلية للسيولة
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            رسم تحليلي يوضح توازن الحقائب واستثمار الأموال بالمقارنة مع حدود ميزانيتك
          </p>
        </div>
        
        {/* Toggle between distribution & comparison */}
        <div className="flex bg-slate-50 rounded-xl p-1 gap-1 self-start">
          <button
            onClick={() => setActiveTab('distribution')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'distribution' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            نِسب التوزيع
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'comparison' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المخطط المقارن
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {activeTab === 'distribution' ? (
          <>
            {/* Pie Chart SVG Column */}
            <div className="lg:col-span-6 flex justify-center py-4 relative">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <circle 
                    cx="80" 
                    cy="80" 
                    r={radius} 
                    fill="transparent" 
                    stroke="#f1f5f9" 
                    strokeWidth="16" 
                  />
                  {/* Category Slices */}
                  {donutData.map((slice) => {
                    const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = `${- (slice.startPercent / 100) * circumference}`;
                    const isHovered = hoveredCategory === slice.id;

                    return (
                      <circle
                        key={slice.id}
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={isHovered ? "22" : "16"}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredCategory(slice.id)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      />
                    );
                  })}
                </svg>
                {/* Center text of the donut */}
                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-xs text-slate-400 font-medium">إجمالي التوزيع المعتمد</span>
                  <span className="text-xl font-bold font-mono text-slate-800 mt-1">
                    {totalAllocated.toLocaleString('en-US')} أ.م
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium mt-0.5">
                    مستغل: {((totalSpent / totalAllocated) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Legend Column with allocation notes */}
            <div className="lg:col-span-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">توزيع الحقائب الاستراتيجية</h4>
              <div className="space-y-3">
                {donutData.map((cat) => {
                  const isHovered = hoveredCategory === cat.id;
                  return (
                    <div 
                      key={cat.id}
                      className={`p-3 rounded-xl border transition-all duration-200 ${
                        isHovered ? 'bg-slate-50/80 border-slate-200 scale-102' : 'bg-white border-transparent'
                      }`}
                      onMouseEnter={() => setHoveredCategory(cat.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="font-bold text-slate-800 text-sm">{cat.title}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {cat.allocated.toLocaleString('en-US')} أ.م ({cat.percentage.toFixed(0)}%)
                        </span>
                      </div>
                      
                      {/* Allocation healthy ratio note */}
                      <p className="text-xs text-slate-500 mt-1 mr-6">
                        {cat.id === 'obligations' && 'الحد الأقصى الموصى به علمياً هو 50% لضمان الاستقرار.'}
                        {cat.id === 'investment' && 'رصيد لزيادة الدخل السلبي والنمو على المدى البعيد.'}
                        {cat.id === 'savings' && 'يخدم بناء حماية ضد الطوارئ وظروف الحياة المفاجئة.'}
                        {cat.id === 'entertainment' && 'صمام أمان للاستمتاع بالحياة ولكن بحدود صارمة.'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="lg:col-span-12 space-y-6">
            {/* Comparison view */}
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">مقارنة المخصص مقابل المصروف الفعلي</h4>
            
            <div className="space-y-5">
              {categories.map((cat) => {
                const maxVal = Math.max(...categories.map(c => Math.max(c.allocated, c.spent)));
                const allocatedWidth = maxVal > 0 ? (cat.allocated / maxVal) * 100 : 0;
                const spentWidth = maxVal > 0 ? (cat.spent / maxVal) * 100 : 0;
                const isOver = cat.spent > cat.allocated;

                return (
                  <div key={cat.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{cat.title}</span>
                      <span className="font-mono text-slate-600">
                        الفعلي <span className={`font-bold ${isOver ? 'text-rose-600' : 'text-slate-800'}`}>{cat.spent.toLocaleString('en-US')} أ.م</span> مشترك مع مخصص <span className="font-bold text-slate-800">{cat.allocated.toLocaleString('en-US')} أ.م</span>
                      </span>
                    </div>
                    
                    {/* Double Bar chart */}
                    <div className="space-y-1.5">
                      {/* Allocated bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 w-16 text-left">المخطط له:</span>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500 bg-slate-400"
                            style={{ width: `${allocatedWidth}%` }}
                          />
                        </div>
                      </div>
                      {/* Spent bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 w-16 text-left">المنفق فعلياً:</span>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${spentWidth}%`, 
                              backgroundColor: isOver ? '#ef4444' : cat.color 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* General Health check card */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-bold text-slate-800">تحليل التوازن المالي التلقائي ⚖️</h5>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {totalSpent > totalAllocated ? (
                    <span className="text-rose-600 font-medium">تبدو نفقاتك الكلية زائدة عن المخطط للشهر الحالي بمقدار {(totalSpent - totalAllocated).toLocaleString('en-US')} أ.م. يوصى بإعادة معايرة ميزانية الترفيه فوراً لسد هذا الفارق قبل نهاية الدورة المالية.</span>
                  ) : (
                    <span className="text-emerald-600 font-medium">ممتاز! الصرف الإجمالي الملتزم به أقل من المتوقع، متيحاً لك وفرة مالية بمقدار {(totalAllocated - totalSpent).toLocaleString('en-US')} أ.م يمكن تحويلها للاستثمار لزيادة عوائدك المستقبلية.</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
