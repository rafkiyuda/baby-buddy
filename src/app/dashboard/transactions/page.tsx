import prisma from "@/lib/db"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, Truck, Clock, Package } from "lucide-react"

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
    const session = await getSession()
    if (!session || !session.userId) redirect("/login")

    // Fetch transactions with shipments
    const transactions = await prisma.transaction.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        include: { shipments: { orderBy: { day: 'asc' } } }
    })

    // Filter active shipments (from subscription transactions)
    const activeShipments = transactions.flatMap(t => t.shipments).filter(s => s.status !== 'DELIVERED' && s.status !== 'CANCELLED')

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <header>
                <h2 className="text-3xl font-bold tracking-tight">Riwayat Transaksi</h2>
                <p className="text-muted-foreground">
                    Lihat riwayat pembelian dan status pengiriman langganan Anda.
                </p>
            </header>

            <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="history">Riwayat Pembelian</TabsTrigger>
                    <TabsTrigger value="shipments">Status Pengiriman</TabsTrigger>
                </TabsList>

                {/* --- History Tab --- */}
                <TabsContent value="history" className="mt-6 space-y-4">
                    {transactions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground glass rounded-xl">
                            <p>Belum ada transaksi.</p>
                        </div>
                    ) : (
                        transactions.map(tx => (
                            <Card key={tx.id} className="glass">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={tx.type === 'SUBSCRIPTION' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}>
                                                    {tx.type === 'SUBSCRIPTION' ? 'Langganan' : 'Belanja'}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                                                        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                                                    })}
                                                </span>
                                            </div>
                                            <CardTitle className="text-lg">
                                                Order #{tx.id.slice(0, 8)}
                                            </CardTitle>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">Rp {tx.amount.toLocaleString("id-ID")}</p>
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                                {tx.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="details" className="border-b-0">
                                            <AccordionTrigger className="py-2 hover:no-underline">
                                                <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                                                    Lihat Rincian ({(tx.metadata as any)?.items?.length || 0} Item)
                                                </span>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="text-sm text-muted-foreground pt-2 space-y-2">
                                                    {(tx.metadata as any)?.items?.map((item: any, i: number) => (
                                                        <div key={i} className="flex justify-between py-1 border-b border-dashed last:border-0 border-muted">
                                                            <span>{item.qty}x {item.name}</span>
                                                            <span>Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* --- Shipments Tab --- */}
                <TabsContent value="shipments" className="mt-6 space-y-4">
                    {activeShipments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground glass rounded-xl">
                            <Truck className="mx-auto h-12 w-12 opacity-20 mb-3" />
                            <p>Tidak ada pengiriman aktif.</p>
                            <p className="text-sm">Pengiriman akan muncul jika Anda membeli paket langganan Meal Plan.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {activeShipments.map(shipment => (
                                <Card key={shipment.id} className="border-l-4 border-l-primary glass">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="p-3 bg-primary/10 rounded-full">
                                            <Package className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between">
                                                <h4 className="font-semibold">Hari ke-{shipment.day}</h4>
                                                <ShipmentStatusBadge status={shipment.status} />
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Jadwal: {new Date(shipment.date).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </p>
                                            <p className="text-xs text-muted-foreground italic">
                                                Order ID: {shipment.transactionId.slice(0, 8)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

function ShipmentStatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'PENDING': return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Menunggu</Badge>
        case 'PROCESSED': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Diproses</Badge>
        case 'SHIPPED': return <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Dikirim</Badge>
        case 'DELIVERED': return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Diterima</Badge>
        default: return <Badge variant="outline">{status}</Badge>
    }
}
