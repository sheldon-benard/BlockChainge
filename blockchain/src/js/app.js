App = {
    web3Provider: null,
    contracts: {},
    title: null,
    name: null,
    check: null,
    desc:null,
    totalCheckpoints: null,
    currCheckpoints: null,
    addr: null,
    buffer: null,
    hash: null,

    init: function() {
        return App.initWeb3();
    },

    initWeb3: function() {
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initAccount();
    },

    initAccount: function() {
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                App.account = account;
                App.initContract();
            }
        });
    },

    initContract: function() {
        $.getJSON("Campaign.json", function(campaign) {
            // Instantiate a new truffle contract from the artifact
            App.contracts.Campaign = TruffleContract(campaign);

            $.getJSON("Campaigns.json",function(campaigns){
                App.contracts.Campaigns = TruffleContract(campaigns);
                App.bindEvents();
            });
        });

    },

    bindEvents: function() {
        $('#createTitle').on('change',function(){
            App.title = $('#createTitle').val();
        })
        $('#createName').on('change',function(){
            App.name = $('#createName').val();
        })
        $('#createCheckpoints').on('change',function(){
            App.check = parseInt($('#createCheckpoints').val());
        })
        $('#createDesc').on('change',function(){
            App.desc = $('#createDesc').val();
        })

        var donate = $('#donatePage').html()
        if (donate === "Donate") {
            // we are on the donate page
            App.getCampaigns();
        }

        if (window.location.search.includes("address=")) {
            // We are on the campaigns page
            var r = window.location.search.replace("?address=", "");
            console.log(r)
            App.getCampaign(r)
        }

    },

    createCampaign: function() {
        if (!isNaN(App.check)) {
            App.contracts.Campaign.setProvider(App.web3Provider);
            App.contracts.Campaign.new(App.title, App.name, App.check, App.desc, App.hash, {
                from: App.account,
                gas: 2500000
            }).then(function (instance) {
                console.log(instance.address)
                App.contracts.Campaigns.setProvider(App.web3Provider);
                // Static address used for the 1 master Campaigns contract
                App.contracts.Campaigns.at('0xa2b3fda24a7022ef1c8f5b3799de451124c59191').then(function(inst) {
                    return inst.addCampaign(instance.address, App.title, App.name, App.check, {
                        from: App.account,
                        gas: 2500000
                    })
                })
                    .then(function() {
                    console.log("Added Campaign to Campaigns")
                })
            })
        }
    },

    getCampaign: function(address) {
        App.addr = address
        App.contracts.Campaign.setProvider(App.web3Provider);
        App.contracts.Campaign.at(address).then(function(instance){
            console.log(instance)
            instance.getFields({
                from: App.account,
                gas: 2500000
            }).then(function(result){
                // owner, title, name, description, totalCheckpoints, currCheckpoint, total, isOwner, hash
                console.log(result)
                $('#cTitle').html(result[1] + ' <br/> ' + result[2] + ' (' + result[0] + ')')
                $('#cDesc').html(result[3])
                $('#cCheck').html("Current Checkpoint: " + (parseInt(result[5].toString()) + 1))
                $('#cTotal').html("Total (wei): " + result[6].toString())
                $('#cHash').html("IPFS Hash: " + result[8])
                App.totalCheckpoints = parseInt(result[4])
                App.currCheckpoints = parseInt(result[5].toString());
                if (!result[7]) {
                    App.checkpointHTML(App.totalCheckpoints)
                } else {
                    App.withdrawHTML(App.currCheckpoints)
                }
            })
        });
    },

    getCampaigns: function() {
        var campaignsInstance;
        App.contracts.Campaigns.setProvider(App.web3Provider);
        App.contracts.Campaigns.at('0xa2b3fda24a7022ef1c8f5b3799de451124c59191').then(function(instance) {
            campaignsInstance = instance;
            return instance.getNumCampaigns();
        }).then(function(numCampaigns){
            numCampaigns = parseInt(numCampaigns.toString());
            var html = '';
            var i = 0;
            App.campaignRecursion(campaignsInstance,html,i,numCampaigns)
        })
    },

    fileUpload: function(event) {
        const file = event.target.files[0]
        const reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => {
            App.buffer = Buffer(reader.result)
            let node = new Ipfs({ repo: 'ipfs-' + Math.random() })
            node.once('ready', () => {
                node.files.add(App.buffer, (error, result) => {
                    if(error) {
                        console.log('err')
                        console.log(error)
                        return
                    }
                    console.log('success')
                    //result.forEach((file) => console.log('successfully stored', file.hash))
                    console.log(result[0].hash)
                    App.hash = result[0].hash

                })
                // console.log(App.buffer)
            })

        }
    },

    campaignHTML: function(address, title, name) {
        var result = '<div class="py-5" style="background-color: #00001a"><div class="container">' +
            '<div class="row"><div class="col-md-12"><div class="card">' +
            '<div class="card-header">' + address + '</div>' +
            '<div class="card-body"><h4>' + title + '</h4>' +
            '<h6 class="text-muted">' + name + '</h6>' +
            '</div><div class="card-footer">' +
            '<a class="btn btn-primary" href="Campaign.html?address=' + address + '">See Campaign</a>' +
            '</div> </div> </div> </div> </div> </div>'

        return result;

    },

    checkpointHTML: function(chkp) {
        var result = ""
        for (var i = 0; i < chkp; i++) {
            result += '<button onclick="App.donate(' + i + ')" class="btn my-2 btn-lg btn-dark" style="margin-right: 20px;">Donate CP ' + (i+1) + '</button>'
        }

        $('#buttons').html(result)
    },

    withdrawHTML: function(currChkp) {
        var result = ""
        for (var i = 0; i < (currChkp + 1); i++) {
            result += '<button onclick="App.withdraw(' + i + ')" class="btn my-2 btn-lg btn-dark" style="margin-right: 20px;">Withdraw CP ' + (i+1) + '</button>'
        }

        $('#buttons').html(result)
    },

    donate: function(i) {
        var payment = Array.apply(null, Array(App.totalCheckpoints)).map(Number.prototype.valueOf,0);
        var wei = parseInt($('#etherDonation').val()) * 1000000000000000000
        payment[i] = wei
        App.contracts.Campaign.at(App.addr).then(function(instance){
            instance.recordPayment(payment, {
                from: App.account,
                gas: 2500000,
                value: wei
            }).then(function(){
                console.log('sent wei')
            })
        });

    },

    withdraw: function(i) {
        console.log('withdraw chkp ' + (i+1))
        App.contracts.Campaign.at(App.addr).then(function(instance){
            instance.executePayment({
                from: App.account,
                gas: 2500000,
            }).then(function(res){
                console.log('withdraw wei')
            })
        });
    },

    campaignRecursion: function(campaignsInstance, html, i, numCampaigns) {
        if (i >= numCampaigns) {
            $('#campaigns').html(html)
        }
        else {
            campaignsInstance.getCampaignDescription(i).then(function(campaign) {
                App.campaignRecursion(campaignsInstance, html + App.campaignHTML(campaign[0], campaign[1], campaign[2]), i+1, numCampaigns)
            })

        }
    }

};

$(function() {
    $(window).load(function() {
        App.init();
    });
});
