import { calculateZScore } from "./src/lib/growth-standards";

const dob = new Date();
dob.setMonth(dob.getMonth() - 24); // 2 years old (24 months)

// WHO median for Boy 24 months is approx 12.15 kg.
// Input 12.15 should yield Z ~ 0.
const resultNormal = calculateZScore(12.15, "MALE", dob);
console.log("Normal Weight (2yo Boy, 12.15kg):", resultNormal);

// Input 10kg (Underweight)
const resultUnder = calculateZScore(10, "MALE", dob);
console.log("Underweight (2yo Boy, 10kg):", resultUnder);

// Input 15kg (Overweight)
const resultOver = calculateZScore(15, "MALE", dob);
console.log("Overweight (2yo Boy, 15kg):", resultOver);
