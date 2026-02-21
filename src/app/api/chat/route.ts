import { GoogleGenerativeAI } from "@google/generative-ai"
import { getSession } from "@/lib/session"

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!
const genAI = new GoogleGenerativeAI(apiKey)

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash", // We know this model works
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
        let history = messages.slice(0, -1).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }))

        // Gemini API strictly requires the first message in the history to be from the 'user'
        // If our initial greeting makes the first message 'model', we must remove it from the history context.
        while (history.length > 0 && history[0].role === 'model') {
            history.shift();
        }

        const latestMessage = messages[messages.length - 1].content

        let promptText = latestMessage

        if (childContext) {
            promptText = `[Context Anak - Nama: ${childContext.name || 'Anak'}, Umur: ${childContext.ageMonths} bulan, Alergi: ${childContext.allergies?.join(', ') || 'Tidak ada'}, Berat Badan Terakhir: ${childContext.latestWeight ? childContext.latestWeight + 'kg' : 'Tidak diketahui'}] \n\nPertanyaan Pengguna: ${latestMessage}`
        }

        const chat = model.startChat({
            history: history,
        })

        const result = await chat.sendMessage(promptText)
        const responseText = result.response.text()

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
