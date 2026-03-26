# Stellar wallet integration (2)

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/sylvia-baricks-projects/v0-stellar-wallet-integration)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/arKTnGvW6pL)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/sylvia-baricks-projects/v0-stellar-wallet-integration](https://vercel.com/sylvia-baricks-projects/v0-stellar-wallet-integration)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/arKTnGvW6pL](https://v0.app/chat/arKTnGvW6pL)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Soroban Deployment Details (Level 2)

? **Contract ID:** `CADI56PK5TY2TXYCCSQJP4OBNFTD6ZVLWINUJNQ4QIUEBECGGIG4RYKA` 
? **Transaction Hash:** `64af96b8bf501dd1ca32a584e924164e9ca736888ba45371efc4106eba1e1eb2` 

### Setup Steps
1. **Build Contract:** `cd contract_hash; stellar contract build` 
2. **Deploy Contract:** `stellar contract deploy --wasm target/wasm32v1-none/release/contract_hash.wasm --source alice --network testnet` 
3. **Frontend Integration:** Uses `@stellar/stellar-sdk` and `@stellar/freighter-api` to interact with the contract.

### Features Implemented
- **Transaction Status UI:** Real-time feedback for pending, success, and failed states.
- **Error Handling:** Specific alerts for wallet not found, user rejection, and insufficient balance.
- **Real-time Updates:** UI automatically refreshes data after on-chain storage.
