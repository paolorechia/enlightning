import { json, type RequestHandler } from '@sveltejs/kit';
import {
    buildPushPayload,
    type PushSubscription,
    type PushMessage,
    type VapidKeys,
  } from '@block65/webcrypto-web-push';
import { VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } from '$env/static/private';


// {
//     endpoint: 'https://updates.push.services.mozilla.com/wpush/v2/gAAAAABm5s5rwB-NrD5KOUGszWqlwivrPiUO6imiUBQhd7_tWMG98oKUZIGH1sHeWWnlnM7xyVDecjXpVbjY2rFDQnvosJTTDyYOi4ToUxtLOlyCHijVmAuF0yEJYVI7hkwvJkUfUi2HnWbf6BF4BAnTSpg4IY4y_dwYiFFvq5QpJDfzOd_5Z4Q',
//     expiration_time: null,
//     key_auth: 'Nxd6v1QuF7Coyc88agkzUQ',
//     key_p256dh: 'BF2Mj0O479cRwnELcWa7lYWQieeVlTrWRsHorQlAHk8u9kVgLkTes-tCDNSnghS4erIXxzngQ3Q-ruuOwzYxmmo'
// }

export async function POST({ request, locals, platform }) {
    console.log("In test subscription...")

    const vapid: VapidKeys = {
        subject: VAPID_SUBJECT,
        publicKey: VAPID_PUBLIC_KEY,
        privateKey: VAPID_PRIVATE_KEY,
    };

    const DB = platform.env.DB;
    const find_subscription_result = await DB.prepare(`
        SELECT * FROM subscriptions;
    `).run();
    console.log("select result", find_subscription_result);
    await Promise.all(find_subscription_result.results.map(
        async (subscription) => {
            const payload = await buildPushPayload(
                {
                    data: "Hello push notification!",
                    options: {ttl: 60},
                },    
                {
                    endpoint: subscription.endpoint,
                    expirationTime: subscription.expiration_time,
                    keys: {
                        auth: subscription.key_auth,
                        p256dh: subscription.key_p256dh,
                    }
                },
                vapid
            );
            const res = await fetch(subscription.endpoint, payload);
            console.log("webpush response status", res.status)
            try {
                const j = await res.json();                
                console.log("webpush response body", j);    
            } catch (err) {
                console.error(`error decoding JSON ${err}`)
            }

            // see status code meaning list for Mozilla in:
            // https://autopush.readthedocs.io/en/latest/http.html#error-codes
            if (res.status === 201) {
                return json({"test_subscription": "ok"})
            } else {
                // if not found or expired, should delete endpoint from database
                console.log("Invalid endpoint, deleting from database...")
                if (res.status === 404 || res.status === 410) {
                    await DB.prepare(`
                        DELETE FROM subscriptions
                        WHERE endpoint = ?1;
                    `).bind(subscription.endpoint).run()
                }

            }
        }
    ))

    return json({"test_subscription": "ok"})
}
