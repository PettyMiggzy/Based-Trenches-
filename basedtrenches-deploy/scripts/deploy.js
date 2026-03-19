const hre = require("hardhat");

const PLATFORM = "0xB9d4B73bE18914c6d64Bee65a806648370be467f";
const VAULT    = "0xe8EC7F7935870E4fAE26Ab689105C60d673CA023";
const CHEST    = "0x34FA3E260484063cD9988380dD581642FC15c0BC";

// Fill in any already-deployed addresses to skip redeploying them
const ALREADY = {
  BasedToken:           "0x478E4ED045A7EDD4E8BeAd47A1d2eB7E2805e6C5",
  ArmoryVault:          "",
  Fortify:              "",
  BondingCurve:         "",
  BasedTrenchesFactory: "",
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function deploy(name, args = []) {
  if (ALREADY[name]) {
    console.log(`⏭️  ${name}: ${ALREADY[name]}`);
    return ALREADY[name];
  }
  const F = await hre.ethers.getContractFactory(name);
  // Get fresh fee data each time
  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice * 5n; // 5x to ensure it goes through
  const gasLimit = name === "BasedTrenchesFactory" ? 3_000_000n : 5_000_000n;
  console.log(`Deploying ${name} with gasPrice ${hre.ethers.formatUnits(gasPrice, "gwei")} gwei...`);
  const c = await F.deploy(...args, { gasLimit, gasPrice });
  console.log(`  tx sent: ${c.deploymentTransaction().hash}`);
  await c.waitForDeployment();
  const addr = await c.getAddress();
  console.log(`✅ ${name}: ${addr}`);
  await sleep(3000); // wait 3s between deployments
  return addr;
}

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Account:", signer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(signer.address)), "ETH\n");

  const TOKEN_IMPL   = await deploy("BasedToken");
  const ARMORY_IMPL  = await deploy("ArmoryVault");
  const FORTIFY_IMPL = await deploy("Fortify");
  const CURVE_IMPL   = await deploy("BondingCurve");
  const FACTORY      = await deploy("BasedTrenchesFactory",
    [PLATFORM, CHEST, VAULT, TOKEN_IMPL, ARMORY_IMPL, FORTIFY_IMPL, CURVE_IMPL]);

  console.log("\n--- Setup calls ---");
  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice * 5n;
  const vault = await hre.ethers.getContractAt("ProtocolVault", VAULT);
  const chest = await hre.ethers.getContractAt("WarChest", CHEST);

  try { await (await vault.setWarChest(CHEST, { gasPrice })).wait(); console.log("✅ setWarChest"); }
  catch(e) { console.log("⏭️  setWarChest:", e.shortMessage || e.message); }
  await sleep(2000);

  try { await (await vault.setFactory(FACTORY, { gasPrice })).wait(); console.log("✅ setFactory Vault"); }
  catch(e) { console.log("⏭️  setFactory Vault:", e.shortMessage || e.message); }
  await sleep(2000);

  try { await (await chest.setFactory(FACTORY, { gasPrice })).wait(); console.log("✅ setFactory Chest"); }
  catch(e) { console.log("⏭️  setFactory Chest:", e.shortMessage || e.message); }

  console.log("\n🎉 DONE!");
  console.log("TOKEN IMPL:    ", TOKEN_IMPL);
  console.log("ARMORY IMPL:   ", ARMORY_IMPL);
  console.log("FORTIFY IMPL:  ", FORTIFY_IMPL);
  console.log("CURVE IMPL:    ", CURVE_IMPL);
  console.log("PROTOCOL VAULT:", VAULT);
  console.log("WAR CHEST:     ", CHEST);
  console.log("FACTORY:       ", FACTORY);
}

main().catch((e) => { console.error(e.shortMessage || e.message); process.exitCode = 1; });
