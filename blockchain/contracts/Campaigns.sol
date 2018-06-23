pragma solidity ^0.4.15;

contract Campaigns {

    address[] campaigns;
    mapping(address => CampaignDescription) desc;

    struct CampaignDescription {
        string title;
        string name;
        uint256 numTiers;
    }

    constructor() {}

    function addCampaign(address campaignAddress, string title, string name, uint256 tiers) {
        require(desc[campaignAddress].numTiers == 0);
        campaigns.push(campaignAddress);
        desc[campaignAddress] = CampaignDescription(title, name, tiers);
    }

    function getNumCampaigns() constant returns (uint256) {
        return campaigns.length;
    }

    function getCampaignDescription(uint256 index) constant returns (address campaign, string title, string name, uint256 tiers) {
        require(index >= 0);
        require(index < campaigns.length);

        address camp = campaigns[index];
        return (camp, desc[camp].title, desc[camp].name, desc[camp].numTiers);

    }

}