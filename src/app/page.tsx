import { InventoryTable } from "@/components/InventoryTable"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Inventory Table</h1>
      <InventoryTable />
    </div>
  )
}

