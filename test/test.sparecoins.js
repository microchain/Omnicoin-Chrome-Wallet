// Note: This backend code base (sparecoins.js / sparecoins_lib.js / chrome_storage.js) is split into Public API and Non Public APIs. Public APIs are expected to be maintained and stayed relatively more stable. Whereas non-public APIs are considered to be private methods and may change frequently.

var expect = chai.expect;

// simulating storage so that we can run tests in the browser instead of as a chrome extension
var testStorage = {
  // accepts collection, key, value string
  // returns: nil

  // callback function()
  // accepts: object JSON
  get: function(collection, callback) {
    data = localStorage.getItem(collection);
    data = JSON.parse(data);
    if (data === null) {
      data = {};
    }
    callback(data);
    return undefined;
  },

  set: function(collection, key, value) {
    data = localStorage.getItem(collection);
    data = JSON.parse(data);
    if (data === null) {
      data = {};
      data[key] = value;
      localStorage.setItem(collection, JSON.stringify(data));
    } else {
      data[key]=value;
      localStorage.setItem(collection, JSON.stringify(data));
    }
    return undefined;
  },
  clear: function(collection) {
    localStorage.removeItem(collection);
  },
  remove: function(collection, key, value) {

  },
};

describe("LocalStorage", function() {
  it("sets an value and can retrieve it", function(done) {
    testStorage.set("collection", "key", "value");
    testStorage.get("collection", function(data) {
      var keys = Object.keys(data);
      expect(keys.length).to.eq(1);
      expect(keys[0]).to.eq("key");
      expect(data[keys[0]]).to.eq("value");
      done();
    });
  });

  it("correctly gets when there is no value matching to the key", function() {

  });
});

describe("Wallet", function() {
  beforeEach(function(done) {
    testStorage.clear("wallet");

    var wallet = new Wallet(testStorage);
    for (var i=0; i<10; ++i) {
      var address = wallet.generateAddress("password_digest");
    }
    done();
  });

  it("init loads up recent tx and addresses", function(done){
    var wallet = new Wallet(testStorage);

    var spy = sinon.spy(wallet.storage, "get");
    wallet.init(function() {
      expect(wallet.addresses.length).to.eq(10);
    });

    // storage should receive get twice: 1, recent txs 2, wallet
    expect(wallet.storage.get.calledTwice).to.eq(true);
    expect(wallet.storage.get.calledWith("txs")).to.eq(true);
    expect(wallet.storage.get.calledWith("wallet")).to.eq(true);

    // test finished; restore
    wallet.storage.get.restore();
    done();
  });

  it("is able to generate and save new addresses", function(done) {
    var wallet = new Wallet(testStorage);
    var address = wallet.generateAddress("password_digest");
    expect(address.privateKey).to.eq(null);
    done();
  });

  it("able to generate the addressStrs as an array", function(done) {
    var wallet = new Wallet(testStorage);
    wallet.init(function() {
      console.log(wallet.addresses[0]);
      expect(wallet.addresses.length).to.eq(10);

      var addressStrs = wallet.addressStrs();
      expect(addressStrs.length).to.eq(10);
    });
    done();
  });

  // it("is able to update with latest data from blockchain.info", function(done) {
  //   var wallet = new Wallet(testStorage);
  //   wallet.getLatestData(function() {
  //     done();
  //   });
  // });

  it("is able to save newAddress and update its own array of addresses", function(done) {
    // wallet._saveNewAddress()
    done();
  });
});

describe("Address", function() {
  // === Public API Start ===
  // address.validate()
  it("correctly checks the validity of the address", function(done) {
    var validAddress = new Address("1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T");
    expect(validAddress.validate()).to.eq(true);

    // changed last character T to a
    var invalidAddress = new Address("1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1a");
    expect(invalidAddress.validate()).to.eq(false);

    done();
  });

  it("able to encrypt and decrypt privateKey using password digest", function(done) {
    var newAddress = new Address();
    var originalPrivateKey = newAddress.privateKey;

    newAddress.encrypt("password_digest");
    expect(newAddress.privateKey).to.eq(null);
    newAddress.decrypt("password_digest");
    expect(newAddress.privateKey).to.eq(originalPrivateKey);
    done();
  });

  // === Public API End ===

  // address.save()
  it("ablt to encrypt and save itself into localStorage", function(done) {
    // address.save(password_digest, storage)
    done();
  });

  it("initializes with new address if no arguments given", function(done) {
    var address = new Address();
    expect(address.validate()).to.eq(true);

    // todo: Add in privateKey verification
    expect(address.privateKey.constructor).to.eq(String);
    done();
  });

  it("correctly generates hash160", function(done) {
    // Src: https://blockchain.info/address/15BHe7Lbi9BfjY2qvkC6DBSWXMowXiGBZh
    var address = new Address("15BHe7Lbi9BfjY2qvkC6DBSWXMowXiGBZh");
    expect(address.toHash160()).to.equal("2dd28d8f83e8dd026720289825a32d2a5e5c87b3");
    done();
  });
});
