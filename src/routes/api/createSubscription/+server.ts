import { json, type RequestHandler } from '@sveltejs/kit';

export async function POST({ request, locals, platform }) {
    console.log("In POST...")
    let parsedBody = await request.json();
    let shouldSubscribe = false;
    console.log("Received data", parsedBody);

    const DB = platform.env.DB;
    const create_result = await DB.prepare(`
        CREATE TABLE IF NOT EXISTS subscriptions(
        endpoint varchar(512),
        expiration_time timestamp,
        key_auth varchar(64),
        key_p256dh varchar(128)
    );
`).run();
    console.log("create result", create_result);
    

    const find_subscription_result = await DB.prepare(`
        SELECT * FROM subscriptions
        WHERE endpoint = ?1        
`).bind(parsedBody.endpoint).run();
    console.log("select result", find_subscription_result);

    // 3 cases to handles
    // first subscription 
    if (find_subscription_result.results?.length === 0) {
        shouldSubscribe = true;
    }

    if (find_subscription_result.results?.length === 1) {
        const firstResult = find_subscription_result.results[0]
        if (firstResult.expiration_time !== null) {
            new Error("Unhandled case, should check expiration time");
        }
    }

    if (find_subscription_result.results?.length > 1) {
        new Error("Unhandled case, a subscription endpoint should not be duplicated");
    }

    if (shouldSubscribe) {
        console.log("Subscribing user...")
        console.log("Values",
            "endpoint", parsedBody.endpoint,
            "expiration_time", parsedBody.expirationTime,
            "keys.auth", parsedBody.keys.auth,
            "keys.p256dh", parsedBody.keys.p256dh
        )

        const insert_result = await DB.prepare(`
            INSERT INTO subscriptions(endpoint, expiration_time, key_auth, key_p256dh)
            VALUES (?1, ?2, ?3, ?4)     
    `).bind(
            parsedBody.endpoint,
            parsedBody.expirationTime,
            parsedBody.keys.auth,
            parsedBody.keys.p256dh
        ).run();
        console.log("insert result", insert_result);    
    }

    const response = { "subscription": "success", "new_subscription": shouldSubscribe};
    console.log(response);
    return json(response)
}
