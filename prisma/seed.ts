import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding meals packages...')

    const packages = [
        // Budget-Friendly Packages (100k-300k)
        {
            name: 'Paket Hemat MPASI 6-8 Bulan',
            description: 'Paket bulanan ekonomis untuk pemula MPASI dengan bubur organik dan puree buah',
            price: 150000,
            ageMinMonths: 6,
            ageMaxMonths: 8,
            location: 'All Indonesia',
            category: 'Paket Lengkap',
            nutritionalBenefits: ['Karbohidrat kompleks', 'Vitamin C', 'Serat'],
        },
        {
            name: 'Bubur Bayi Organik Beras Merah',
            description: 'Bubur instan organik beras merah, kaya serat dan zat besi',
            price: 35000,
            ageMinMonths: 6,
            ageMaxMonths: 12,
            location: 'Jakarta',
            category: 'Bubur',
            nutritionalBenefits: ['Zat Besi', 'Serat', 'Vitamin B'],
        },
        {
            name: 'Puree Alpukat Segar',
            description: 'Puree alpukat premium, tinggi lemak sehat untuk perkembangan otak',
            price: 28000,
            ageMinMonths: 6,
            ageMaxMonths: 12,
            location: 'Jakarta',
            category: 'Puree',
            nutritionalBenefits: ['Lemak Sehat', 'Vitamin E', 'Folat'],
        },
        {
            name: 'Paket Mingguan MPASI Organik',
            description: 'Paket 7 hari dengan variasi bubur dan puree organik',
            price: 280000,
            ageMinMonths: 6,
            ageMaxMonths: 10,
            location: 'Bandung',
            category: 'Paket Lengkap',
            nutritionalBenefits: ['Protein', 'Vitamin A', 'Zat Besi', 'Kalsium'],
        },

        // Medium Range Packages (300k-600k)
        {
            name: 'Paket Premium MPASI 8-12 Bulan',
            description: 'Paket bulanan premium dengan menu bervariasi termasuk protein hewani',
            price: 450000,
            ageMinMonths: 8,
            ageMaxMonths: 12,
            location: 'All Indonesia',
            category: 'Paket Lengkap',
            nutritionalBenefits: ['Protein Hewani', 'Zat Besi', 'Omega-3', 'Kalsium'],
        },
        {
            name: 'Kaldu Ayam Kampung MPASI',
            description: 'Kaldu ayam kampung organik, kaya protein dan kolagen',
            price: 38000,
            ageMinMonths: 6,
            ageMaxMonths: 24,
            location: 'Surabaya',
            category: 'Bahan Dasar',
            nutritionalBenefits: ['Protein', 'Kolagen', 'Mineral'],
        },
        {
            name: 'Bubur Sayuran Campur Premium',
            description: 'Bubur dengan campuran 5 sayuran organik pilihan',
            price: 42000,
            ageMinMonths: 6,
            ageMaxMonths: 12,
            location: 'Jakarta',
            category: 'Bubur',
            nutritionalBenefits: ['Vitamin A', 'Vitamin C', 'Serat', 'Beta Karoten'],
        },
        {
            name: 'Paket Protein Booster 12-18 Bulan',
            description: 'Paket khusus tinggi protein untuk pertumbuhan optimal',
            price: 520000,
            ageMinMonths: 12,
            ageMaxMonths: 18,
            location: 'All Indonesia',
            category: 'Paket Lengkap',
            nutritionalBenefits: ['Protein Tinggi', 'Zat Besi', 'Zinc', 'Vitamin B12'],
        },

        // Premium Packages (600k+)
        {
            name: 'Paket Elite MPASI 6-12 Bulan',
            description: 'Paket lengkap bulanan super premium dengan organic superfood',
            price: 850000,
            ageMinMonths: 6,
            ageMaxMonths: 12,
            location: 'Jakarta',
            category: 'Paket Lengkap',
            nutritionalBenefits: ['Superfood', 'Omega-3 DHA', 'Probiotik', 'Vitamin Lengkap'],
        },
        {
            name: 'Paket Gourmet MPASI 18-24 Bulan',
            description: 'Menu gourmet untuk batita dengan variasi internasional',
            price: 780000,
            ageMinMonths: 18,
            ageMaxMonths: 24,
            location: 'Bandung',
            category: 'Paket Lengkap',
            nutritionalBenefits: ['Protein Premium', 'Omega-3', 'Kalsium Tinggi', 'Zat Besi'],
        },

        // Individual Items
        {
            name: 'Snack Biskuit Wortel Organik',
            description: 'Biskuit sehat untuk finger food, tinggi beta karoten',
            price: 22000,
            ageMinMonths: 8,
            ageMaxMonths: 24,
            location: 'All Indonesia',
            category: 'Snack',
            nutritionalBenefits: ['Beta Karoten', 'Serat', 'Kalsium'],
        },
        {
            name: 'Puree Pisang Ambon Premium',
            description: 'Puree pisang organik, mudah dicerna dan tinggi kalium',
            price: 25000,
            ageMinMonths: 6,
            ageMaxMonths: 12,
            location: 'Surabaya',
            category: 'Puree',
            nutritionalBenefits: ['Kalium', 'Vitamin B6', 'Energi'],
        },
        {
            name: 'Tepung Gasol Beras Putih Organik',
            description: 'Tepung beras organik berkualitas tinggi untuk bubur',
            price: 45000,
            ageMinMonths: 6,
            ageMaxMonths: 24,
            location: 'All Indonesia',
            category: 'Bahan Dasar',
            nutritionalBenefits: ['Karbohidrat', 'Gluten Free', 'Mudah Dicerna'],
        },
        {
            name: 'Snack Puff Ubi Ungu',
            description: 'Snack organik ubi ungu, tinggi antioksidan',
            price: 18000,
            ageMinMonths: 8,
            ageMaxMonths: 24,
            location: 'Bandung',
            category: 'Snack',
            nutritionalBenefits: ['Antioksidan', 'Serat', 'Vitamin A'],
        },
        {
            name: 'Paket Kaya Zat Besi 6-10 Bulan',
            description: 'Paket khusus untuk mencegah anemia dengan menu tinggi zat besi',
            price: 380000,
            ageMinMonths: 6,
            ageMaxMonths: 10,
            location: 'Jakarta',
            category: 'Paket Lengkap',
            nutritionalBenefits: ['Zat Besi Tinggi', 'Vitamin C', 'Folat', 'Protein'],
        },
        {
            name: 'Paket Pertumbuhan Cepat 12-24 Bulan',
            description: 'Paket nutrisi lengkap untuk masa pertumbuhan pesat',
            price: 950000,
            ageMinMonths: 12,
            ageMaxMonths: 24,
            location: 'All Indonesia',
            category: 'Paket Lengkap',
            nutritionalBenefits: ['Protein Lengkap', 'Kalsium Tinggi', 'Vitamin D', 'DHA', 'Probiotik'],
        },
        {
            name: 'Paket Hemat Mingguan 8-12 Bulan',
            description: 'Paket ekonomis 1 minggu dengan nutrisi seimbang',
            price: 195000,
            ageMinMonths: 8,
            ageMaxMonths: 12,
            location: 'Surabaya',
            category: 'Paket Lengkap',
            nutritionalBenefits: ['Protein', 'Karbohidrat', 'Vitamin', 'Mineral'],
        },
        {
            name: 'Paket Alergi-Friendly 6-18 Bulan',
            description: 'Paket khusus untuk anak dengan alergi, tanpa dairy, telur, dan kacang',
            price: 580000,
            ageMinMonths: 6,
            ageMaxMonths: 18,
            location: 'All Indonesia',
            category: 'Paket Lengkap',
            nutritionalBenefits: ['Hypoallergenic', 'Protein Alternatif', 'Vitamin B12', 'Kalsium'],
        },
    ]

    for (const pkg of packages) {
        await prisma.mealsPackage.create({
            data: pkg,
        })
    }

    console.log(`✅ Created ${packages.length} meals packages`)
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
