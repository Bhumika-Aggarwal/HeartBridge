// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Donation {
    address public admin;

    struct NGO {
        address wallet;
        string name;
        bool verified;
    }

    struct DonationRecord {
        address donor;
        uint256 amount;
        string ngoName;
        uint256 timestamp;
    }

    mapping(address => NGO) public ngos;
    address[] public ngoAddresses;
    DonationRecord[] public donations;

    event Donated(address indexed donor, uint256 amount, string ngoName, uint256 timestamp);
    event NGORegistered(address indexed ngoAddr, string name);
    event NGOVerified(address indexed ngoAddr);
    event Withdrawn(address indexed ngoAddr, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can do this");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerNGO(address _wallet, string calldata _name) external onlyAdmin {
        require(_wallet != address(0), "Invalid wallet address");
        if (ngos[_wallet].wallet == address(0)) {
            ngoAddresses.push(_wallet);
        }
        ngos[_wallet] = NGO({wallet: _wallet, name: _name, verified: false});
        emit NGORegistered(_wallet, _name);
    }

    function verifyNGO(address _wallet) external onlyAdmin {
        require(ngos[_wallet].wallet != address(0), "NGO not registered");
        ngos[_wallet].verified = true;
        emit NGOVerified(_wallet);
    }

    function donate(string calldata _ngoName) external payable {
        require(msg.value > 0, "Send ETH to donate");
        donations.push(DonationRecord({
            donor: msg.sender,
            amount: msg.value,
            ngoName: _ngoName,
            timestamp: block.timestamp
        }));
        emit Donated(msg.sender, msg.value, _ngoName, block.timestamp);
    }

    function withdrawTo(address _ngoAddr, uint256 _amount) external onlyAdmin {
        require(ngos[_ngoAddr].verified, "NGO not verified");
        require(address(this).balance >= _amount, "Insufficient funds");
        payable(_ngoAddr).transfer(_amount);
        emit Withdrawn(_ngoAddr, _amount);
    }

    function getAllNGOs() external view returns (address[] memory) {
        return ngoAddresses;
    }

    function getDonationsCount() external view returns (uint256) {
        return donations.length;
    }

    function getDonation(uint256 index) external view returns (address, uint256, string memory, uint256) {
        DonationRecord storage d = donations[index];
        return (d.donor, d.amount, d.ngoName, d.timestamp);
    }

    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
