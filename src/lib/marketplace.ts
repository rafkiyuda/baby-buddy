export interface ShoppingItem {
    name: string;
    count: number; // Simple frequency counter for MVP
    category: "Produce" | "Protein" | "Pantry" | "Other"; // Mock categorization
}

export function aggregateIngredients(mealPlanJson: any): ShoppingItem[] {
    if (!mealPlanJson || !mealPlanJson.weeklyPlan) return [];

    const ingredientMap = new Map<string, number>();

    mealPlanJson.weeklyPlan.forEach((day: any) => {
        if (day.meals) {
            Object.values(day.meals).forEach((meal: any) => {
                if (meal.ingredients && Array.isArray(meal.ingredients)) {
                    meal.ingredients.forEach((ing: string) => {
                        // Normalize: lowercase and trim
                        const normalized = ing.toLowerCase().trim();
                        ingredientMap.set(normalized, (ingredientMap.get(normalized) || 0) + 1);
                    });
                }
            });
        }
    });

    // Convert map to array
    return Array.from(ingredientMap.entries()).map(([name, count]) => {
        return {
            name: capitalize(name),
            count,
            category: categorizeIngredient(name),
        };
    }).sort((a, b) => a.category.localeCompare(b.category));
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// Simple mock categorization based on keywords
function categorizeIngredient(name: string): "Produce" | "Protein" | "Pantry" | "Other" {
    const lower = name.toLowerCase();

    if (["chicken", "beef", "fish", "egg", "tofu", "tempeh", "shrimp", "salmon", "meat"].some(k => lower.includes(k))) return "Protein";
    if (["spinach", "carrot", "broccoli", "apple", "banana", "fruit", "vegetable", "onion", "garlic", "tomato", "potato"].some(k => lower.includes(k))) return "Produce";
    if (["rice", "oil", "salt", "pepper", "soy sauce", "sugar", "flour", "bread", "pasta"].some(k => lower.includes(k))) return "Pantry";

    return "Other";
}
