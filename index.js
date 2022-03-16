const _ = require('lodash')
const proxy = require('@fwd/api')

const gpu = false
const port = 25565

// 1. sudo apt install ocl-icd-opencl-dev
// 2. curl https://sh.rustup.rs -sSf | sh
// 3. sudo apt install gcc -y

// cargo install nano-vanity

// ~/nano-work-server/target/release/nano-work-server --cpu-threads 2

proxy.add([
	{
		method: 'get',
		path: '/vanity_address',
		action: (req) => {
			return new Promise(async (resolve, reject) => {

				var count = []

				for (var i in _.range(0, req.query.count || 1)) {
					// _.range(0, req.query.count)
					var string = req.query.string[0] == '1' ? req.query.string : '1' + req.query.string
					if (string.length > 6) return resolve({ error: 400, message: "Too long." })
					var output = await proxy.server.exec(`~/.cargo/bin/nano-vanity ${req.query.string} --simple-output ${gpu ? '--gpu' : ''}`)
					// var output = await server.exec(`nano-vanity ${req.query.string} --simple-output`)
					// var output = await server.exec(`nano-vanity ${req.query.string} --simple-output --gpu`)
					if (output.includes('failed')) return console.log(output)
					count.push({
						private: output.split(' ')[0],
						public: output.split(' ')[1].split('\n')[0]
					})
				}
				
				resolve({ _raw: count })
			
			})
		}
	},
	{
		method: 'get',
		path: '/work_generate',
		action: (req) => {
			return new Promise(async (resolve, reject) => {

				var account = req.query.address || req.query.account
				var frontier = req.query.frontier || req.query.frontier

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

				_job.difficulty = req.query.difficulty || 'fffffff800000000'

				var proof = (await server.http.post('http://[::1]:7076', _job)).data

				resolve( proof )
			
			})
		}
	},
])

proxy.use((req, res, next) => {
	console.log(req.ip, req.orignalUrl || req.url)
	next()	
})

proxy.start(port, __dirname)