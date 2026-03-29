"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Mic, MicOff, PhoneCall, PhoneOff, User, Sparkles, Loader2, Volume2, VolumeX, Camera, Image as ImageIcon, X } from "lucide-react"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    imageUrl?: string
}

interface ChatInterfaceProps {
    childContext: {
        name: string | null
        ageMonths: number
        allergies: string[]
        latestWeight?: number
    } | null
}

export function ChatInterface({ childContext }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: `Halo! Saya AI BebyNest. ${childContext?.name ? `Bagaimana kabar ${childContext.name} hari ini?` : "Ada yang bisa saya bantu terkait kesehatan atau nutrisi anak Anda?"
                } Anda bisa mengetik pesan atau menekan tombol 'Mulai Telepon' untuk berbicara langsung dengan saya!`
        }
    ])

    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isCalling, setIsCalling] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [speechSupported, setSpeechSupported] = useState(true)
    const [ttsEnabled, setTtsEnabled] = useState(true)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    const scrollRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const recognitionRef = useRef<any>(null)
    const synthesisRef = useRef<SpeechSynthesis | null>(null)
    
    // Live API Refs
    const wsRef = useRef<WebSocket | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const processorRef = useRef<ScriptProcessorNode | null>(null)
    const mediaStreamRef = useRef<MediaStream | null>(null)
    const nextStartTimeRef = useRef<number>(0)
    const audioWorkletRef = useRef<any>(null)

    // Setup Web Speech API
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition()
                recognitionRef.current.continuous = false
                recognitionRef.current.lang = 'id-ID' // Indonesian by default

                recognitionRef.current.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript
                    setInput(transcript)
                    if (isCalling) {
                        // If in call mode, auto send
                        handleSend(transcript)
                    }
                }

                recognitionRef.current.onend = () => {
                    setIsListening(false)
                    // If in call mode and not loading, keep listening loop active (simplified for now to just wait)
                }
            } else {
                setSpeechSupported(false)
            }

            synthesisRef.current = window.speechSynthesis
        }
    }, [isCalling])

    useEffect(() => {
        // Auto scroll to bottom
        if (scrollRef.current) {
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
            }, 100)
        }
    }, [messages, isLoading])

    const speak = (text: string) => {
        if (!ttsEnabled || !synthesisRef.current) return

        // Cancel any ongoing speech
        synthesisRef.current.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'id-ID'
        utterance.pitch = 1.1
        utterance.rate = 1.0

        // Clean markdown for speech
        utterance.text = text.replace(/[*#_]/g, '')

        synthesisRef.current.speak(utterance)

        utterance.onend = () => {
            // When AI finishes speaking in a call, resume listening
            if (isCalling && recognitionRef.current) {
                try {
                    setIsListening(true)
                    recognitionRef.current.start()
                } catch (e) {
                    // sometimes it's already started
                }
            }
        }
    }

    const stopCall = () => {
        setIsCalling(false)
        setIsListening(false)
        
        // Stop Original Web Speech
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }
        if (synthesisRef.current) {
            synthesisRef.current.cancel()
        }

        // Stop Live API WebSocket
        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }

        // Stop Audio Capture
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop())
            mediaStreamRef.current = null
        }

        if (processorRef.current) {
            processorRef.current.disconnect()
            processorRef.current = null
        }

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close()
            audioContextRef.current = null
        }
    }

    const playAudioChunk = (base64Audio: string) => {
        if (!audioContextRef.current) return

        try {
            const binaryString = atob(base64Audio)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i)
            }

            const int16Data = new Int16Array(bytes.buffer)
            const float32Data = new Float32Array(int16Data.length)
            
            for (let i = 0; i < int16Data.length; i++) {
                float32Data[i] = int16Data[i] / 32768.0
            }

            const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 16000)
            buffer.getChannelData(0).set(float32Data)

            const source = audioContextRef.current.createBufferSource()
            source.buffer = buffer
            source.connect(audioContextRef.current.destination)

            const currentTime = audioContextRef.current.currentTime
            if (nextStartTimeRef.current < currentTime) {
                nextStartTimeRef.current = currentTime
            }

            source.start(nextStartTimeRef.current)
            nextStartTimeRef.current += buffer.duration
        } catch (e) {
            console.error("Error playing audio chunk", e)
        }
    }

    const startCall = async () => {
        setIsCalling(true)
        setTtsEnabled(true)
        setIsLoading(true)

        try {
            // 1. Setup Audio Context
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
            audioContextRef.current = new AudioContextClass({ sampleRate: 16000 })
            nextStartTimeRef.current = audioContextRef.current.currentTime

            // 2. Setup WebSocket
            const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
            const MODEL_NAME = "gemini-3.1-flash-live-preview"
            const WS_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${API_KEY}`

            wsRef.current = new WebSocket(WS_URL)
            wsRef.current.binaryType = 'arraybuffer' // Use arraybuffer for easier handling

            wsRef.current.onopen = () => {
                console.log('Gemini Live WebSocket Connected')
                const configMessage = {
                    config: {
                        model: `models/${MODEL_NAME}`,
                        responseModalities: ["AUDIO"],
                        systemInstruction: {
                            parts: [{ 
                                text: `Anda adalah AI Assistant BebyNest yang sedang dalam Live Call. Berbicaralah dengan sangat natural seperti sahabat orang tua. Gunakan bahasa Indonesia yang luwes (bisa pakai 'aku-kamu' atau 'saya-bunda').
                                
Context Anak: Nama: ${childContext?.name || 'Anak'}, Umur: ${childContext?.ageMonths} bulan, Alergi: ${childContext?.allergies?.join(', ') || 'Tidak ada'}.` 
                            }]
                        }
                    }
                }
                wsRef.current?.send(JSON.stringify(configMessage))
                setIsLoading(false)
                setIsListening(true)
                startAudioCapture()
            }

            wsRef.current.onmessage = async (event) => {
                let data = event.data
                
                // If it's a Blob, convert to ArrayBuffer first
                if (data instanceof Blob) {
                    data = await data.arrayBuffer()
                }

                // If it's binary, convert to string if we expect JSON
                if (data instanceof ArrayBuffer) {
                    const decoder = new TextDecoder()
                    data = decoder.decode(data)
                }

                if (typeof data !== 'string') {
                    console.log("Received unexpected data type:", typeof data)
                    return
                }

                try {
                    const response = JSON.parse(data)
                    console.log("Gemini Live Response:", response)
                    
                    if (response.setupComplete) {
                        console.log("Gemini Setup Complete")
                        setIsLoading(false)
                    }

                    if (response.serverContent) {
                        const { modelTurn, outputTranscription, inputTranscription, turnComplete } = response.serverContent
                        
                        if (turnComplete) {
                            setIsLoading(false)
                        }

                        if (modelTurn?.parts) {
                            setIsLoading(false)
                            for (const part of modelTurn.parts) {
                                if (part.inlineData) {
                                    playAudioChunk(part.inlineData.data)
                                }
                            }
                        }

                        if (outputTranscription) {
                            setMessages(prev => {
                                const last = prev[prev.length - 1]
                                if (last && last.role === 'assistant' && last.id.startsWith('live-ai-')) {
                                    return [...prev.slice(0, -1), { ...last, content: last.content + outputTranscription }]
                                }
                                return [...prev, { id: 'live-ai-' + Date.now(), role: 'assistant', content: outputTranscription }]
                            })
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse WS message", e, data)
                }
            }

            wsRef.current.onerror = (e) => {
                console.error("WebSocket Error", e)
                stopCall()
                alert("Koneksi Live AI terputus. Silakan coba lagi.")
            }

        } catch (e) {
            console.error("Start call error", e)
            stopCall()
        }
    }

    const startAudioCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaStreamRef.current = stream

            const source = audioContextRef.current!.createMediaStreamSource(stream)
            const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1)
            processorRef.current = processor

            processor.onaudioprocess = (e) => {
                // If isCalling is false, stop processing
                if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

                if (!isLoading) {
                    const inputData = e.inputBuffer.getChannelData(0)
                    // Convert Float32 to Int16
                    const int16Data = new Int16Array(inputData.length)
                    for (let i = 0; i < inputData.length; i++) {
                        const s = Math.max(-1, Math.min(1, inputData[i]))
                        int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
                    }
                    
                    // Efficiently Convert to Base64
                    let binary = ''
                    const bytes = new Uint8Array(int16Data.buffer)
                    const len = bytes.byteLength
                    for (let i = 0; i < len; i++) {
                        binary += String.fromCharCode(bytes[i])
                    }
                    const base64 = btoa(binary)
                    
                    wsRef.current.send(JSON.stringify({
                        realtimeInput: {
                            audio: {
                                data: base64,
                                mimeType: "audio/pcm;rate=16000"
                            }
                        }
                    }))
                }
            }

            source.connect(processor)
            processor.connect(audioContextRef.current!.destination)
        } catch (e) {
            console.error("Audio capture error", e)
            alert("Gagal mengakses mikrofon.")
        }
    }

    const toggleMic = () => {
        if (!speechSupported) return
        if (isListening) {
            recognitionRef.current?.stop()
            setIsListening(false)
        } else {
            try {
                recognitionRef.current?.start()
                setIsListening(true)
            } catch (e) {
                console.error("Mic start error", e)
            }
        }
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("Ukuran gambar terlalu besar. Maksimal 5MB.")
                return
            }
            const reader = new FileReader()
            reader.onloadend = () => {
                setSelectedImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setSelectedImage(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleSend = async (textToSend: string = input) => {
        if (!textToSend.trim() && !selectedImage) return

        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: textToSend || "Tolong analisis foto makanan ini.",
            imageUrl: selectedImage || undefined
        }

        setMessages(prev => [...prev, newUserMessage])
        setInput("")
        const imageToSend = selectedImage
        removeImage()
        setIsLoading(true)

        // Stop listening while AI is "thinking"
        if (isListening) {
            recognitionRef.current?.stop()
            setIsListening(false)
        }

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, newUserMessage],
                    childContext
                })
            })

            if (!response.ok) throw new Error("Gagal mengirim pesan")

            const data = await response.json()

            const aiMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: data.reply }
            setMessages(prev => [...prev, aiMessage])

            if (isCalling || ttsEnabled) {
                speak(data.reply)
            }

        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: "Maaf, terjadi kesalahan komunikasi dengan server AI. Silakan coba lagi." }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full relative">
            {/* Call Mode Overlay overlay */}
            {isCalling && (
                <div className="absolute inset-0 bg-background/95 backdrop-blur-md z-10 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="relative mb-12">
                        {/* Ripple Effect for active call */}
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping delay-150"></div>
                        <div className="absolute -inset-4 bg-primary/10 rounded-full animate-ping"></div>
                        <div className="relative bg-gradient-to-br from-primary to-accent p-8 rounded-full shadow-2xl shadow-primary/30">
                            <Sparkles className="h-16 w-16 text-white" />
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-2">Live Call dengan AI</h3>
                    <p className="text-muted-foreground mb-12">
                        {isLoading ? "AI sedang berpikir..." : isListening ? "Mendengarkan... Silakan bicara" : "Menunggu giliran bicara..."}
                    </p>

                    <div className="flex gap-6">
                        <Button
                            variant={isListening ? "default" : "outline"}
                            size="lg"
                            className="rounded-full h-16 w-16 p-0 shadow-lg"
                            onClick={toggleMic}
                        >
                            {isListening ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="rounded-full h-16 w-16 p-0 shadow-lg border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                            onClick={stopCall}
                        >
                            <PhoneOff className="h-6 w-6" />
                        </Button>
                    </div>

                    <div className="mt-12 max-w-md w-full px-8 opacity-50">
                        <p className="text-xs text-center text-muted-foreground italic">
                            Terakhir: "{messages[messages.length - 1]?.content.substring(0, 50)}..."
                        </p>
                    </div>
                </div>
            )}

            {/* Chat Header */}
            <div className="border-b p-4 bg-background/50 flex justify-between items-center z-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-semibold">BebyNest AI</h2>
                        <p className="text-xs text-green-500 flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span> Online
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setTtsEnabled(!ttsEnabled)} title="Toggle Text-to-Speech">
                        {ttsEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
                    </Button>
                    <Button variant="default" className="gap-2 bg-gradient-to-r from-primary to-accent" onClick={startCall}>
                        <PhoneCall className="h-4 w-4" /> <span className="hidden sm:inline">Live Call</span>
                    </Button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto w-full">
                <div className="space-y-6 max-w-3xl mx-auto pb-4">
                    {messages.map((m) => (
                        <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {m.role === 'assistant' && (
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center self-end mb-1">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                </div>
                            )}
                            <div className={`rounded-2xl px-4 py-2 flex max-w-[80%] flex-col gap-1 ${m.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-sm shadow-md'
                                : 'bg-muted rounded-bl-sm border shadow-sm'
                                }`}>
                                <div className="text-sm prose dark:prose-invert max-w-none prose-p:leading-snug prose-p:my-1">
                                    {m.imageUrl && (
                                        <div className="mb-2 rounded-lg overflow-hidden border border-white/20">
                                            <img src={m.imageUrl} alt="Uploaded meal" className="max-w-full h-auto max-h-48 object-cover" />
                                        </div>
                                    )}
                                    {m.content.split('\n').map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            </div>
                            {m.role === 'user' && (
                                <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex flex-shrink-0 items-center justify-center self-end mb-1">
                                    <User className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center self-end mb-1">
                                <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                            <div className="bg-muted rounded-2xl rounded-bl-sm border px-4 py-3 flex gap-1 items-center">
                                <span className="h-2 w-2 bg-primary/40 rounded-full animate-bounce"></span>
                                <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="h-2 w-2 bg-primary/80 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} style={{ height: 1, paddingBottom: 20 }} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background/80 backdrop-blur border-t z-0 relative">
                {selectedImage && (
                    <div className="absolute bottom-full left-0 m-4 p-2 bg-background border rounded-lg shadow-lg">
                        <div className="relative">
                            <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded object-cover" />
                            <Button
                                variant="default"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 outline-none border-none text-white"
                                onClick={removeImage}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSend()
                    }}
                    className="flex gap-2 max-w-3xl mx-auto items-center"
                >
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                    />

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon className="h-5 w-5" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`rounded-full shrink-0 ${isListening ? 'text-red-500 bg-red-50 dark:bg-red-950 flex' : ''}`}
                        onClick={toggleMic}
                    >
                        {isListening ? <Mic className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
                    </Button>

                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Tanya seputar anak, atau kirim foto makanan..."
                        className="rounded-full bg-muted/50 border-border/50 focus-visible:ring-primary/50 flex-1"
                        disabled={isLoading || isCalling}
                    />

                    <Button
                        type="submit"
                        disabled={(!input.trim() && !selectedImage) || isLoading || isCalling}
                        className="rounded-full shrink-0 shadow-sm"
                        size="icon"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-muted-foreground">AI dapat membuat kesalahan. Harap pertimbangkan saran dengan dokter sebelum bertindak.</p>
                </div>
            </div>
        </div>
    )
}
