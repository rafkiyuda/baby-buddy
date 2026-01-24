"use server"


import { PrismaClient, CartItem } from "@prisma/client"
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
                ingredientsJson: mealPlanJson as any,
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

const MeasurementSchema = z.object({
    weight: z.coerce.number().min(0.1, "Weight must be valid"),
    height: z.coerce.number().min(10, "Height must be valid"),
    date: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', { message: "Valid Date is required" }),
})

export async function addMeasurement(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || !session.userId) {
        return { message: "Unauthorized." }
    }

    const rawData = {
        weight: formData.get("weight"),
        height: formData.get("height"),
        date: formData.get("date"),
    }

    const validatedFields = MeasurementSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Invalid input.",
        }
    }

    const { weight, height, date } = validatedFields.data

    try {
        // Get the child profile
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { profiles: true }
        })

        const profile = user?.profiles.find(p => p.type === "CHILD")

        if (!profile) return { message: "Child profile not found." }

        // Transaction: create measurement AND update profile
        await prisma.$transaction([
            prisma.measurement.create({
                data: {
                    profileId: profile.id,
                    weight,
                    height,
                    date: new Date(date),
                }
            }),
            prisma.profile.update({
                where: { id: profile.id },
                data: {
                    weight,
                    height,
                }
            })
        ])

        revalidatePath("/dashboard/growth")
        return { success: true, message: "Growth data recorded!" }
    } catch (error) {
        console.error("Add Measurement Error:", error)
        return { message: "Failed to save data." }
    }
}
const EditProfileSchema = z.object({
    name: z.string().min(1, "Name is required"),
    dob: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', { message: "Valid Date is required" }),
    gender: z.enum(["MALE", "FEMALE"]),
    allergies: z.string().optional(),
})

export async function updateChildProfile(profileId: string, prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || !session.userId) {
        return { message: "Unauthorized." }
    }

    const rawData = {
        name: formData.get("name"),
        dob: formData.get("dob"),
        gender: formData.get("gender"),
        allergies: formData.get("allergies"),
    }

    const validatedFields = EditProfileSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Invalid input.",
        }
    }

    const { name, dob, gender, allergies } = validatedFields.data

    try {
        // Basic ownership check
        const profile = await prisma.profile.findUnique({
            where: { id: profileId }
        })

        if (!profile || profile.userId !== session.userId) {
            return { message: "Unauthorized or Profile not found." }
        }

        await prisma.profile.update({
            where: { id: profileId },
            data: {
                name,
                dob: new Date(dob),
                gender,
                allergies: allergies ? allergies.split(",").map(s => s.trim()) : [],
            }
        })

        revalidatePath("/dashboard/profile")
        return { success: true, message: "Profile updated successfully!" }
    } catch (error) {
        console.error("Update Profile Error:", error)
        return { message: "Failed to update profile." }
    }
}

// --- Cart Actions ---

interface CartItemInput {
    name: string;
    price: number;
    quantity: number;
    productId?: string;
    packageId?: string;
    imageUrl?: string;
}

export async function addToCart(items: CartItemInput[]) {
    const session = await getSession()
    if (!session || !session.userId) {
        return { success: false, message: "Unauthorized." }
    }

    try {
        // Find or create cart
        let cart = await prisma.cart.findUnique({
            where: { userId: session.userId }
        })

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: session.userId }
            })
        }

        // Add items
        for (const item of items) {
            // Check if item exists (simple logic: same name? or same productId?)
            // For now, let's just add strict new items or update quantity if exact match on name/id
            // Keep it simple: Add as new row for now, or maybe upsert if productID matches
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    productId: item.productId,
                    packageId: item.packageId,
                    imageUrl: item.imageUrl
                }
            })
        }

        revalidatePath("/dashboard/cart")
        return { success: true, message: "Added to cart!" }

    } catch (error) {
        console.error("Add to Cart Error:", error)
        return { success: false, message: "Failed to add items to cart." }
    }
}

export async function removeFromCart(itemId: string) {
    const session = await getSession()
    if (!session || !session.userId) return { success: false }

    try {
        // Verify ownership via Cart
        const item = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: { cart: true }
        })

        if (!item || item.cart.userId !== session.userId) {
            return { success: false, message: "Unauthorized" }
        }

        await prisma.cartItem.delete({
            where: { id: itemId }
        })

        revalidatePath("/dashboard/cart")
        return { success: true, message: "Removed." }
    } catch (error) {
        return { success: false, message: "Error removing item." }
    }
}

export async function checkoutCart() {
    const session = await getSession()
    if (!session || !session.userId) {
        return { success: false, message: "Unauthorized." }
    }

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: session.userId },
            include: { items: true }
        })

        if (!cart || cart.items.length === 0) {
            return { success: false, message: "Cart is empty." }
        }

        const totalAmount = cart.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0)

        // Transaction logic
        await prisma.$transaction([
            // 1. Create Transaction Record
            prisma.transaction.create({
                data: {
                    userId: session.userId,
                    amount: totalAmount,
                    type: "MARKETPLACE_ORDER",
                    status: "COMPLETED", // Mocking successful payment
                    metadata: {
                        items: cart.items.map(i => ({ name: i.name, qty: i.quantity, price: i.price }))
                    }
                }
            }),
            // 2. Clear Cart Items
            prisma.cartItem.deleteMany({
                where: { cartId: cart.id }
            })
        ])

        return { success: true, message: "Order placed successfully!" }

    } catch (error) {
        console.error("Checkout Error:", error)
        return { success: false, message: "Checkout failed." }
    }
}

import { generateGrowthInsight } from "@/lib/gemini"

export async function getGrowthInsight() {
    const session = await getSession()
    if (!session || !session.userId) return { success: false, message: "Unauthorized." }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { profiles: { include: { measurements: true } } }
        })

        const profile = user?.profiles.find(p => p.type === "CHILD")
        if (!profile) return { success: false, message: "No child profile." }

        if (profile.measurements.length === 0) return { success: false, message: "Not enough data." }

        const insight = await generateGrowthInsight(
            profile.measurements.map(m => ({
                weight: m.weight,
                height: m.height,
                date: m.date
            })),
            {
                name: profile.name || "Child",
                dob: profile.dob || new Date(),
                gender: profile.gender || "MALE"
            }
        )

        return { success: true, insight }
    } catch (error) {
        console.error(error)
        return { success: false, message: "Failed to generate insight." }
    }
}

const UpdateMeasurementSchema = z.object({
    id: z.string().min(1, "ID is required"),
    weight: z.coerce.number().min(0.1, "Weight must be valid"),
    height: z.coerce.number().min(10, "Height must be valid"),
    date: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', { message: "Valid Date is required" }),
})

export async function updateMeasurement(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || !session.userId) return { message: "Unauthorized." }

    const rawData = {
        id: formData.get("id"),
        weight: formData.get("weight"),
        height: formData.get("height"),
        date: formData.get("date"),
    }

    const validatedFields = UpdateMeasurementSchema.safeParse(rawData)
    if (!validatedFields.success) {
        return { message: "Invalid input." }
    }

    const { id, weight, height, date } = validatedFields.data

    try {
        const measurement = await prisma.measurement.findUnique({
            where: { id },
            include: { profile: true }
        })

        if (!measurement || measurement.profile.userId !== session.userId) {
            return { message: "Unauthorized or not found." }
        }

        // Update
        await prisma.measurement.update({
            where: { id },
            data: { weight, height, date: new Date(date) }
        })

        // Update profile stats if this was the latest measurement
        // Simplified: Just re-fetch latest after update might be better, but acceptable for now to just revalidate path
        // Actually, let's just revalidate. The profile sync logic in addMeasurement was aggressive. 
        // Ideally we should sync profile with the LATEST measurement by date.

        revalidatePath("/dashboard/growth")
        revalidatePath("/dashboard") // For overview
        return { success: true, message: "Updated successfully." }
    } catch (error) {
        console.error("Update Measurement Error:", error)
        return { message: "Failed to update." }
    }
}

export async function deleteMeasurement(id: string) {
    const session = await getSession()
    if (!session || !session.userId) return { success: false, message: "Unauthorized." }

    try {
        const measurement = await prisma.measurement.findUnique({
            where: { id },
            include: { profile: true }
        })

        if (!measurement || measurement.profile.userId !== session.userId) {
            return { success: false, message: "Unauthorized or not found." }
        }

        await prisma.measurement.delete({ where: { id } })

        revalidatePath("/dashboard/growth")
        revalidatePath("/dashboard")
        return { success: true, message: "Deleted successfully." }
    } catch (error) {
        console.error("Delete Measurement Error:", error)
        return { success: false, message: "Failed to delete." }
    }
}

export type Notification = {
    id: string
    type: "DANGER" | "WARNING" | "INFO"
    title: string
    message: string
    link?: string
    timestamp: Date
}

export async function getNotifications(): Promise<Notification[]> {
    const session = await getSession()
    if (!session || !session.userId) return []

    const notifications: Notification[] = []
    const now = new Date()

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: {
                profiles: {
                    include: { measurements: { orderBy: { date: 'asc' } } }
                }
            }
        })

        const profile = user?.profiles.find(p => p.type === "CHILD")
        if (!profile) return []

        // 1. Growth Tracker Check (Missing Data for Current Month)
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        const hasDataForCurrentMonth = profile.measurements.some(m => {
            const d = new Date(m.date)
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear
        })

        if (!hasDataForCurrentMonth) {
            notifications.push({
                id: "growth-missing",
                type: "WARNING",
                title: "Missing Growth Data",
                message: "You haven't logged any growth data for this month yet. Keep track of your child's progress!",
                link: "/dashboard/growth",
                timestamp: now
            })
        }

        // 2. Health Risk Check (Z-Score)
        const latestMeasurement = profile.measurements[profile.measurements.length - 1]
        if (latestMeasurement && profile.dob && profile.gender) {
            const zScore = calculateZScore(latestMeasurement.weight, profile.gender, profile.dob)
            if (zScore.status.includes("Severely") || zScore.status === "Obese") {
                notifications.push({
                    id: "health-risk",
                    type: "DANGER",
                    title: "Health Alert",
                    message: `Latest measurement indicates '${zScore.status}'. Please consult a pediatrician.`,
                    link: "/dashboard/growth",
                    timestamp: new Date(latestMeasurement.date)
                })
            }
        }

        // 3. Meal Check (Dummy for now, as requested)
        // In real app, query MealPlan for upcoming meal
        notifications.push({
            id: "next-meal",
            type: "INFO",
            title: "Next Meal",
            message: "Upcoming: Bubur Ayam at 12:00 PM",
            link: "/dashboard/meals",
            timestamp: now
        })

    } catch (error) {
        console.error("Notification Check Error:", error)
    }

    return notifications
}
