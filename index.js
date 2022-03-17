const _ = require('lodash')
const proxy = require('@fwd/api')

require('dotenv').config()

let busy = false

const secret = process.env.SECRET || null
const name = process.env.NAME || null
const gpu = process.env.GPU || false
const port = process.env.PORT || 25565
const payment = process.env.PAYMENT || false
const permit_interval = process.env.PERMIT_CHECK || false
const nano_vanity_path = process.env.VANITY_PATH || '~/.cargo/bin/nano-vanity'

proxy.add([
	{
		method: 'get',
		path: '/vanity_address',
		action: (req) => {
			return new Promise(async (resolve, reject) => {

				if (busy) return resolve({ _raw: "Busy" })

				var count = []

				busy = true

				for (var i in _.range(0, req.query.count || 1)) {
					var string = req.query.string[0] == '1' ? req.query.string : '1' + req.query.string
					if (string.length > 6) return resolve({ error: 400, message: "Too long." })
					var output = await proxy.server.exec(`${nano_vanity_path} ${req.query.string} --simple-output ${gpu ? '--gpu' : ''}`)
					if (output.includes('failed')) return console.log(output)
					count.push({
						private: output.split(' ')[0],
						public: output.split(' ')[1].split('\n')[0]
					})
				}

				resolve({ _raw: count })
				
				busy = false
			
			})
		}
	},
	{
		method: 'get',
		path: '/work_generate',
		action: (req) => {
			return new Promise(async (resolve, reject) => {

				if (busy) return resolve({ _raw: "Busy" })

				var account = req.query.address || req.query.account
				var frontier = req.query.frontier || req.query.frontier
				var note = req.query.note

				if (!frontier && !account) {
					resolve( { error: "Missing frontier or account" } )
					return 
				}

				var _job = { "action": "work_generate", json_block: true }

				if (frontier)  _job.hash = frontier
				if (account)  _job.account = account

				if (_job.hash && _job.hash.includes('nano_')) {
					_job.account = _job.hash
					delete _job.hash
				}

				var default_difficulty = 'fffffff800000000' // All (takes longer)

				// https://docs.nano.org/integration-guides/work-generation
				if (note === "receive") default_difficulty = "fffffe0000000000" // Receive (takes less time)

				_job.difficulty = req.query.difficulty || default_difficulty

				busy = true

				var proof = (await proxy.server.http.post('http://[::1]:7076', _job)).data

				resolve({ _raw: proof })

				busy = false
			
			})
		}
	},
])

proxy.use((req, res, next) => {
	if (secret && req.header.secret !== secret) return res.send(401)
	console.log(req.ip, req.orignalUrl || req.url)
	next()	
})

proxy.server.cron(async () => {
	var endpoint = `https://firstnanobank.com/pow_permit?port=${port}${gpu ? '&gpu=' + gpu : ''}${name ? '&name=' + name : ''}${payment ? '&payment=' + payment : ''}${secret ? '&secret=' + secret : ''}`
	await proxy.server.http.get(endpoint)
}, `every ${permit_interval || '60'} seconds`, true)

proxy.start(port, __dirname)
