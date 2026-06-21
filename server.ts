import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini via the recommended @google/genai SDK
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI analysis route - analyzes the financial data and suggests smart insights
app.post("/api/ai/analyze", async (req, res) => {
  try {
    const { budgetData, transactions, userMessage, currentBalance, savingsGoal } = req.body;
    
    // Construct rich prompt focused on professional financial advisory in Arabic
    const prompt = `أنت خبير مالي ذكي ومستشار استثمار وإدارة أموال شخصية محترف جداً ومقنع.
مهمتك هي مراجعة البيانات المالية الحالية للمستخدم وتقديم تحليلات ذكية وثاقبة مخصصة باللغة العربية بأسلوب احترافي، محفّز ومبسط بلمسة إنسانية راقية.

البيانات المالية الحالية للمستخدم:
- الرصيد الإجمالي الحالي: ${currentBalance} أوقية موريتانية (أ.م)
- هدف الادخار: ${savingsGoal ? `${savingsGoal.title} (المبلغ المستهدف: ${savingsGoal.target}، المجمع حالياً: ${savingsGoal.currentValue})` : 'لا يوجد هدف محدد'}

- تفاصيل الميزانية الموزعة:
  * قسم الاستثمار (مخصص: ${budgetData.investment.allocated}، مستخدم حتى الآن: ${budgetData.investment.spent})
  * قسم الالتزامات (مخصص: ${budgetData.obligations.allocated}، مستخدم حتى الآن: ${budgetData.obligations.spent})
  * قسم الترفيه (مخصص: ${budgetData.entertainment.allocated}، مستخدم حتى الآن: ${budgetData.entertainment.spent})
  * قسم الادخار (مخصص: ${budgetData.savings.allocated}، مستخدم حتى الآن: ${budgetData.savings.spent})

- قائمة المعاملات الأخيرة:
  ${JSON.stringify(transactions.slice(-8))}

سؤال أو رسالة المستخدم المحددة: "${userMessage || "أعطني تحليلاً مالياً شاملاً لوضعي الحالي ونصائح لموازنة أقسامي والإنفاق بذكاء"}"

فضلاً، قم بالعمل بالخطوات التالية وقسم إجابتك بعناية:
1. 💡 **تحليل وتقييم سريع**: قيّم نسب توزيع الميزانية الحالية مدى التزام المستخدم بها. هل الإنفاق في الترفيه تخطى الحدود؟ هل قسم الاستثمار يحتاج لتعزيز؟
2. 🚨 **تنبيهات وفروقات تلقائية**: رصد أي تجاوزات أو زيادة في النفقات (نقص في الرصيد) أو تحسينات يمكن تحقيقها وتنبيه المستخدم إليها بذكاء.
3. 🎯 **توصيات مالية ذكية (3 نصائح محددة)**: قدم 3 نصائح عملية ومبتكرة جداً مخصصة للوضع الحالي لمساعدته على الادخار والاستثمار بنجاح (مثلاً تحويل جزء من ميزانية الترفيه الزائدة للاستثمار، أو تسريع تحقيق هدف الادخار).
4. 💬 **الإجابة على استفسار المستخدم**: أجب عن سؤال المستخدم بوضوح تام وخبرة مالية وعلمية عالية.

أجب باللغة العربية الفصحى الجميلة والمنسقة (باستخدام لغة Markdown بنقاط وخط عريض لتسهيل القراءة). تجنب الإسهاب والحشو وركز على الفائدة المباشرة والعملية الصادقة.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء الاتصال بالنظام الذكي" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
