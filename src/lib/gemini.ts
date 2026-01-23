import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp", // Targeting fast/efficient model (fallback to 1.5-flash if needed)
});

// Interface for Meal Plan Input
interface MealPlanInput {
  ageMonths: number;
  weight: number;
  allergies?: string[];
  zScoreStatus?: string; // e.g. "Underweight", "Normal"
}

export async function generateWeeklyMealPlan(input: MealPlanInput) {
  const { ageMonths, weight, allergies, zScoreStatus } = input;

  const prompt = `
    Act as a pediatric nutritionist. Create a 7-day meal plan for a child with the following profile:
    - Age: ${ageMonths} months
    - Current Weight: ${weight} kg
    - Growth Status: ${zScoreStatus || "Normal"}
    - Allergies: ${allergies?.length ? allergies.join(", ") : "None"}

    The meal plan must be nutritious, balanced, and locally available in Indonesia (e.g., uses Rice, Tofu, Tempeh, Fish, Chicken, Spinach).
    If the child is Underweight, prioritize high-calorie and protein-dense foods.
    If Overweight, ensure balanced portions.

    Strictly return the output in valid JSON format with the following structure:
    {
      "weeklyPlan": [
        {
          "day": "Monday",
          "meals": {
            "breakfast": { "name": "...", "calories": 0, "nutrients": "...", "ingredients": ["item1", "item2"] },
            "lunch": { "name": "...", "calories": 0, "nutrients": "...", "ingredients": ["item1", "item2"] },
            "dinner": { "name": "...", "calories": 0, "nutrients": "...", "ingredients": ["item1", "item2"] },
            "snack": { "name": "...", "calories": 0, "nutrients": "...", "ingredients": ["item1", "item2"] }
          }
        },
        ... (repeat for 7 days)
      ]
    }
    Do not add any markdown formatting (like \`\`\`json). Just return raw JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean potential markdown code blocks if Gemini adds them despite instructions
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new Error("Failed to generate meal plan. Please try again.");
  }
}
