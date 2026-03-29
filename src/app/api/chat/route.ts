import { GoogleGenerativeAI } from "@google/generative-ai"
import { getSession } from "@/lib/session"
import prisma from "@/lib/db"

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!
const genAI = new GoogleGenerativeAI(apiKey)

const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview", // adjusted from pro-preview due to quota limits
    systemInstruction: `Anda adalah AI Assistant BebyNest, asisten chatbot khusus untuk orang tua yang peduli dengan kesehatan, tumbuh kembang, dan nutrisi gizi anak (khususnya MPASI). Jawab pertanyaan pengguna dengan ramah, suportif, informatif, dan ringkas. Gunakan bahasa Indonesia sehari-hari yang mudah dipahami. 
    
Aturan:
1. Berikan jawaban yang ringkas namun padat karena pengguna bisa jadi sedang mendengarkan ini via Audio (Text-to-Speech). Jangan gunakan formatting berlebihan.
2. Selalu ingatkan bahwa Anda adalah AI dan untuk diagnosis medis yang tepat, sarankan mereka menemui dokter anak atau ahli gizi.
3. Anda mungkin diberikan "Child Context" yang berisi umur, nama, alergi dan berat badan anak pengguna. Gunakan ini untuk menjawab secara spesifik. Misalnya: "Karena berat badan Budi saat ini 10kg..." atau "Mengingat Ani alergi kacang, sebaiknya hindari..."`
})

export async function POST(req: Request) {
    try {
        const session = await getSession()
        if (!session || !session.userId) {
            return new Response("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { messages, childContext } = body

        if (!messages || !Array.isArray(messages)) {
            return new Response("Bad Request", { status: 400 })
        }

        // Format history for Gemini
        let history = messages.slice(0, -1).map((msg: any) => {
            const parts: any[] = [{ text: msg.content }];
            if (msg.imageUrl) {
                // Determine mime type from base64 string
                const mimeType = msg.imageUrl.substring(msg.imageUrl.indexOf(":") + 1, msg.imageUrl.indexOf(";"));
                const base64Data = msg.imageUrl.split(',')[1];
                parts.push({
                    inlineData: {
                        data: base64Data,
                        mimeType
                    }
                });
            }
            return {
                role: msg.role === 'user' ? 'user' : 'model',
                parts
            }
        })

        // Gemini API strictly requires the first message in the history to be from the 'user'
        // If our initial greeting makes the first message 'model', we must remove it from the history context.
        while (history.length > 0 && history[0].role === 'model') {
            history.shift();
        }

        const latestMessageObj = messages[messages.length - 1]
        let promptText = latestMessageObj.content
        let isMealPhoto = false

        if (childContext) {
            promptText = `[Context Anak - Nama: ${childContext.name || 'Anak'}, Umur: ${childContext.ageMonths} bulan, Alergi: ${childContext.allergies?.join(', ') || 'Tidak ada'}, Berat Badan Terakhir: ${childContext.latestWeight ? childContext.latestWeight + 'kg' : 'Tidak diketahui'}] \n\nPertanyaan Pengguna: ${promptText}
            
            [INSTRUKSI VISUAL KHUSUS]: Jika pengguna melampirkan foto beserta pesan ini, asumsikan itu adalah foto porsi/menu makanan untuk Anak. Evaluasi secara singkat apakah porsinya sesuai untuk umur anak, sebutkan estimasi kalorinya, dan apakah makronutrisinya lengkap.`
        }

        const latestParts: any[] = [{ text: promptText }];
        if (latestMessageObj.imageUrl) {
            isMealPhoto = true
            const mimeType = latestMessageObj.imageUrl.substring(latestMessageObj.imageUrl.indexOf(":") + 1, latestMessageObj.imageUrl.indexOf(";"));
            const base64Data = latestMessageObj.imageUrl.split(',')[1];
            latestParts.push({
                inlineData: {
                    data: base64Data,
                    mimeType
                }
            });

            // Add specific instructions for structured JSON output if image is present
            latestParts[0].text += `\n\nKarena ini adalah analisis foto makanan, berikan MERGE response yang isinya di split oleh pemisah "===JSON_DATA===".
Bagian pertama adalah respons teks biasa untuk orang tua (ramah, suportif, analisis porsi/nutrisi).
Bagian kedua (setelah "===JSON_DATA===") adalah JSON murni dengan format:
{
  "foodName": "Nama Makanan",
  "detectedPortion": "Estimasi Porsi (misal: 1 mangkuk sedang)",
  "calories": Estimasi_Kalori_Angka,
  "nutrientsJson": {"karbohidrat": "...", "protein": "...", "lemak": "..."}
}
Tidak perlu menggunakan markdown code block untuk JSON-nya, langsung saja teks mentah.`
        }

        const chat = model.startChat({
            history: history,
        })

        const result = await chat.sendMessage(latestParts)
        let responseText = result.response.text()
        let savedMealLog = null;

        // Extract JSON if it exists
        if (isMealPhoto && responseText.includes("===JSON_DATA===")) {
            const parts = responseText.split("===JSON_DATA===")
            responseText = parts[0].trim()
            try {
                const jsonData = JSON.parse(parts[1].trim())

                // Fetch profile ID based on the authenticated user to link the MealLog
                // For this example, assuming the context or session has the profile ID, but we only have childContext
                // We'll need to fetch the child's profile ID based on userId from the session. Re-use session logic.
                const profile = await prisma.profile.findFirst({
                    where: { userId: session.userId, type: "CHILD" }
                });

                if (profile) {
                    savedMealLog = await prisma.mealLog.create({
                        data: {
                            profileId: profile.id,
                            foodName: jsonData.foodName || "Makanan Anak",
                            detectedPortion: jsonData.detectedPortion,
                            calories: jsonData.calories,
                            nutrientsJson: jsonData.nutrientsJson,
                            notes: "Dianalisis otomatis dari foto oleh AI",
                            // In a real app we'd upload the base64 securely to S3/Supabase Storage and save the URL, 
                            // saving huge base64 arrays in postgres text fields is not recommended for production
                            // imageUrl: latestMessageObj.imageUrl 
                        }
                    })
                    responseText += `\n\n*(Catatan otomatis: Menu makanan **${jsonData.foodName}** (${jsonData.calories} kal) telah berhasil dicatat ke riwayat gizi anak Anda hari ini.)*`
                }
            } catch (e) {
                console.error("Gagal parsing JSON data dari AI:", e)
            }
        }

        return new Response(JSON.stringify({ reply: responseText }), {
            headers: { "Content-Type": "application/json" }
        })

    } catch (error: any) {
        console.error("Chat API Error Name:", error?.name);
        console.error("Chat API Error Message:", error?.message);
        console.error("Chat API Error Stack:", error?.stack);
        console.error("Chat API Full Error Object:", JSON.stringify(error, null, 2));

        return new Response(JSON.stringify({ error: "Failed to generate reply", details: error?.message || "Unknown error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        })
    }
}
