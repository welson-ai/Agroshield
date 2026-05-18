const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const POOL_ADDRESS = "0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6";

module.exports = buildModule("BatchSpinsModule", (m) => {
  const batchSpins = m.contract("AgroShieldBatchSpins", [CUSD_ADDRESS, POOL_ADDRESS]);
  return { batchSpins };
});
