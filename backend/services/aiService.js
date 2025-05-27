import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.API_KEY,
    defaultHeaders: {
    },
  });


export default async function analyzeSpendingWithDeepSeek(currentMonth, previousMonth) {
  const completion = await openai.chat.completions.create({
  model: 'deepseek/deepseek-chat-v3-0324:free',
  messages: [
    {
      role: "system",
      content: `You are a smart financial assistant that analyzes user spending data.

        The user will provide two datasets: "currentMonth" and "previousMonth".

        You must analyze the differences and return structured JSON in this format:
        {
        "monthComparison": {
            "mostIncreasedCategory": "Dining",
            "mostDecreasedCategory": "Transport"
        },
        "topSpendingCategories": [ { "category": "Food", "amount": 210 } ],
        "potentialSavings": [ "Cut dining out by 15% to save $30" ],
        "unusualExpenses": [ "Electronics purchase of $250" ],
        "budgetSuggestions": [ "Try a weekly grocery budget cap" ]
        }
        Also For large data you can include more then two response in array and give more accurate result
        and also please the response should use rs sign only because the input expense will be in rupees    
        Only respond with strict JSON. Do not include markdown or backticks. Do not ask follow-up questions.`
    },
    {
      role: "user",
      content: JSON.stringify({
        currentMonth,
        previousMonth
      })
    }
  ]
});
console.log(completion.choices[0].message.content);
return completion.choices[0].message.content;
}
