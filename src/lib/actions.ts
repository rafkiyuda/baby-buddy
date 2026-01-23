"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import prisma from "@/lib/db"

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
    // Simulate user ID for MVP (In real app, get from session)
    // We need a user first. For MVP, I will get or create a default user.

    let user = await prisma.user.findFirst()
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: "demo@bebynest.com",
                role: "PARENT"
            }
        })
    }

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

const PregnancyProfileSchema = z.object({
    pregnancyWeek: z.coerce.number().min(1).max(42, "Week must be between 1 and 42"),
})

export async function createPregnancyProfile(prevState: any, formData: FormData) {
    let user = await prisma.user.findFirst()
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: "demo@bebynest.com",
                role: "PARENT"
            }
        })
    }

    const validatedFields = PregnancyProfileSchema.safeParse({
        pregnancyWeek: formData.get("pregnancyWeek"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Please fix the errors below.",
        }
    }

    try {
        await prisma.profile.create({
            data: {
                userId: user.id,
                type: "PREGNANCY",
                pregnancyWeek: validatedFields.data.pregnancyWeek,
            },
        })

        return { success: true, message: "Pregnancy profile created successfully!" }
    } catch (error) {
        console.error("Profile creation error:", error)
        return {
            message: "Failed to create profile. Please try again.",
        }
    }
}

import { generateWeeklyMealPlan } from "@/lib/gemini"
import { calculateZScore } from "@/lib/growth-standards"

export async function generateMealPlanAction() {
    try {
        // 1. Fetch User & Profile (Mocking active profile logic for MVP)
        const user = await prisma.user.findFirst({
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

        // 3. Call AI
        const mealPlanJson = await generateWeeklyMealPlan({
            ageMonths,
            weight,
            allergies: profile.allergies,
            zScoreStatus: zScore.status
        });

        // 4. Save to DB
        await prisma.mealPlan.create({
            data: {
                profileId: profile.id,
                weekNumber: 1, // Logic to increment week needed in real app
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
