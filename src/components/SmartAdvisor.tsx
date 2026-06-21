import React, { useState, useEffect, useRef } from 'react';
import { BudgetState, Transaction, SavingsGoal } from '../types';
import { Sparkles, Send, BrainCircuit, AlertCircle, RefreshCw, HelpCircle, ArrowRightLeft } from 'lucide-react';

interface SmartAdvisorProps {
  budgetState: BudgetState;
  transactions: Transaction[];
  currentBalance: number;
  goals: SavingsGoal[];
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

// Custom simple parser to render Markdown beautifully in standard JSX (Arabic compatible)
const renderParsedMarkdown = (text: string) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  return (
    <div className="space-y-2.5 text-slate-800 leading-relaxed text-sm">
      {lines.map((line, idx) => {
        let trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        // Handle Headers (e.g. ###, ##)
        if (trimmed.startsWith('###')) {
          return (
            <h5 key={idx} className="font-bold text-slate-900 text-sm mt-3 flex items-center gap-1.5 border-b border-indigo-50 pb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              {trimmed.replace(/^###\s*/, '')}
            </h5>
          );
        }
        if (trimmed.startsWith('##') || trimmed.startsWith('#')) {
          return (
            <h4 key={idx} className="font-bold text-indigo-900 text-base mt-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-md bg-indigo-600 animate-pulse" />
              {trimmed.replace(/^##?\s*/, '')}
            </h4>
          );
        }

        // Handle Bold lines
        let itemCont = trimmed;
        const boldRegex = /\*\*(.*?)\*\*/g;
        const matches = Array.from(itemCont.matchAll(boldRegex));
        
        // Handle Bullets (e.g. * or - or 1.)
        const isBullet = trimmed.startsWith('*') || trimmed.startsWith('-') || /^\d+\./.test(trimmed);
        if (isBullet) {
          itemCont = trimmed.replace(/^[\*\-\d\.\s]+/, '');
        }

        let renderedContent: React.ReactNode = itemCont;
        if (matches.length > 0) {
          // simple replacement of bold items
          const parts = itemCont.split(/\*\*.*?\*\*/);
          renderedContent = (
            <span>
              {parts.map((part, pIdx) => (
                <span key={pIdx}>
                  {part}
                  {matches[pIdx] && (
                    <strong className="font-bold text-slate-900 bg-indigo-50/50 px-1 py-0.5 rounded">
                      {matches[pIdx][1]}
                    </strong>
                  )}
                </span>
              ))}
            </span>
          );
        }

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 mr-4 text-slate-700">
              <span className="text-indigo-500 font-bold shrink-0 mt-1">•</span>
              <div className="flex-1">{renderedContent}</div>
            </div>
          );
        }

        return <p key={idx} className="leading-relaxed">{renderedContent}</p>;
      })}
    </div>
  );
};

export default function SmartAdvisor({ budgetState, transactions, currentBalance, goals }: SmartAdvisorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `مرحباً بك في النظام الاستشاري المالي الذكي (دنانير AI) 🤖💼.

لقد قمت بتحميل ميزانيتك الموزعة وتتبع أصولك تلقائياً. كيف يمكنني مساعدتك اليوم؟
يمكنك كتابة سؤالك مباشرة، أو استخدام أحد الأسئلة المقترحة بالأسفل لتحليل وضعك الحالي والحصول على توصيات تفصيلية.`,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const activeGoal = goals.length > 0 ? goals[0] : null;

  const triggerAIAnalysis = async (customPrompt?: string) => {
    const promptToSend = customPrompt || userInput;
    if (!promptToSend.trim() && !customPrompt) return;

    // Add user message to UI
    const newUserMessage: Message = {
      sender: 'user',
      text: promptToSend,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);
    setErrorStatus(null);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budgetData: budgetState,
          transactions,
          currentBalance,
          savingsGoal: activeGoal,
          userMessage: promptToSend
        })
      });

      if (!response.ok) {
        throw new Error('حدث عطل بالشبكة أو غير مسموح بالوصول للمخدم');
      }

      const data = await response.json();
      
      const aiResponse: Message = {
        sender: 'ai',
        text: data.text || 'عذراً، لم أستطع استخراج رد ملائم من الخبير المالي.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (err: any) {
      console.error(err);
      setErrorStatus("فشل الاتصال بالنظام المالي الذكي. تأكد من إعداد مفتاح API Key الخاص بـ Gemini في إعدادات المنصة.");
    } finally {
      setIsLoading(false);
    }
  };

  const prepopulatedPrompts = [
    { title: '📊 تحليل الميزانية بالكامل', query: 'أعطني تحليلاً مالياً شاملاً لوضعي الحالي وتوزيع ميزانيتي ونسبة التزاماتي' },
    { title: '🍿 تقليص نفقات الترفيه بذكاء', query: 'نصائح ذكية وممتعة لتقليص نفقات الترفيه والتسوق وصرف الفائض في الاستثمار والادخار' },
    { title: '📈 خطة استثمار ممتازة', query: 'أريد خطة لزيادة قسم الاستثمار الاستراتيجي من الصفر ومضاعفة توزيعاتي' }
  ];

  return (
    <div id="ai-smart-advisor" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col h-[650px]">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
            <BrainCircuit className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
              مستشارك المالي الذكي (دنانير AI)
              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-[10px] text-indigo-700 font-bold">نموذج 3.5</span>
            </h3>
            <p className="text-[11px] text-slate-500">مراجعة معززة بالذكاء الاصطناعي لبيانات محفظتك الحية</p>
          </div>
        </div>
        
        {/* Reset conversation */}
        <button
          onClick={() => {
            setMessages([
              {
                sender: 'ai',
                text: `تم إعادة تهيئة الجلسة بنجاح 🌐. كيف يمكنني إرشادك الآن؟`,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              }
            ]);
            setErrorStatus(null);
          }}
          className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          title="مسح وتجديد المحادثة"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Chat prompts */}
      <div className="flex flex-wrap gap-2 mb-4 shrink-0">
        {prepopulatedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => triggerAIAnalysis(p.query)}
            disabled={isLoading}
            className="text-[11px] px-3 py-1.5 bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:text-indigo-700 disabled:opacity-50 text-slate-700 rounded-lg font-bold transition-all text-right"
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Messages Thread list */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4 border border-slate-50 bg-slate-50/30 rounded-2xl p-4">
        {messages.map((msg, idx) => {
          const isAI = msg.sender === 'ai';
          return (
            <div 
              key={idx} 
              className={`flex flex-col max-w-[85%] ${isAI ? 'self-start mr-0 ml-auto' : 'self-end ml-0 mr-auto'}`}
            >
              {/* Sender info */}
              <div className={`flex items-center gap-1 mb-1 text-[10px] font-bold text-slate-400 ${!isAI ? 'justify-end' : ''}`}>
                <span>{isAI ? 'مستشار دنانير AI' : 'أنت'}</span>
                <span>• {msg.time}</span>
              </div>
              
              {/* Message body */}
              <div className={`p-4 rounded-2xl text-slate-800 ${
                isAI 
                  ? 'bg-white border border-slate-100 shadow-sm rounded-tr-none' 
                  : 'bg-indigo-600 text-white rounded-tl-none font-medium'
              }`}>
                {isAI ? renderParsedMarkdown(msg.text) : <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
              </div>
            </div>
          );
        })}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex flex-col max-w-[85%] self-start pb-4">
            <div className="flex items-center gap-1 mb-1 text-[10px] font-bold text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              <span>جاري التحليل واستخراج الأفكار المالية الذكية...</span>
            </div>
            <div className="p-4 bg-white border border-slate-100 rounded-2xl rounded-tr-none shadow-sm space-y-2.5 w-72">
              <div className="h-3.5 bg-slate-100 rounded w-full animate-pulse" />
              <div className="h-3.5 bg-slate-100 rounded w-5/6 animate-pulse" />
              <div className="h-3.5 bg-slate-100 rounded w-4/5 animate-pulse" />
            </div>
          </div>
        )}

        {/* Error notification block */}
        {errorStatus && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>فشل في جلب البيانات الاستشارية</span>
            </div>
            <p className="leading-relaxed">{errorStatus}</p>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>

      {/* Input box form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); triggerAIAnalysis(); }}
        className="flex items-center gap-2 shrink-0 border-t border-slate-100 pt-3"
      >
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="مثال: كيف أستثمر فائض مدخراتي البالغ 1000 أوقية؟"
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl text-sm transition-all text-slate-800 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={isLoading || !userInput.trim()}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
