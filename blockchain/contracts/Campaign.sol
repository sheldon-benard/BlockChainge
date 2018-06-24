pragma solidity ^0.4.0;
contract Campaign {

	// struct Checkpoint {
	// 	uint256 amount;
	// }

	struct Donor {
    	mapping(uint256 => uint256) amounts;
    	address donorAddress;
    	uint256 numAmount;
	}

	mapping(uint256 => uint256) public checkpoints;
	mapping(uint256 => Donor) public donors;

	address public owner;
	string public title;
	string public name;
	string public description;
	string public hash;

	uint256 public totalCheckpoints;
	uint256 public currCheckpoint;
	uint256 public total;

	uint256 public donorNum;

	mapping(address => uint256) public balances;

	function Campaign(string t, string n, uint256 numChckpts, string descr, string _hash) {

        hash = _hash;
    	title = t;
    	name = n;
    	owner = msg.sender;
    	description = descr;
    	totalCheckpoints = numChckpts;
    	currCheckpoint = 0;
    	donorNum = 0;

    	for (uint256 i = 0; i < numChckpts; i++) {
        	checkpoints[i] = 0;
    	}
	}

	function getFields() constant returns (address, string, string, string, uint256, uint256, uint256, bool, string) {
        return (owner, title, name, description, totalCheckpoints, currCheckpoint, total, msg.sender == owner, hash);
    }

	function toggleCheckpoint(uint256 chkpt) {
    	currCheckpoint = chkpt;
	}

	function recordPayment(uint256[] payments) payable {
    	total += msg.value;
    	uint256 index = donorNum;

    	uint256 alrdyExist = 0;

    	for (uint256 j = 0; j < donorNum; j++) {
        	if (donors[j].donorAddress == msg.sender) {
            	index = j;
            	alrdyExist = 1;
            	break;
        	}
    	}

    	donors[index] = Donor(msg.sender, totalCheckpoints);

    	for (j = 0; j < totalCheckpoints; j++) {

        	checkpoints[j] += payments[j];

        	if (alrdyExist > 0) {
            	checkpoints[j] -= donors[index].amounts[j];
            	balances[msg.sender] += donors[index].amounts[j];
            	msg.sender.transfer(donors[index].amounts[j]);
        	}

        	donors[index].amounts[j] = payments[j];

    	}

    	donorNum += 1;

	}

	//executed by receiver
	function executePayment() returns (bool) {

    	//require(this.balance >= checkpoints[currCheckpoint]);
    	require(msg.sender == owner);

        currCheckpoint += 1;
    	balances[msg.sender] += checkpoints[currCheckpoint];
    	owner.transfer(this.balance);
    	// total += checkpoints[currCheckpoint];

    	for (uint256 j = 0; j < donorNum; j++) {
        	balances[donors[j].donorAddress] -= donors[j].amounts[currCheckpoint];
    	}

    	return true;

	}


}
