<h1 align="center">Nano Node Proxy</h1>

> Now with less bugs!


## Prerequisites

> Ubuntu (why would you use anything else? 💁🏽‍♂️)


**1.1 OpenCL**

```bash
sudo apt install ocl-icd-opencl-dev 
```

**1.2 Rust**

```bash
curl https://sh.rustup.rs -sSf | sh
```

**1.3 GCC**
```bash
sudo apt install gcc -y
```

**1.4 Nano Vanity**
```bash
cargo install nano-vanity
```

**1.5 Cron**

```bash
# crontab -e
@reboot ~/nano-work-server/target/release/nano-work-server --cpu-threads 4
```

Adjut ```--cpu-threads``` to your needs.

**With GPU**

```
@reboot ~/nano-work-server/target/release/nano-work-server --gpu 0:0
```

Adjut ```--gpu``` to each local device id. Good luck. It's a pain.

---

## Install PoW Worker

```bash
git clone https://github.com/nanocurrency/nano-work-server.git
cd nano-work-server
cargo build --release
```

## Install HTTP Proxy

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
