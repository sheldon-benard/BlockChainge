var Campaigns = artifacts.require("./Campaigns.sol");

module.exports = function(deployer) {
  deployer.deploy(Campaigns);
};
