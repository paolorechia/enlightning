import { json, type RequestHandler } from '@sveltejs/kit';

export async function GET({ request, locals, platform }) {
    console.log("In Get", request);

    const DB = platform.env.DB;
    console.log("Your D1 DB", DB);

    return json({ "hello": "world"})
}
