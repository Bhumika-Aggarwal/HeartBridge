let adminProvider, adminSigner, adminContract;

const contractAddress = "0xF1Ef31cbeDD7f2F1bBd341A6473EAb2247cB2235"; 

const abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_wallet", "type": "address" },
      { "internalType": "string", "name": "_name", "type": "string" }
    ],
    "name": "registerNGO",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_wallet", "type": "address" }
    ],
    "name": "verifyNGO",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_ngoName", "type": "string" }
    ],
    "name": "donate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_ngoAddr", "type": "address" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" }
    ],
    "name": "withdrawTo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllNGOs",
    "outputs": [
      { "internalType": "address[]", "name": "", "type": "address[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDonationsCount",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "index", "type": "uint256" }
    ],
    "name": "getDonation",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contractBalance",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "ngos",
    "outputs": [
      { "internalType": "address", "name": "wallet", "type": "address" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "bool", "name": "verified", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

async function connectAdmin() {
  try {
    if (!window.ethereum) {
      alert("⚠️ MetaMask not detected! Please install it first.");
      return;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });

    adminProvider = new ethers.BrowserProvider(window.ethereum);
    adminSigner = await adminProvider.getSigner();
    adminContract = new ethers.Contract(contractAddress, abi, adminSigner);

    const adminAddress = await adminSigner.getAddress();
    document.getElementById("adminStatus").innerText = `✅ Connected as Admin: ${adminAddress}`;

    await loadDashboardData(true);
  } catch (err) {
    console.error("Error connecting admin:", err);
    alert("❌ Failed to connect admin wallet. Please check console.");
  }
}

async function loadDashboardData(showLoader = false) {
  try {
    if (!adminContract) return;

    if (showLoader)
      document.getElementById("adminStatus").innerText = "🔄 Fetching latest blockchain data...";

    const balanceWei = await adminProvider.getBalance(contractAddress);
    const balanceEth = ethers.formatEther(balanceWei);
    document.getElementById("totalDonations").innerText = `Ξ ${balanceEth} ETH`;

    const donationCount = await adminContract.getDonationsCount();
    document.getElementById("donationCount").innerText = donationCount;

    const ngoList = await adminContract.getAllNGOs();
    document.getElementById("ngoCount").innerText = ngoList.length;

    await displayNGOs(ngoList);

    if (showLoader)
      document.getElementById("adminStatus").innerText = "✅ Dashboard synced with blockchain!";
  } catch (err) {
    console.error("Error loading data:", err);
    document.getElementById("adminStatus").innerText = "⚠️ Error loading blockchain data.";
  }
}

setInterval(() => {
  if (adminContract) loadDashboardData(false);
}, 30000);

// 🏢 Display NGOs
async function displayNGOs(ngoList) {
  const ngoTable = document.getElementById("ngoTableBody");
  ngoTable.innerHTML = "";

  for (const addr of ngoList) {
    try {
      const ngoData = await adminContract.ngos(addr);
      const name = ngoData.name || "(Unnamed NGO)";
      const verified = ngoData.verified;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${name}</td>
        <td>${addr.slice(0, 6)}...${addr.slice(-4)}</td>
        <td>${verified ? "✅ Verified" : "❌ Pending"}</td>
        <td>
          ${verified
            ? `<button disabled>Verified</button>`
            : `<button onclick="verifyNGO('${addr}')">Verify</button>`}
        </td>
      `;
      ngoTable.appendChild(row);
    } catch (err) {
      console.error("Error displaying NGO:", err);
    }
  }
}

async function verifyNGO(ngoAddr) {
  try {
    const tx = await adminContract.verifyNGO(ngoAddr);
    alert("⏳ Verification transaction sent. Please confirm in MetaMask.");
    await tx.wait();
    alert(`✅ NGO ${ngoAddr} verified successfully!`);
    await loadDashboardData(false);
  } catch (err) {
    console.error(err);
    alert("❌ Verification failed. See console for details.");
  }
}

async function withdrawToNGO() {
  const ngoAddr = document.getElementById("ngoAddressInput").value.trim();
  const amountEth = document.getElementById("withdrawAmountInput").value.trim();

  if (!ngoAddr || !amountEth) {
    alert("⚠️ Please enter NGO address and amount.");
    return;
  }

  try {
    const amountWei = ethers.parseEther(amountEth);
    const tx = await adminContract.withdrawTo(ngoAddr, amountWei);
    alert("⏳ Sending transaction...");
    await tx.wait();
    alert(`✅ Sent ${amountEth} ETH to ${ngoAddr}`);
    await loadDashboardData(false);
  } catch (err) {
    console.error(err);
    alert("❌ Withdrawal failed. Check console for details.");
  }
}

// 🏗️ Register New NGO
async function registerNewNGO() {
  const ngoAddr = document.getElementById("newNGOAddress").value.trim();
  const ngoName = document.getElementById("newNGOName").value.trim();

  if (!ngoAddr || !ngoName) {
    alert("⚠️ Enter both NGO name and wallet address.");
    return;
  }

  try {
    const ngoTable = document.getElementById("ngoTableBody");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${ngoName}</td>
      <td>${ngoAddr.slice(0, 6)}...${ngoAddr.slice(-4)}</td>
      <td>🕒 Pending...</td>
      <td><button disabled>Processing...</button></td>
    `;
    ngoTable.appendChild(newRow);

    const tx = await adminContract.registerNGO(ngoAddr, ngoName);
    alert("⏳ Transaction sent... Confirm in MetaMask.");
    await tx.wait();
    alert(`✅ NGO '${ngoName}' registered successfully!`);

    document.getElementById("newNGOAddress").value = "";
    document.getElementById("newNGOName").value = "";

    await loadDashboardData(false);
  } catch (err) {
    console.error(err);
    alert("❌ Failed to register NGO. Check console for details.");
  }
}
