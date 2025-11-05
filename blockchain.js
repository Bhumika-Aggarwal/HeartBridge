let contract;
let signer;
let provider;

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
    "inputs": [],
    "name": "getAllNGOs",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
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
  },
  {
    "inputs": [],
    "name": "contractBalance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDonationsCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }],
    "name": "getDonation",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

async function connectWallet() {
  if (!window.ethereum) {
    alert("⚠️ Please install MetaMask first!");
    return;
  }

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);

    const user = await signer.getAddress();
    alert(`✅ Connected: ${user}`);

    await loadVerifiedNGOs();
    await getContractBalance();
    await loadDonations();
  } catch (err) {
    console.error(err);
    alert("❌ Wallet connection failed!");
  }
}

async function loadVerifiedNGOs() {
  try {
    const ngos = await contract.getAllNGOs();
    const dropdown = document.querySelector("select");
    dropdown.innerHTML = `<option>Select NGO</option>`;

    for (let addr of ngos) {
      const ngo = await contract.ngos(addr);
      if (ngo.verified) {
        const option = document.createElement("option");
        option.value = ngo.name;
        option.textContent = ngo.name;
        dropdown.appendChild(option);
      }
    }

    if (dropdown.options.length === 1) {
      dropdown.innerHTML += `<option disabled>No verified NGOs yet</option>`;
    }
  } catch (err) {
    console.error("Error loading NGOs:", err);
  }
}

async function donateToNGO() {
  if (!contract) return alert("⚠️ Connect your wallet first!");

  const nameInput = document.getElementById("donorName").value.trim();
  const amount = document.querySelector('input[type="number"]').value;
  const ngoSelect = document.querySelector("select");
  const ngoName = ngoSelect.value;

  if (!nameInput || !amount || ngoName === "Select NGO") {
    alert("⚠️ Please fill all fields and select a valid NGO.");
    return;
  }

  try {
    const tx = await contract.donate(ngoName, {
      value: ethers.parseEther(amount)
    });

    alert("⏳ Transaction sent! Confirm in MetaMask...");
    await tx.wait();
    await getContractBalance();
    await loadDonations();

    alert(`🎉 Donation Successful! Thank you, ${nameInput}!`);
    showPopup();
  } catch (err) {
    console.error("Donation failed:", err);
    alert("❌ Transaction failed. See console for details.");
  }
}

async function getContractBalance() {
  try {
    if (!provider) provider = new ethers.BrowserProvider(window.ethereum);
    const balanceWei = await provider.getBalance(contractAddress);
    const balanceEth = ethers.formatEther(balanceWei);
    document.getElementById("balance").innerText = `${balanceEth} ETH`;
  } catch (err) {
    console.error("Error fetching balance:", err);
  }
}

async function loadDonations() {
  try {
    const countRaw = await contract.getDonationsCount();
    const count = Number(countRaw); 

    console.log("Total Donations Found:", count);
    const tbody = document.getElementById("donationBody");
    tbody.innerHTML = "";

    if (count === 0) {
      tbody.innerHTML = `<tr><td colspan="4">No donations yet. Be the first to give 💖</td></tr>`;
      return;
    }

    for (let i = count - 1; i >= 0 && i >= count - 5; i--) {
      const d = await contract.getDonation(i);
      const donor = d[0];
      const amount = ethers.formatEther(d[1]);
      const ngo = d[2];
      const time = new Date(Number(d[3]) * 1000).toLocaleString();

      const row = `<tr>
        <td>${donor.slice(0, 6)}...${donor.slice(-4)}</td>
        <td>${ngo}</td>
        <td>${amount}</td>
        <td>${time}</td>
      </tr>`;
      tbody.innerHTML += row;
    }
  } catch (err) {
    console.error("Error loading donations:", err);
    alert("⚠️ Could not load donation history. Check console for details.");
  }
}

function showPopup() {
  document.getElementById("thankYouPopup").style.display = "flex";
}
function closePopup() {
  document.getElementById("thankYouPopup").style.display = "none";
}

setInterval(() => {
  if (contract) {
    getContractBalance();
    loadDonations();
  }
}, 20000);
