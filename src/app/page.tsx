import { InventoryTable } from "@/components/InventoryTable"
import { Suspense } from "react"

export default function Home() {
  return (
    <div className="max-w-[80%] mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Inventory Table</h1>
      <Suspense>
        <InventoryTable />
      </Suspense>
    </div>
  )
}

