import fs from 'fs';
import path from 'path';

export async function GET() {
    const publicDir = path.join(process.cwd(), 'public')
    const files = fs.readdirSync(publicDir)

    const dates = files
        .filter((file) => file.includes('corollahybrid.json'))
        .map((file) => /\d{4}_\d{2}_\d{2}/.exec(file)?.[0])
    ;

    return new Response(JSON.stringify(dates), {
        headers: { 'Content-Type': 'application/json' }
    })
    
}