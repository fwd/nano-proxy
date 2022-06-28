const _ = require('lodash')
const proxy = require('@fwd/api')

require('dotenv').config()

proxy.add([
	{
		method: 'get',
		path: '/work_generate',
		action: (req) => {
			return new Promise(async (resolve, reject) => {

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

				var proof = (await proxy.server.http.post('http://[::1]:7076', _job)).data

				resolve({ _raw: proof })
			
			})
		}
	},
])

proxy.use((req, res, next) => {
	console.log(req.ip, req.orignalUrl || req.url)
	next()	
})

proxy.start(process.env.PORT || 8080, __dirname)
