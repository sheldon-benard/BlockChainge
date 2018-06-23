pragma solidity ^0.4.0;
contract Master {

	// struct Checkpoint {
	// 	uint256 amount;
	// }
    
	struct Donor {
    	mapping(uint256 => uint256) amounts;
    	address donorAddress;
    	uint256 numAmount;
	}
    
	 
    
	mapping(address => uint256) balances;
	mapping(uint256 => Campaign) campaigns;
	uint256 campaignNum;
    
	function Master() public {
    	campaignNum = 0;
	}
    
	function startCampaign(uint256 numChckpts, string descr) {

    	campaigns[campaignNum] = Campaign(msg.sender, descr, numChckpts, 0, 0);
   	 
    	for (uint256 i = 0; i < numChckpts; i++) {
        	campaigns[campaignNum].checkpoints[i] = 0;
    	}
   	 
    	campaignNum += 1;
	}
    
	function toggleCheckpoint(address rcvr, uint256 chkpt) {
    	for (uint256 i = 0; i < campaignNum; i++) {
        	if (campaigns[i].receiver == rcvr) {
            	campaigns[i].currCheckpoint = chkpt;
            	break;
        	}
    	}
	}
    
	function recordPayment(address rcvr, uint256[] payments) payable {
    	for (uint256 i = 0; i < campaignNum; i++) {
        	if (campaigns[i].receiver == rcvr) {
           	 
            	uint256 index = campaigns[i].donorNum;
           	 
            	uint256 alrdyExist = 0;
            	for (uint256 j = 0; j < campaigns[i].donorNum; j++) {
                	if (campaigns[i].donors[j].donorAddress == msg.sender) {
                    	index = j;
                    	alrdyExist = 1;
                    	break;
                	}
            	}
           	 
            	campaigns[i].donors[index] = Donor(msg.sender, campaigns[i].totalCheckpoints);
           	 
            	for (j = 0; j < campaigns[i].totalCheckpoints; j++) {
               	 
                	campaigns[i].checkpoints[j] += payments[j];
               	 
                	if (alrdyExist > 0) {
                    	campaigns[i].checkpoints[j] -= campaigns[i].donors[index].amounts[j];
                	}
               	 
                	campaigns[i].donors[index].amounts[j] = payments[j];
               	 
            	}
           	 
            	campaigns[i].donorNum += 1;
           	 
        	}
    	}
	}
    
	//executed by receiver
	function executePayment() {
    	for (uint256 i = 0; i < campaignNum; i++) {
        	if (campaigns[i].receiver == msg.sender) {
            	balances[msg.sender] += campaigns[i].checkpoints[campaigns[i].currCheckpoint];
           	 
            	for (uint256 j = 0; j < campaigns[i].donorNum; j++) {
                	balances[campaigns[i].donors[j].donorAddress] -= campaigns[i].donors[j].amounts[campaigns[i].currCheckpoint];
            	}
           	 
        	}
    	}
	}
    


    
	function getBalance() constant returns (uint256){
    	return balances[msg.sender];
	}
    
}
