<h1 align="center">Nano Node Proxy</h1>

> Now with less bugs!

## 0. Pre-requisites

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

## 1. Install [PoW Worker](https://github.com/nanocurrency/nano-work-server)

```bash
git clone https://github.com/nanocurrency/nano-work-server.git
cd nano-work-server
cargo build --release
```

## 2. Install [PoW Proxy](https://github.com/fwd/nano-proxy)

```bash
git clone https://github.com/fwd/nano-proxy
cd nano-proxy
npm install
```

**Create config file**

```bash
nano .env
```

> Kinda funny how the Ubuntu editor 'nano' shares the coin name. Edit nano with nano.

Paste configs from below.

**Required:**
```
NAME=Esteban's GPU 💪🏽
PAYMENT=YOUR_NANO_ADDRESS
SECRET=joe-mama
```

Please change the ```SECRET``` to something long, and secure.

**Optional:**

```bash
PORT=2819
VANITY_PATH=/my/custom/path/nano-vanity
GPU=TRUE
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

### 5. Have a beer 🍺

Job well done. Tell us about on https://reddit.com/r/nanoapi, or Tweet us [@nano2dev](https://twitter.com/nano2dev)