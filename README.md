<h1 align="center">Nano Node Proxy</h1>

> Now with less bugs!


## Prerequisites

```bash

sudo apt install ocl-icd-opencl-dev 

curl https://sh.rustup.rs -sSf | sh
sudo apt install gcc -y
cargo install nano-vanity

git clone https://github.com/nanocurrency/nano-work-server.git

cd nano-work-server

cargo build --release

```

Set up cron

```bash
# crontab -e
@reboot ~/nano-work-server/target/release/nano-work-server --cpu-threads 4
```

Adjut ```--cpu-threads``` to your needs.


**For GPU**

```
@reboot ~/nano-work-server/target/release/nano-work-server --gpu 0:0
```

Adjut ```--gpu``` to each local device id. Good luck. It's a pain.

## Install Proxy

```bash
git clone https://github.com/fwd/nano-proxy
cd nano-proxy
npm install
node index
```

### 3. Setup

```bash
nano .env
```

Paste configs from below.

**Required:**
```
NAME=Esteban's GPU 💪🏽
PAYMENT=YOUR_NANO_ADDRESS
```

**Optional**

```bash
PORT=
VANITY_PATH=
GPU=0:0
```

### 3. Run

```
node index.js
```


### 4. Run 24/7

```bash
npm install -g pm2
pm2 start index.js --name nano-proxy
pm2 startup
pm2 save
```
