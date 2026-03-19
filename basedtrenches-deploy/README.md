# Based Trenches — Deployment

## Already Deployed
- ProtocolVault: 0xe8EC7F7935870E4fAE26Ab689105C60d673CA023
- WarChest:      0x34FA3E260484063cD9988380dD581642FC15c0BC

## Setup Instructions

### 1. Install Node.js
Download from https://nodejs.org — install the LTS version (v20)

### 2. Install dependencies
Open a terminal in this folder and run:
```
npm install
```

### 3. Set your private key
⚠️ NEVER share your private key with anyone

On Mac/Linux:
```
export PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

On Windows (Command Prompt):
```
set PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

On Windows (PowerShell):
```
$env:PRIVATE_KEY="0xYOUR_PRIVATE_KEY_HERE"
```

### 4. Deploy
```
npm run deploy
```

This will:
1. Deploy BasedTrenchesFactory
2. Call setWarChest on ProtocolVault
3. Call setFactory on ProtocolVault  
4. Call setFactory on WarChest

All in one script. Takes about 30 seconds.

### 5. After deployment
Copy the Factory address from the output and update your frontend's contract addresses.
