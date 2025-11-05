# ❤️ HeartBridge — Transparent Blockchain Donation Platform  
**Building Bridges of Hope**

---

## 🧠 Problem Statement
Online donation systems often lack transparency — donors can’t see where their money goes, and NGOs have no trustworthy way to prove fund utilization.  
This reduces donor confidence and creates opportunities for misuse.

---

## 💡 Proposed Solution
**HeartBridge** is a blockchain-powered donation platform that ensures **transparency, traceability, and trust** in charitable giving.  
Every donation is recorded on-chain using a smart contract.  
Only verified NGOs can receive funds, and all transactions are visible publicly — ensuring **no hidden intermediaries or misuse**.

---

## 👥 Team Details
| Member Name | Role | Responsibilities |
|--------------|------|------------------|
| **Bhumika Aggarwal** | Team Leader & Blockchain Developer | Smart contract development, Web3 integration, testing |
| **Bhavna Bharti** | Frontend Developer | UI development, UX & design |
| **Aanchal Patidar** | Backend Developer | Logic integration, admin functionalities |

**Team Name:** Fireflies  
**Institution:** Poornima University  

---

## ⚙️ Tech Stack
- **Frontend:** HTML, CSS, JavaScript (Ethers.js v6)
- **Smart Contract:** Solidity
- **Network:** Ethereum Sepolia Testnet
- **Wallet:** MetaMask
- **Hosting:** GitHub Pages

---

## 🏗️ Architecture Overview
### ✅ Smart Contract (`Donation.sol`)
- Stores donation details (donor → NGO → amount → timestamp)
- Admin-only NGO registration & verification
- Allows secure fund withdrawal only to verified NGOs

### ✅ Frontend
- **index.html** → Donor portal (connect wallet, donate, view donations)
- **admin.html** → Admin dashboard (register, verify NGOs & withdraw funds)

### ✅ Blockchain
- All transactions visible on Ethereum testnet for transparency

---

## 🌟 Features
| Feature | Status |
|--------|--------|
Donor Wallet Connect | ✅  
Admin Wallet Connect | ✅  
Register NGOs | ✅  
Verify NGOs | ✅  
Donate (on-chain) | ✅  
View live donation table | ✅  
Withdraw funds to NGO wallet | ✅  
Security (only verified NGOs receive funds) | ✅  

---

## 🧩 Smart Contract Details
- **Network:** Ethereum Sepolia Testnet   

---

## 🚀 How to Run Locally

```bash
git clone https://github.com/Bhumika-Aggarwal/HeartBridge.git
cd HeartBridge
