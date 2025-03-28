
export const BASE_DATA_FILENAME = 'corollahybrid.json'

export const ENDPOINTS = {
    dates: '/api/listFiles',
    inventory: '/api/inventory'
}

export const TODAY = new Intl.DateTimeFormat('en-CA').format(new Date).replaceAll("-", "_")