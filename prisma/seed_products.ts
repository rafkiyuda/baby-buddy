
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const PRODUCTS = [
    {
        name: 'Bubur Bayi Organik Beras Merah',
        price: 35000,
        category: 'Bubur',
        description: 'Bubur bayi organik dari beras merah pilihan, kaya serat dan nutrisi untuk si kecil usia 6+ bulan.',
        ageMinMonths: 6,
        ageMaxMonths: 24,
        location: 'All Indonesia',
        nutritionalBenefits: ['High Fiber', 'Organic'],
    },
    {
        name: 'Puree Alpukat Segar',
        price: 28000,
        category: 'Puree',
        description: 'Puree alpukat fresh tanpa pengawet, tinggi lemak sehat untuk perkembangan otak bayi.',
        ageMinMonths: 6,
        ageMaxMonths: 12,
        location: 'Jakarta',
        nutritionalBenefits: ['Healthy Fats', 'Brain Development'],
    },
    {
        name: 'Snack Biskuit Wortel',
        price: 22000,
        category: 'Snack',
        description: 'Biskuit lembut dengan kandungan wortel asli, cocok untuk latihan menggigit bayi 8+ bulan.',
        ageMinMonths: 8,
        ageMaxMonths: 36,
        location: 'All Indonesia',
        nutritionalBenefits: ['Vitamin A', 'Motor Skills'],
    },
    {
        name: 'Bubur Sayuran Campur',
        price: 32000,
        category: 'Bubur',
        description: 'Campuran sayuran segar (bayam, wortel, labu) dalam bentuk bubur lembut untuk MPASI.',
        ageMinMonths: 6,
        ageMaxMonths: 12,
        location: 'Jakarta',
        nutritionalBenefits: ['Vitamins', 'Fiber'],
    },
    {
        name: 'Puree Pisang Ambon',
        price: 25000,
        category: 'Puree',
        description: 'Puree pisang ambon premium, manis alami tanpa gula tambahan untuk bayi 6+ bulan.',
        ageMinMonths: 6,
        ageMaxMonths: 12,
        location: 'All Indonesia',
        nutritionalBenefits: ['Potassium', 'Natural Energy'],
    },
    {
        name: 'Tepung Gasol Beras Putih',
        price: 45000,
        category: 'Bahan Dasar',
        description: 'Tepung beras organik berkualitas tinggi untuk membuat MPASI rumahan yang sehat.',
        ageMinMonths: 6,
        ageMaxMonths: 60,
        location: 'All Indonesia',
        nutritionalBenefits: ['Carbohydrates', 'Organic'],
    },
    {
        name: 'Kaldu Ayam Kampung MPASI',
        price: 38000,
        category: 'Bahan Dasar',
        description: 'Kaldu ayam kampung tanpa MSG, rendah garam, khusus untuk memasak MPASI.',
        ageMinMonths: 6,
        ageMaxMonths: 60,
        location: 'Jakarta',
        nutritionalBenefits: ['Protein', 'No MSG'],
    },
    {
        name: 'Snack Puff Ubi Ungu',
        price: 18000,
        category: 'Snack',
        description: 'Snack puff lembut dari ubi ungu, mudah larut di mulut, aman untuk bayi belajar makan.',
        ageMinMonths: 8,
        ageMaxMonths: 36,
        location: 'All Indonesia',
        nutritionalBenefits: ['Antioxidants', 'Self-feeding'],
    },
]

async function main() {
    console.log(`Start seeding products...`)
    for (const p of PRODUCTS) {
        const product = await prisma.mealsPackage.create({
            data: {
                name: p.name,
                description: p.description,
                price: p.price,
                ageMinMonths: p.ageMinMonths,
                ageMaxMonths: p.ageMaxMonths,
                location: p.location,
                category: p.category,
                nutritionalBenefits: p.nutritionalBenefits,
                isActive: true
            }
        })
        console.log(`Created product with id: ${product.id}`)
    }
    console.log(`Seeding finished.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
