// == Public API Start ==
var ExceptionHandle = {
  // accepts: err Error
  raise: function(err) {
    throw err;
  },
};

var Constants = {
  toBTC: function() {

  },
};

var Encryption = {
  // accepts: password string
  toPasswordDigest: function(password) {
  },

};

// ExternalAPI
var BlockchainInfoAPI = {
  root: 'https://blockchain.info/',
  // accepts: addresses []string, callback function
  // returns: nil

  // callback
  // accepts: data JSON
  multiAddr: function(addresses, callback) {
    var self = this;
    var data = {"active":addresses.join('|'), "cors":true};
    $.ajax({
      type: "GET",
      dataType: 'json',
      url: self.root +'multiaddr',
      data: data,
      crossDomain: true,
      success: function(ajaxResults) {
        callback(null, ajaxResults);
      },
      error: function(err) {
        callback(err, null);
      }
    });
  },

  // accepts: addresses []string, callback function
  // returns: nil

  // callback
  // accepts: data JSON
  getUnspent: function(addresses, callback) {
    var self = this;
    var data = {"active":addresses.join('|'), "cors":true};
    $.ajax({
      type: "GET",
      dataType: 'json',
      url: self.root +'unspent',
      data: data,
      crossDomain: true,
      success: function(ajaxResults) {
        callback(null, ajaxResults);
      },
      error: function(err) {
        callback(err, null);
      }
    });
  },

  // accepts: pendingTransaction obj
  // callback
  // accepts: data
  pushTx: function(pendingTransaction) {

  },
};
// == Public API End ==

