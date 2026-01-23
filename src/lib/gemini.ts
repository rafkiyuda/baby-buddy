import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/db";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

// Interface for Meal Plan Input
interface MealPlanInput {
  ageMonths: number;
  weight: number;
  allergies?: string[];
  zScoreStatus?: string;
  durationDays: number;
  budget?: number;
  location?: string;
}

export async function generateWeeklyMealPlan(input: MealPlanInput) {
  const { ageMonths, weight, allergies, zScoreStatus, durationDays, budget, location } = input;

  // 1. Fetch suitable packages from Database
  // Base filter: Age suitability & Active status
  const whereClause: any = {
    isActive: true,
    ageMinMonths: { lte: ageMonths },
    ageMaxMonths: { gte: ageMonths },
  };

  // Location filter: Match specific location OR "All Indonesia"
  if (location) {
    whereClause.OR = [
      { location: { equals: location, mode: 'insensitive' } },
      { location: "All Indonesia" }
    ];
  }

  // Budget filter: If budget is provided, only fetch items within budget (plus a small buffer)
  if (budget) {
    whereClause.price = { lte: budget * 1.1 }; // Allow 10% buffer
  }

  const suitablePackages = await prisma.mealsPackage.findMany({
    where: whereClause,
    orderBy: { price: 'asc' }, // Order by price for budget optimization
    take: 20 // Limit to top 20 relevant packages
  });

  // If budget constraint is strict, we might want to prioritize packages that fit well within budget
  // For AI context, we pass the products and let AI decide the best combination

  const prompt = `
    Kamu adalah ahli gizi anak profesional. Buatkan rencana makan untuk ${durationDays} hari untuk anak dengan profil:
    - Usia: ${ageMonths} bulan
    - Berat Badan: ${weight} kg
    - Status Pertumbuhan: ${zScoreStatus || "Normal"}
    - Alergi: ${allergies?.length ? allergies.join(", ") : "Tidak ada"}
    ${budget ? `- Budget Maksimal: Rp ${budget.toLocaleString('id-ID')}` : ""}
    ${location ? `- Lokasi: ${location}` : ""}

    PENTING: Rekomendasikan juga paket produk MPASI dari marketplace kami yang cocok.
    ${budget ? "Pastikan rekomendasi paket TIDAK melebihi budget yang diberikan." : ""}
    
    Produk yang tersedia (Database):
    ${suitablePackages.length > 0
      ? suitablePackages.map(p => `- ${p.name} (Rp ${p.price.toLocaleString('id-ID')}) [${p.location}] - Kategori: ${p.category} - Manfaat: ${p.nutritionalBenefits.join(', ')}`).join('\n')
      : "Tidak ada paket yang spesifik untuk kriteria ini, berikan rekomendasi umum saja."}

    Jika anak Underweight, prioritaskan makanan tinggi kalori dan protein.
    Jika Overweight, pastikan porsi seimbang.

    Kembalikan output dalam format JSON VALID dengan struktur berikut:
    {
      "summary": {
        "totalDays": ${durationDays},
        "dailyCaloriesTarget": 0,
        "focusNutrients": ["protein", "iron", "..."],
        "budgetAnalysis": ${budget ? `"Analisis apakah rekomendasi sesuai budget"` : "null"}
      },
      "recommendedPackages": [
        {
          "packageName": "Paket Harian/Mingguan",
          "description": "Deskripsi singkat paket",
          "products": [
            { "productName": "Nama Produk dari list diatas", "productId": "Gunakan ID yang valid jika ada, atau null", "quantity": 1, "price": 0 }
          ],
          "totalPrice": 0,
          "nutritionalBenefits": ["manfaat1", "manfaat2"],
          "suitableFor": "Deskripsi kecocokan"
        }
      ],
      "weeklyPlan": [
        {
          "day": "Hari 1",
          "dayNumber": 1,
          "meals": {
            "breakfast": { "name": "...", "calories": 0, "nutrients": "...", "ingredients": ["item1"], "marketplaceProduct": "Nama produk jika ada yang cocok atau null" },
            "lunch": { "name": "...", "calories": 0, "nutrients": "...", "ingredients": ["item1"], "marketplaceProduct": null },
            "dinner": { "name": "...", "calories": 0, "nutrients": "...", "ingredients": ["item1"], "marketplaceProduct": null },
            "snack": { "name": "...", "calories": 0, "nutrients": "...", "ingredients": ["item1"], "marketplaceProduct": "Nama produk snack jika ada" }
          }
        }
      ],
      "shoppingList": {
        "fromMarketplace": [
          { "productName": "...", "productId": "...", "quantity": 0, "totalPrice": 0 }
        ],
        "additionalIngredients": ["bahan1", "bahan2"]
      }
    }

    Buat rencana untuk ${durationDays} hari penuh. Jangan tambahkan formatting markdown apapun. Hanya JSON mentah.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean potential markdown code blocks
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new Error("Gagal membuat rencana makan. Silakan coba lagi.");
  }
}
