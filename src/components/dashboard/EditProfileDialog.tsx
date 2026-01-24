"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateChildProfile } from "@/lib/actions"
import { Pencil } from "lucide-react"

interface Profile {
    id: string
    name: string
    dob: Date | null
    gender: "MALE" | "FEMALE" | null
    allergies: string[]
}

export function EditProfileDialog({ profile }: { profile: Profile }) {
    const [open, setOpen] = useState(false)

    // Format Date for Input
    const dateValue = profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : ""
    const allergiesValue = profile.allergies ? profile.allergies.join(", ") : ""

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form action={async (formData) => {
                    await updateChildProfile(profile.id, null, formData)
                    setOpen(false)
                }} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Anak</Label>
                        <Input id="name" name="name" defaultValue={profile.name} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dob">Tanggal Lahir</Label>
                        <Input id="dob" name="dob" type="date" defaultValue={dateValue} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gender">Jenis Kelamin</Label>
                        <Select name="gender" defaultValue={profile.gender || "MALE"}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MALE">Laki-laki</SelectItem>
                                <SelectItem value="FEMALE">Perempuan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="allergies">Alergi (pisahkan dengan koma)</Label>
                        <Input id="allergies" name="allergies" defaultValue={allergiesValue} placeholder="Contoh: Udang, Kacang, Debu" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit">Simpan Perubahan</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
