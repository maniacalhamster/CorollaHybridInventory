import { BASE_DATA_FILENAME } from '@/constants';
import { transformRawData } from '@/utils/transformData';
import fs from 'fs';
import { NextRequest } from 'next/server';
import path from 'path';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl
    const date = searchParams.get('date');

    const filename = (date ? `${date}_` : '') + BASE_DATA_FILENAME

    const dataFilePath = path.join(process.cwd(), 'public', filename)
    const rawData = fs.readFileSync(dataFilePath, 'utf-8')
    const jsonData = JSON.parse(rawData)

    const data = await transformRawData(jsonData)

    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json'}
    })
}
