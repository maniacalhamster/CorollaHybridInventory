export type OptionDataType = {
  optionCd: string,
  marketingName: string,
  marketingLongName: string,
  optionType: 'F' | 'P' | 'D',
}
export interface InventoryItem {
  vin: string
  distance: number
  dealer: string
  model: string
  color: string
  seating: string
  msrp: number
  tsrp: number
  markup: number
  price: number
  dioTsrp: number
  dioPrice: number
  options: OptionDataType[],
  status: status,
  estDate: string,
  presold: boolean
  link: string
}

type status = 'build' | 'transit' | 'available'

const dateRegExp = /\d{2}\/\d{2}\/\d{2}/
const rangeRegExp = new RegExp(`${dateRegExp.source} - ${dateRegExp.source}`)

function statusResolver (c: string): status {
  if (/build/.exec(c)) return 'build'
  if (/transit/.exec(c)) return 'transit'
  return 'available'
}

function estDateResolver (c: string): string { 
  return (rangeRegExp.exec(c)??[""])[0]
};

export function sortOptions(a: OptionDataType, b: OptionDataType) {
  // prio Factory, Port, then Dealer options (i.e. mandatory -> optional)
  const optionTypeOrder = {
    'F': 2,
    'P': 1,
    'D': 0
  }

  // first, try to prio by type
  const [aPrio, bPrio] = [optionTypeOrder[a.optionType], optionTypeOrder[b.optionType]]
  if (aPrio > bPrio) return -1
  if (aPrio < bPrio) return 1

  // then alphabetically by optionCD name
  return a.optionCd.localeCompare(b.optionCd)
}

export async function fetchInventoryData(): Promise<InventoryItem[]> {
  const response = await fetch("./corollahybrid.json")
  const rawData = await response.json()

  return rawData.map((item: any) => ({
    vin: item.vin,
    distance: item.distance,
    dealer: item.dealerMarketingName,
    model: item.model.marketingName,
    color: item.extColor.marketingName,
    seating: item.intColor.marketingName,
    msrp: item.price.baseMsrp,
    tsrp: item.price.totalMsrp,
    markup: (item.price.advertizedPrice || item.price.sellingPrice) - item.price.totalMsrp,
    price: item.price.advertizedPrice || item.price.sellingPrice,
    dioTsrp: item.price.dioTotalMsrp,
    dioPrice: item.price.dioTotalDealerSellingPrice,
    options: item.options ? item.options.sort(sortOptions) : [],
    status: statusResolver(item.inventoryStatus),
    estDate: estDateResolver(item.inventoryStatus),
    presold: item.isPreSold,
    link: `https://smartpath.toyota.com/inventory/details?source=t1&dealerCd=${item.dealerCd}&vin=${item.vin}&type=new`,
  }))
}

