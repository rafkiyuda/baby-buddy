'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ModeToggle } from '@/components/mode-toggle'
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Search, Filter, Star } from 'lucide-react'

// Dummy Product Data
const PRODUCTS = [
    {
        id: '1',
        name: 'Bubur Bayi Organik Beras Merah',
        price: 35000,
        image: '/products/bubur-beras-merah.jpg',
        category: 'Bubur',
        rating: 4.8,
        stock: 50,
        description: 'Bubur bayi organik dari beras merah pilihan, kaya serat dan nutrisi untuk si kecil usia 6+ bulan.'
    },
    {
        id: '2',
        name: 'Puree Alpukat Segar',
        price: 28000,
        image: '/products/puree-alpukat.jpg',
        category: 'Puree',
        rating: 4.9,
        stock: 30,
        description: 'Puree alpukat fresh tanpa pengawet, tinggi lemak sehat untuk perkembangan otak bayi.'
    },
    {
        id: '3',
        name: 'Snack Biskuit Wortel',
        price: 22000,
        image: '/products/biskuit-wortel.jpg',
        category: 'Snack',
        rating: 4.6,
        stock: 100,
        description: 'Biskuit lembut dengan kandungan wortel asli, cocok untuk latihan menggigit bayi 8+ bulan.'
    },
    {
        id: '4',
        name: 'Bubur Sayuran Campur',
        price: 32000,
        image: '/products/bubur-sayuran.jpg',
        category: 'Bubur',
        rating: 4.7,
        stock: 45,
        description: 'Campuran sayuran segar (bayam, wortel, labu) dalam bentuk bubur lembut untuk MPASI.'
    },
    {
        id: '5',
        name: 'Puree Pisang Ambon',
        price: 25000,
        image: '/products/puree-pisang.jpg',
        category: 'Puree',
        rating: 4.8,
        stock: 60,
        description: 'Puree pisang ambon premium, manis alami tanpa gula tambahan untuk bayi 6+ bulan.'
    },
    {
        id: '6',
        name: 'Tepung Gasol Beras Putih',
        price: 45000,
        image: '/products/tepung-gasol.jpg',
        category: 'Bahan Dasar',
        rating: 4.9,
        stock: 80,
        description: 'Tepung beras organik berkualitas tinggi untuk membuat MPASI rumahan yang sehat.'
    },
    {
        id: '7',
        name: 'Kaldu Ayam Kampung MPASI',
        price: 38000,
        image: '/products/kaldu-ayam.jpg',
        category: 'Bahan Dasar',
        rating: 4.7,
        stock: 40,
        description: 'Kaldu ayam kampung tanpa MSG, rendah garam, khusus untuk memasak MPASI.'
    },
    {
        id: '8',
        name: 'Snack Puff Ubi Ungu',
        price: 18000,
        image: '/products/puff-ubi.jpg',
        category: 'Snack',
        rating: 4.5,
        stock: 120,
        description: 'Snack puff lembut dari ubi ungu, mudah larut di mulut, aman untuk bayi belajar makan.'
    },
]

const CATEGORIES = ['Semua', 'Bubur', 'Puree', 'Snack', 'Bahan Dasar']

interface CartItem {
    product: typeof PRODUCTS[0]
    quantity: number
}

export default function MarketplacePage() {
    const [cart, setCart] = useState<CartItem[]>([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState('Semua')
    const [searchQuery, setSearchQuery] = useState('')
    const [checkoutStep, setCheckoutStep] = useState<'browse' | 'cart' | 'checkout' | 'success'>('browse')

    const filteredProducts = PRODUCTS.filter(product => {
        const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const addToCart = (product: typeof PRODUCTS[0]) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id)
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prev, { product, quantity: 1 }]
        })
    }

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId))
    }

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev =>
            prev.map(item => {
                if (item.product.id === productId) {
                    const newQty = item.quantity + delta
                    return newQty > 0 ? { ...item, quantity: newQty } : item
                }
                return item
            }).filter(item => item.quantity > 0)
        )
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
    }

    if (checkoutStep === 'success') {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <MarketplaceHeader totalItems={totalItems} onCartClick={() => setCheckoutStep('cart')} />
                <main className="flex-1 flex items-center justify-center p-6">
                    <Card className="max-w-md w-full text-center glass">
                        <CardHeader>
                            <div className="text-6xl mb-4">🎉</div>
                            <CardTitle className="text-2xl">Pesanan Berhasil!</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Terima kasih! Pesanan Anda sedang diproses dan akan segera dikirim.
                            </p>
                            <p className="font-medium">
                                Nomor Pesanan: <span className="text-primary">BN-{Date.now().toString().slice(-8)}</span>
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => { setCart([]); setCheckoutStep('browse') }}>
                                Kembali Belanja
                            </Button>
                        </CardFooter>
                    </Card>
                </main>
            </div>
        )
    }

    if (checkoutStep === 'checkout') {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <MarketplaceHeader totalItems={totalItems} onCartClick={() => setCheckoutStep('cart')} />
                <main className="flex-1 container mx-auto px-4 py-8">
                    <Button variant="ghost" onClick={() => setCheckoutStep('cart')} className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Keranjang
                    </Button>
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <Card className="glass">
                                <CardHeader>
                                    <CardTitle>Alamat Pengiriman</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input placeholder="Nama Lengkap" defaultValue="Budi Parent" />
                                    <Input placeholder="Nomor Telepon" defaultValue="081234567890" />
                                    <Input placeholder="Alamat Lengkap" defaultValue="Jl. Keluarga Bahagia No. 123" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input placeholder="Kota" defaultValue="Jakarta Selatan" />
                                        <Input placeholder="Kode Pos" defaultValue="12345" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="glass">
                                <CardHeader>
                                    <CardTitle>Metode Pembayaran</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {['Transfer Bank', 'E-Wallet (GoPay/OVO)', 'COD'].map(method => (
                                        <label key={method} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors">
                                            <input type="radio" name="payment" defaultChecked={method === 'Transfer Bank'} className="accent-primary" />
                                            <span>{method}</span>
                                        </label>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                            <Card className="glass sticky top-24">
                                <CardHeader>
                                    <CardTitle>Ringkasan Pesanan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.product.id} className="flex justify-between text-sm">
                                            <span>{item.product.name} x{item.quantity}</span>
                                            <span>{formatPrice(item.product.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(totalPrice)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Ongkos Kirim</span>
                                            <span>{formatPrice(15000)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                            <span>Total</span>
                                            <span className="text-primary">{formatPrice(totalPrice + 15000)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full h-12 text-lg" onClick={() => setCheckoutStep('success')}>
                                        Bayar Sekarang
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    if (checkoutStep === 'cart') {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <MarketplaceHeader totalItems={totalItems} onCartClick={() => setCheckoutStep('cart')} />
                <main className="flex-1 container mx-auto px-4 py-8">
                    <Button variant="ghost" onClick={() => setCheckoutStep('browse')} className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Lanjut Belanja
                    </Button>
                    <h1 className="text-3xl font-bold mb-8">Keranjang Belanja</h1>
                    {cart.length === 0 ? (
                        <Card className="glass text-center py-12">
                            <CardContent>
                                <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground text-lg">Keranjang Anda masih kosong.</p>
                                <Button className="mt-4" onClick={() => setCheckoutStep('browse')}>
                                    Mulai Belanja
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                {cart.map(item => (
                                    <Card key={item.product.id} className="glass flex items-center p-4 gap-4">
                                        <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl">
                                            🍼
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{item.product.name}</h3>
                                            <p className="text-primary font-medium">{formatPrice(item.product.price)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="icon" variant="outline" onClick={() => updateQuantity(item.product.id, -1)}>
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <Button size="icon" variant="outline" onClick={() => updateQuantity(item.product.id, 1)}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Button size="icon" variant="ghost" className="text-red-500" onClick={() => removeFromCart(item.product.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                            <div>
                                <Card className="glass sticky top-24">
                                    <CardHeader>
                                        <CardTitle>Ringkasan</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Item</span>
                                            <span>{totalItems}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>{formatPrice(totalPrice)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg pt-3 border-t">
                                            <span>Total</span>
                                            <span className="text-primary">{formatPrice(totalPrice)}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full h-12 text-lg" onClick={() => setCheckoutStep('checkout')}>
                                            Checkout
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        )
    }

    // Browse Products
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <MarketplaceHeader totalItems={totalItems} onCartClick={() => setCheckoutStep('cart')} />

            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Hero Banner */}
                <div className="rounded-2xl bg-gradient-to-r from-primary/90 to-accent/90 text-white p-8 mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Bahan MPASI Berkualitas</h1>
                    <p className="text-white/80 max-w-xl">Temukan berbagai bahan makanan sehat untuk si kecil. Semua produk telah terverifikasi aman dan bergizi.</p>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari produk..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {CATEGORIES.map(cat => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory(cat)}
                                className="whitespace-nowrap"
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <Card key={product.id} className="group glass overflow-hidden hover:shadow-xl transition-all duration-300">
                            <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                                🍼
                            </div>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-1 text-yellow-500 text-sm mb-1">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span>{product.rating}</span>
                                </div>
                                <h3 className="font-semibold line-clamp-2 min-h-[3rem]">{product.name}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                                <p className="text-lg font-bold text-primary mt-2">{formatPrice(product.price)}</p>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <Button className="w-full" onClick={() => addToCart(product)}>
                                    <Plus className="h-4 w-4 mr-2" /> Tambah
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">Tidak ada produk yang ditemukan.</p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="py-8 border-t text-center text-sm text-muted-foreground">
                © 2026 BabyBuddy Marketplace. Semua produk aman untuk bayi.
            </footer>
        </div>
    )
}

function MarketplaceHeader({ totalItems, onCartClick }: { totalItems: number; onCartClick: () => void }) {
    return (
        <header className="sticky top-0 z-50 border-b glass px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                BabyBuddy
            </Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <Link href="/marketplace" className="text-primary font-semibold">Marketplace</Link>
                <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            </nav>
            <div className="flex gap-4 items-center">
                <ModeToggle />
                <Button variant="outline" className="relative" onClick={onCartClick}>
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                            {totalItems}
                        </span>
                    )}
                </Button>
            </div>
        </header>
    )
}
