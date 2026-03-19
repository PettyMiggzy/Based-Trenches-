const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice * 5n; // 5x to definitely replace stuck tx
  
  const nonce = await hre.ethers.provider.getTransactionCount(signer.address, "pending");
  const confirmedNonce = await hre.ethers.provider.getTransactionCount(signer.address, "latest");
  
  console.log("Confirmed nonce:", confirmedNonce);
  console.log("Pending nonce:", nonce);
  
  if (nonce === confirmedNonce) {
    console.log("No stuck transactions!");
    return;
  }
  
  // Cancel each stuck tx by sending 0 ETH to self with same nonce but higher gas
  for (let n = confirmedNonce; n < nonce; n++) {
    console.log(`Cancelling stuck tx at nonce ${n}...`);
    const tx = await signer.sendTransaction({
      to: signer.address,
      value: 0n,
      nonce: n,
      gasPrice: gasPrice,
      gasLimit: 21000n,
    });
    await tx.wait();
    console.log(`✅ Cancelled nonce ${n}, hash: ${tx.hash}`);
  }
  console.log("All stuck transactions cleared. Now run npm run deploy");
}

main().catch((e) => { console.error(e.shortMessage || e.message); process.exitCode = 1; });
