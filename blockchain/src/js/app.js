App = {
    web3Provider: null,
    contracts: {},
    title: null,
    name: null,
    check: null,
    desc:null,
    buffer: null,

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
            App.getCampaign(window.location.search.replace("?address=", ""))
        }

    },

    createCampaign: function() {
        if (!isNaN(App.check)) {
            App.contracts.Campaign.setProvider(App.web3Provider);
            App.contracts.Campaign.new(App.title, App.name, App.check, App.desc, {
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
        App.contracts.Campaign.setProvider(App.web3Provider);
        App.contracts.Campaign.at(address).then(function(instance){

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
            
        }
    },

    campaignHTML: function(address, title, name) {
        var result = '<div class="py-5 bg-secondary"><div class="container">' +
            '<div class="row"><div class="col-md-12"><div class="card">' +
            '<div class="card-header">' + address + '</div>' +
            '<div class="card-body"><h4>' + title + '</h4>' +
            '<h6 class="text-muted">' + name + '</h6>' +
            '</div><div class="card-footer">' +
            '<a class="btn btn-primary" href="Campaign.html?address=' + address + '">See Campaign</a>' +
            '</div> </div> </div> </div> </div> </div>'

        return result;

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
