<h1 align="center">Nano Node Proxy</h1>

> Now with less bugs!

## Prerequisites

> Ubuntu (why would you use anything else? 💁🏽‍♂️)

```bash
# OpenCL
sudo apt install ocl-icd-opencl-dev 

# Rust
curl https://sh.rustup.rs -sSf | sh

# GCC
sudo apt install gcc -y

# Nano Vanity
cargo install nano-vanity
```

**Setup Cron**

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
```

### 3. Setup config

```bash
nano .env
```

Paste configs from below.

**Required:**
```
NAME=Esteban's GPU 💪🏽
PAYMENT=YOUR_NANO_ADDRESS
```

**Optional:**

```bash
PORT=
VANITY_PATH=
GPU=TRUE
SECRET=joe-mama
```

- **PORT**: Can be any number between 1000 - 9999
- **SECRET**: Lock communication between your node and First Nano Bank. 
- **GPU**: Enable GPU. Make sure the Worker is running in the background.
- **VANITY_PATH**: Path to where you installed Nano Vanity, if it's not working out of the box.

### 3. Run it

```
node index.js
```

If you see ```http://localhost:[PORT]``` printed on the screen. All is well.


### 4. Run it 24/7

```bash
npm install -g pm2
pm2 start index.js --name nano-proxy
pm2 startup
pm2 save
```
