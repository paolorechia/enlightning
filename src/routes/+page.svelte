<script lang="ts">
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
	import { onMount  } from 'svelte';
	import { dev } from '$app/environment';


	let isSubscribed = false;
	let notifPermGranted = null;

	onMount(async () => {
		notifPermGranted = Notification.permission === 'granted';
		console.log("notifPermGranted", notifPermGranted)
		if (notifPermGranted) {
			console.log("Checking status...")
			isSubscribed = await checkSubscriptionStatus();
			console.log("Is Subscribed", isSubscribed);

			if (!isSubscribed) {
				await subscribeUser();
			}
		}
	})

	function requestNotificationPermission() {
		Notification.requestPermission().then((permission) => {
			if (permission === 'granted') {
				new Notification('You are now subscribed to notifications!');
			}
		});
	}

	async function subscribeUser() {
		console.log('serviceWorker in subscribeUser', 'serviceWorker' in navigator);
		if ('serviceWorker' in navigator) {
			try {
				const res = await fetch('/api/vapidPubKey');
				const { data } = await res.json();

				const registration = await navigator.serviceWorker.ready;
				const subscription = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: data
				})
				fetch('/api/createSubscription', {
					body: JSON.stringify(subscription),
					method: "POST",
				})
				isSubscribed = true;
				console.log("subscription", JSON.stringify(subscription));
			} catch (err) {
				console.error('Error subscribing', err);
			}		
		}
	}

	async function unsubscribeUser() {
		if ('serviceWorker' in navigator) {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();
			if (subscription) {
				await subscription.unsubscribe();
				isSubscribed = false;
			}
		}
	}

	async function checkSubscriptionStatus() {
		console.log('serviceWorker in checkSubscriptionStatus', 'serviceWorker' in navigator);

		if ('serviceWorker' in navigator) {
			console.log("Awaiting service worker to be ready...")
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();
			console.log("subscription", JSON.stringify(subscription));
			if (subscription !== null) {
				fetch('/api/createSubscription', {
					body: JSON.stringify(subscription),
					method: "POST",
				})
			}
			return subscription !== null;
		}
		return false;
	}


</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>
		<span class="welcome">
			<picture>
				<source srcset={welcome} type="image/webp" />
				<img src={welcome_fallback} alt="Welcome" />
			</picture>
		</span>

		to your new<br />SvelteKit app
	</h1>

	<button on:click={requestNotificationPermission}> Enable notifications </button>
	<!-- <button on:click={subscribeUser}> Subscribe to push notifications </button> -->

	<h3>
		Is subscribed: { isSubscribed }
	</h3>

	<button on:click={unsubscribeUser}> Unsubscribe </button>

</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
