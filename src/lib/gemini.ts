import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite-preview",
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

export interface MealPlanResponse {
  summary: {
    totalDays: number;
    dailyCaloriesTarget: number;
    focusNutrients: string[];
    budgetAnalysis: string | null;
  };
  recommendedPackages: {
    packageName: string;
    description: string;
    products: {
      productName: string;
      productId: string | null;
      quantity: number;
      price: number;
    }[];
    totalPrice: number;
    nutritionalBenefits: string[];
    suitableFor: string;
  }[];
  weeklyPlan: {
    day: string;
    dayNumber: number;
    meals: {
      breakfast: MealItem;
      lunch: MealItem;
      dinner: MealItem;
      snack: MealItem;
    };
  }[];
  shoppingList: {
    fromMarketplace: {
      productName: string;
      productId: string;
      quantity: number;
      totalPrice: number;
    }[];
    additionalIngredients: string[];
  };
}

interface MealItem {
  name: string;
  calories: number;
  nutrients: string;
  ingredients: string[];
  marketplaceProduct: string | null;
}

export async function generateWeeklyMealPlan(input: MealPlanInput): Promise<MealPlanResponse> {
  const { ageMonths, weight, allergies, zScoreStatus, durationDays, budget, location } = input;

  // 1. Fetch suitable packages from Database
  // Base filter: Age suitability & Active status
  const whereClause: Prisma.MealsPackageWhereInput = {
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
    
    ATURAN CARA MEREKOMENDASIKAN PRODUK (STRICT):
    1. GUNAKAN HANYA produk yang terdaftar di DATABASE di bawah ini.
    2. GUNAKAN NAMA DAN HARGA YANG SAMA PERSIS. JANGAN MENGUBAH HARGA.
    3. Jika tidak ada produk yang cocok, jangan memaksakan rekomendasi produk, cukup kosongkan array products.
    4. Sesuaikan rekomendasi dengan kebutuhan nutrisi anak (misal: jika underweight perlu tinggi kalori, cari paket 'Weight Gain' atau 'Protein').

    DATABASE PRODUK TERSEDIA:
    ${suitablePackages.length > 0
      ? suitablePackages.map(p => `- ID: ${p.id} | Nama: ${p.name} | Harga: Rp ${p.price} | Kategori: ${p.category} | Manfaat: ${p.nutritionalBenefits.join(', ')}`).join('\n')
      : "Tidak ada paket yang spesifik untuk kriteria ini."}

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
            "packageName": "Nama Paket (Bisa kreatif atau gunakan nama produk)",
            "description": "Alasan kenapa paket ini cocok",
            "products": [
                { "productName": "Nama persis dari DB", "productId": "ID persis dari DB", "quantity": 1, "price": Harga_Persis_Int }
            ],
            "totalPrice": Total_Harga_Int,
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
          { "productName": "Nama Produk", "productId": "ID Produk", "quantity": 0, "totalPrice": 0 }
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

export async function generateGrowthInsight(
  measurements: { weight: number; height: number; date: Date }[],
  profile: { name: string; dob: Date; gender: string }
): Promise<string> {
  const latest = measurements[measurements.length - 1];
  if (!latest) return "Belum ada data pengukuran yang cukup.";

  const ageMonths = (new Date().getFullYear() - new Date(profile.dob).getFullYear()) * 12 + (new Date().getMonth() - new Date(profile.dob).getMonth());

  const prompt = `
    Analisa perkembangan pertumbuhan anak bernama ${profile.name} (Usia: ${ageMonths} bulan, Gender: ${profile.gender}).
    
    Data Terakhir:
    - Berat: ${latest.weight} kg
    - Tinggi: ${latest.height} cm
    - Tanggal: ${new Date(latest.date).toLocaleDateString("id-ID")}

    Riwayat Pengukuran (dari lama ke baru):
    ${measurements.map(m => `- ${new Date(m.date).toLocaleDateString("id-ID")}: ${m.weight}kg, ${m.height}cm`).join('\n')}

    Tugas:
    1. Bandingkan dengan standar WHO (secara umum).
    2. Berikan analisis tren pertumbuhan (naik/turun/stabil).
    3. Berikan saran nutrisi atau stimulasi singkat yang relevan.

    Gunakan bahasa Indonesia yang santai tapi profesional, menyapa orang tua. Maksimal 3 paragraf pendek.
    Jangan gunakan markdown bold/italic yang berlebihan.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Growth Insight Error:", error);
    return "Maaf, sedang tidak dapat menganalisis data saat ini.";
  }
}
