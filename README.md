<h1 align="center">Nano Node Proxy</h1>

> Now with less bugs!

### 1. Install

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
