import { json, type RequestHandler } from '@sveltejs/kit';

export async function GET({ request, locals, platform }) {
    console.log("In GET...")
    let parsedBody = await request.json();

    console.log("Received data", parsedBody);
    return json({ "hello": "world"})
}
