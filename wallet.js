const fs = require('fs');
const _ = require('lodash');
// const qrCode = require('qrcode');
const moment = require('moment');
const server = require('@fwd/server');
const performance = require('perf_hooks').performance;
const NanoClient = require("@dev-ptera/nano-node-rpc").NanoClient;

// const Nano = require('@fwd/nano');

const client = new NanoClient({ url: "http://[::1]:7076" });

const Wallet = {

	balance(address) {

		var balance = {}

		try {
			balance = await account(address)
		} catch(e) {
			console.error("Error 282:", e)
		}

		balance.amount = balance.nano || 0
		balance.pending = balance.pending || 0

		balance.address = address

		balance.amount = balance.amount || 0

		balance.usd_rate = Number(balance.rate.toFixed(2))
		balance.usd_value = (balance.amount * balance.usd_rate).toFixed(2)

		balance.balance = Number(balance.amount) < 0.0001 ? 0 : balance.amount

		if (balance.amount && Number(balance.amount) < 0.0001) {
			balance.crumbs = balance.amount
		}

		delete balance.rate
		delete balance.usd
		delete balance.raw
		delete balance.amount
		delete balance.nano

		return balance

	},

	async PoW(frontier) {
		
		var key = 'frontier'
		
		if (!frontier) return console.log("Error: No Frontier provided for PoW.", frontier)
		
		if (frontier.includes('nano_')) {
			var _frontier = (await this.balance(frontier)).frontier
			frontier = _frontier || (await client._send('account_key', { "account": frontier })).key
		} 
		
		pow_source = pow_sources.find(a => a.online && a.gpu)
		
		var data = (await server.http.get(`${pow_source.url}/work_generate?${key}=${frontier}`, { timeout: 60000 })).data
			data = data.response ? data.response : data
		
		return data
	},

	async reps() {
		try {
			return Object.keys((await client._send('representatives_online', { "json_block": true })).representatives).length
		} catch(e) { return e }
	},

	async address_key(address) {
		try {
			return (await client._send('account_key', { "json_block": true, "account": address })).key
		} catch(e) { return e }
		return 
	},

	async _list() {
		return (await list())
	},

	async list() {
		try {
			return (await client._send('account_list', { "json_block": true, "wallet": wallet_id })).accounts
		} catch(e) { return e }
	},

	async add_account(key) {
		try {
			return await client._send('wallet_add', { "json_block": true, "wallet": wallet_id, "key": key })
		} catch(e) { return e }
		return 
	},
	

	async recycle(address) {
		balance = 0
		if (wallets.find(b => b.address == address)) return
		try {
			balance = (await account(address.address)).balance
			if (Number(balance) > 0) await this._send(faucet, "all", address.address)
			await client._send('account_remove', { "json_block": true, "wallet": wallet_id, "account": address.address })
			if (address && address.id) await database.delete('wallets', address.id)
		} catch(e) {
			console.error("Error 192:", e)
			return { error: e }
		}
	},

	async change_rep(address, representative, work) {

		try {

			if (!address) return { error: "Missing Address param." }

			var balance = await account(address)

			if (!address) return { error: "Missing params." }
			
			var proof = { work } 

			// if (olympus_is_up && olympus_enabled) {
			if (proof.work) proof = await PoW(balance.frontier)
			// }

			// await client._send('account_representative_set', { "json_block": true, "wallet": wallet_id, "account": address, "representative": representative || default_representative })
			await client._send('account_representative_set', { "json_block": true, "work": proof.work, "wallet": wallet_id, "account": address, "representative": representative || default_representative })

			console.log(`Changed rep to ${representative || default_representative}`)

			return "Done!"

		} catch (e) { 
			console.error("Error 822:", e)
		}
		
	},

	send(to, amount, source) {

		return new Promise(async (resolve, reject) => {

			var block

			try {
	
				var order = { to, amount, from: source }

				if (!order.to) return reject({ error: "Send: No To provided." })
				if (!order.amount) return reject({ error: "Send: No Amount provided." })
				if (!order.from) return reject({ error: "Send: No From provided." })

				var from = wallets.find(a => (a.address == order.from) || (a.name == order.from))

				if ((await Wallet.list()).includes(order.from)) {
					if (server.cache(`seed-${order.from}`)) {
						order.seed = server.cache(`seed-${order.from}`)
					} else {
						order.seed = await seed(order.from)
						server.cache(`seed-${order.from}`, order.seed)
					}
				}

				if (!order.seed) {
					console.log('Error:', `${order.from} is not a local address.`, order)
					return { error: `${order.from} is not a local address.` }
				}

				if (!order.from || !order.to || !order.amount || !order.seed) return { error: "Missing a param." }

				var start = performance.now()

				var balance = await this.balance(order.from)

				if ( order.amount == "max" || order.amount == "all" ) order.amount = balance.nano

				var new_balance = Number(balance.nano).toFixed(15) - Number(order.amount).toFixed(15)
					new_balance = (new_balance == 0 || new_balance) == "0" ? "0" : Nano.toRaw(new_balance)

				var _block = {
					"json_block": true,
					"type": "state",
					"previous": balance.frontier,
					"account": order.from,
					"representative": balance.representative,
					"balance": new_balance,
					"link": order.to,
					"key": order.seed || wallet_seed,
					"work": (await PoW(balance.frontier)).work,
				}
		

				block = await client._send('block_create', _block)
				
				var hash = await client._send('process', { "json_block": "true", "block": block.block })

				var end = performance.now();

				server.sleep(100)

				resolve({ 
					hash: block.hash,
					amount: order.amount,
					hash_url: `https://nano.to/hash/${block.hash}`,
					nanolooker: `https://nanolooker.com/block/${block.hash}`,
					duration: (((end - start) / 1000)).toFixed(2)  + " seconds",
				})

			} catch(e) {
				e.block = block 
				reject(e)
			}

		})
		
	},

}