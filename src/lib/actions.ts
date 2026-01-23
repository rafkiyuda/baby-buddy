"use server"


import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { redirect } from "next/navigation"

import prisma from "@/lib/db"
import { hashPassword, verifyPassword } from "@/lib/auth"
import { createSession, getSession, deleteSession } from "@/lib/session"


// Zod schema for Child Profile
const ChildProfileSchema = z.object({
    name: z.string().min(1, "Name is required"),
    dob: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', { message: "Valid Date is required" }),
    gender: z.enum(["MALE", "FEMALE"]),
    weight: z.coerce.number().min(0.5, "Weight must be valid"),
    height: z.coerce.number().min(10, "Height must be valid"),
    allergies: z.string().optional(), // Comma separated string for input simplicity
})

export async function createChildProfile(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || !session.userId) {
        return { message: "Unauthorized. Please log in." }
    }
    const userId = session.userId

    // Check if user exists (paranoid check)
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { message: "User not found." }


    const rawData = {
        name: formData.get("name"),
        dob: formData.get("dob"),
        gender: formData.get("gender"),
        weight: formData.get("weight"),
        height: formData.get("height"),
        allergies: formData.get("allergies"),
    }

    const validatedFields = ChildProfileSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Please fix the errors below.",
        }
    }

    const { name, dob, gender, weight, height, allergies } = validatedFields.data

    try {
        await prisma.profile.create({
            data: {
                userId: user.id,
                type: "CHILD",
                name,
                dob: new Date(dob),
                gender,
                weight,
                height,
                allergies: allergies ? allergies.split(",").map(s => s.trim()) : [],
            },
        })

        return { success: true, message: "Profile created successfully!" }
    } catch (error) {
        console.error("Profile creation error:", error)
        return {
            message: "Failed to create profile. Please try again.",
        }
    }
}



import { generateWeeklyMealPlan } from "@/lib/gemini"
import { calculateZScore } from "@/lib/growth-standards"

export async function generateMealPlanAction(durationDays: number = 7, budget?: number, location?: string) {
    try {
        const session = await getSession()
        if (!session || !session.userId) {
            return { success: false, message: "Unauthorized. Please log in." }
        }

        // 1. Fetch User & Profile
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { profiles: true }
        })


        if (!user || user.profiles.length === 0) {
            return { success: false, message: "No profile found. Please complete onboarding first." }
        }

        // Default to the first child profile for now
        const profile = user.profiles.find(p => p.type === "CHILD") || user.profiles[0];

        if (profile.type !== "CHILD") {
            return { success: false, message: "Meal planning currently optimized for Child profiles." }
        }

        // 2. Prepare Input for AI
        const dob = profile.dob || new Date();
        const ageMonths = (new Date().getFullYear() - dob.getFullYear()) * 12 + (new Date().getMonth() - dob.getMonth());
        const weight = profile.weight || 10; // Fallback

        // Calculate Z-Score (Simple check)
        // Gender needs to be cast or validated, default to MALE if null
        const zScore = calculateZScore(weight, profile.gender || "MALE", dob);

        // 3. Call AI with duration, budget, and location
        const mealPlanJson = await generateWeeklyMealPlan({
            ageMonths,
            weight,
            allergies: profile.allergies,
            zScoreStatus: zScore.status,
            durationDays,
            budget,
            location
        });

        // 4. Save to DB
        await prisma.mealPlan.create({
            data: {
                profileId: profile.id,
                weekNumber: 1, // Logic to increment week needed in real app
                budget: budget,
                ingredientsJson: mealPlanJson,
                isActive: true
            }
        })

        revalidatePath("/dashboard/meals")
        return { success: true, message: "Meal plan generated successfully!", data: mealPlanJson }

    } catch (error) {
        console.error("Meal Plan Generation Error:", error)
        return { success: false, message: "Failed to generate plan." }
    }
}

const SignupSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password is required")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export async function signup(prevState: any, formData: FormData) {
    const rawData = {
        username: formData.get("username"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
    }

    const validatedFields = SignupSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Please fix the errors below.",
        }
    }

    const { username, password } = validatedFields.data

    try {
        const existingUser = await prisma.user.findUnique({
            where: { username }
        })

        if (existingUser) {
            return {
                errors: { username: ["Username is already taken"] },
                message: "Username is already taken"
            }
        }

        const hashedPassword = await hashPassword(password)

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        })

        await createSession(user.id)
    } catch (error) {
        console.error("Signup error:", error)
        return {
            message: "An error occurred during signup.",
        }
    }

    redirect("/onboarding")
}

const LoginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
})

export async function login(prevState: any, formData: FormData) {
    const rawData = {
        username: formData.get("username"),
        password: formData.get("password"),
    }

    const validatedFields = LoginSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Invalid inputs.",
        }
    }

    const { username, password } = validatedFields.data

    try {
        const user = await prisma.user.findUnique({
            where: { username }
        })

        if (!user || !(await verifyPassword(password, user.password))) {
            return {
                message: "Invalid username or password",
            }
        }

        await createSession(user.id)
    } catch (error) {
        console.error("Login error:", error)
        return { message: "An error occurred during login" }
    }

    redirect("/dashboard")
}

export async function logout() {
    await deleteSession()
    redirect("/login")
}
