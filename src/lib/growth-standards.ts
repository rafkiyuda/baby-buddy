// WHO Child Growth Standards (Simplified LMS Data for 0-60 months)
// Source adaptation for MVP: 
// We will store a subset of data points (every month) for Weight-for-Age (WFA) and Length/Height-for-Age (HFA).

type Gender = "MALE" | "FEMALE";

interface LMSDataPoint {
    month: number;
    L: number;
    M: number;
    S: number;
}

// Simplified Data: 0, 3, 6, 9, 12... 60 months (Interpolation needed for exact usage, but closest month is fine for MVP)
// Real implementation would have a JSON or DB table. Here we use a small lookup for demo.

const WFA_BOYS: LMSDataPoint[] = [
    { month: 0, L: 0.1815, M: 3.5302, S: 0.1523 },
    { month: 3, L: 0.1746, M: 6.4237, S: 0.1287 },
    { month: 6, L: 0.1504, M: 7.9351, S: 0.1177 },
    { month: 12, L: 0.1245, M: 9.6133, S: 0.1145 },
    { month: 24, L: 0.0886, M: 12.1517, S: 0.1102 },
    { month: 36, L: 0.0461, M: 14.3312, S: 0.1147 },
    { month: 48, L: 0.0076, M: 16.3292, S: 0.1220 },
    { month: 60, L: -0.0263, M: 18.2882, S: 0.1306 },
];

const WFA_GIRLS: LMSDataPoint[] = [
    { month: 0, L: 0.3809, M: 3.3991, S: 0.1477 },
    { month: 3, L: 0.3541, M: 5.9520, S: 0.1278 },
    { month: 6, L: 0.2889, M: 7.3013, S: 0.1207 },
    { month: 12, L: 0.2307, M: 8.9419, S: 0.1166 },
    { month: 24, L: 0.1632, M: 11.4795, S: 0.1158 },
    { month: 36, L: 0.1343, M: 13.7850, S: 0.1227 },
    { month: 48, L: 0.1302, M: 15.8242, S: 0.1326 },
    { month: 60, L: 0.1548, M: 17.7591, S: 0.1432 },
];

// Helper to find closest data point (basic interpolation could be added)
function getLMS(gender: Gender, ageMonths: number, type: 'WFA' | 'HFA'): LMSDataPoint | undefined {
    // For MVP, we only implemented WFA. HFA would be similar.
    // We'll map exact or find nearest (simple version).

    const dataset = gender === 'MALE' ? WFA_BOYS : WFA_GIRLS;

    // Simple nearest neighbor or just use the floor/closest.
    // Let's just find the closest defined point in our small set for MVP visualization.
    // In production, we'd have all 60 months.
    return dataset.reduce((prev, curr) => {
        return (Math.abs(curr.month - ageMonths) < Math.abs(prev.month - ageMonths) ? curr : prev);
    });
}

export function calculateZScore(
    measurement: number,
    gender: Gender,
    dob: Date,
    type: 'WFA' | 'HFA' = 'WFA' // Default Weight for Age
): { zScore: number; percentile: number; status: string } {

    const now = new Date();
    const ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());

    const lms = getLMS(gender, ageMonths, type);

    if (!lms) return { zScore: 0, percentile: 50, status: 'Unknown' };

    const { L, M, S } = lms;

    // Z Calculation: ((X/M)^L - 1) / (L*S)
    let zScore = 0;
    if (Math.abs(L) < 0.01) {
        zScore = Math.log(measurement / M) / S;
    } else {
        zScore = (Math.pow(measurement / M, L) - 1) / (L * S);
    }

    // Status Classification
    let status = "Normal";
    if (zScore < -3) status = "Severely Underweight";
    else if (zScore < -2) status = "Underweight";
    else if (zScore > 3) status = "Obese";
    else if (zScore > 2) status = "Overweight"; // For WFA, >1 is 'risk of overweight' technically

    // Approx Percentile from Z (std normal distribution)
    // Simplified approximation
    const percentile = (0.5 * (1 + (Math as any).erf(zScore / Math.sqrt(2)))) * 100;

    return {
        zScore: parseFloat(zScore.toFixed(2)),
        percentile: parseFloat(percentile.toFixed(1)),
        status
    };
}

// Math.erf implementation wrapper if needed, but modern JS environments support standard math libraries or we verify.
// Math.erf is not standard in older JS. Adding a polyfill for safety if environment is strict.
// Polyfill for Math.erf
if (!(Math as any).erf) {
    (Math as any).erf = function (x: number) {
        // Save the sign of x
        var sign = (x >= 0) ? 1 : -1;
        x = Math.abs(x);
        // Constants
        var a1 = 0.254829592;
        var a2 = -0.284496736;
        var a3 = 1.421413741;
        var a4 = -1.453152027;
        var a5 = 1.061405429;
        var p = 0.3275911;

        // A&S formula 7.1.26
        var t = 1.0 / (1.0 + p * x);
        var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        return sign * y;
    };
}
