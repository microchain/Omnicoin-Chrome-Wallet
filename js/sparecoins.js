// Wallet
// accepts: addresses []string
// attr:
// addresses []address
// txs []json
function Wallet(storage) {
  // == Public API Start ==

  this.addresses  = [];
  this.txs        = [];
  this.balance    = 0;
  this.storage    = storage;

  // returns: addressesStrings []string
  this.addressStrs = function() {
    var self = this;
    var addresses = self.addresses;
    var adddressStrs = [];

    for (var i=0; i<addresses.length; ++i) {
      var address = addresses[i];
      if (address.validate()) {
        adddressStrs.push(address.address);
      }
    }
    return adddressStrs;
  };

  // calllback
  this.init = function(callback) {
    var self = this;

    // step 1: Load txs
    self.storage.get("txs", function(data) {
      self.txs = data;
    });

    // step 2: Load all of the addresses, instantiate them as objects
    self.storage.get("wallet", function(data) {
      // iterate through
      // refactoring required
      var addresses = Object.keys(data);
      for (var i=0; i < addresses.length; ++i) {
        var address = addresses[i];
        var encryptedPrivateKey = data[address];

        self.addresses.push(new Address(address, encryptedPrivateKey));
      }

      callback();
    });
  };

  // TODO: Scott
  // callback
  this.getLatestData = function(callback) {
    var self = this;

    // reload data from localStorage
    self.init(function() {
      var addressStrs = self.addressStrs();
      BlockchainInfoAPI.multiAddr(addressStrs, function(err, ajaxResults) {
        console.log(ajaxResults);
        callback();
      });
    });
  };

  // returns: nil
  // callback
  // accepts: address_object, without privateKey
  this.generateAddress = function(password_digest) {
    var self = this;

    var newAddress = new Address();
    return self._saveNewAddress(newAddress, password_digest, self.storage);
  };

  // accepts: password_digest string, callback
  // callback
  // accepts:
  this.buildPendingTransaction = function(password_digest, callback) {

  };

  // == Public API End ==
  this._saveNewAddress = function(newAddress, password_digest, storage) {
    var self = this;
    if (newAddress.save(password_digest, storage)) {
      self.addresses.push(newAddress);
      return newAddress;
    } else {
      ExceptionHandle.raise(new Error("New Address is not able to be generated!"));
    }
  };
}


// Addresses
// accepts: address, encryptedPrivateKey string, balance integer
// returns:
function Address(address, encryptedPrivateKey) {
  // == Public API Start ==

  this.address             = address;
  this.encryptedPrivateKey = encryptedPrivateKey;
  this.privateKey          = null;
  this.balance             = 0;

  // returns boolean
  this.validate = function() {
    var self = this;

    var bytes = self.toBytes();
    var end = bytes.length - 4;
    var addressCheckSum = bytes.slice(end, bytes.length);

    var hash = bytes.slice(0, end);
    var hashChecksum = _doubleSHAAsBytes(hash);

    // if (self.privateKey !== "") check private key as well
    return _assertEqual(addressCheckSum, hashChecksum.slice(0, 4));

    function _doubleSHAAsBytes(hash) {
      var asBytes = {asBytes: true};
      return Crypto.SHA256(Crypto.SHA256(hash, asBytes), asBytes);
    }

    function _assertEqual(checksum1, checksum2) {
      if (checksum1.length !== checksum2.length || checksum1.length !== 4) {
        return false;
      }

      for (var i = 0; i < checksum1.length; ++i) {
        if (checksum1[i] !== checksum2[i]) return false;
      }

      return true;
    }

  };

  // == Public API End ==

  this.updateBalance = function(balance) {
    var self = this;
    self.balance = balance;
  };

  // returns: boolean
  this.save = function(password_digest, storage) {
    var self = this;

    if (password_digest) {
      self.encrypt(password_digest);
    } else {
      return false;
    }

    // TODO: Validate encryptedPrivateKey
    if (self.encryptedPrivateKey.constructor === String && self.validate()) {
      var address = self.address;
      var encryptedPrivateKey = self.encryptedPrivateKey;
      storage.set("wallet", address, encryptedPrivateKey);
      return true;
    } else {
      return false;
    }
  };

  this.encrypt = function(password_digest) {
    var self = this;
    // TODO: check prsence of privateKey
    // TODO: make sure its UTF8 encoded
    var encrypted = CryptoJS.AES.encrypt(self.privateKey, "password_digest");
    self.encryptedPrivateKey = encrypted.toString();
    self.privateKey = null;
  };

  // callback
  this.decrypt = function(password_digest) {
    // TODO: Check for presence
    var self = this;
    var encryptedRoot = self.encryptedPrivateKey;
    var decrypted = CryptoJS.AES.decrypt(encryptedRoot, password_digest);
    self.privateKey = decrypted.toString(CryptoJS.enc.Utf8);
    // TODO: return boolean
  };

  this._init = function() {
    var self = this;

    var privateKeyBytes = self._privateKeyBytes();
    var eckey = new Bitcoin.ECKey(privateKeyBytes);
    var address = eckey.getBitcoinAddress().toString();

    var privateKeyWIF = new Bitcoin.Address(privateKeyBytes);
    privateKeyWIF.version = 0x80;
    privateKeyWIF = privateKeyWIF.toString();

    self.address = address;
    self.privateKey = privateKeyWIF;
  };

  this._privateKeyBytes = function() {
    var randArr = new Uint8Array(32);
    window.crypto.getRandomValues(randArr);


    var privateKeyBytes = [];
    for (var i = 0; i < randArr.length; ++i) {
      privateKeyBytes[i] = randArr[i];
    }
    return privateKeyBytes;
  };

  this.toHash160 = function() {
    var self = this;

    var bytes = self.toBytes();
    var end = bytes.length - 4;
    var hash160 = bytes.slice(1, end);
    return Crypto.util.bytesToHex(hash160);
  };

  this.toBytes = function() {
    return Bitcoin.Base58.decode(this.address);
  };

  // === Initializaion ===
  if (this.address === undefined && this.encryptedPrivateKey === undefined) {
    this._init();
  }
  // === Initializaion End ===
}


function PendingTransaction() {
  // == Public API Start ==

  this.toString = function() {
  };

  this.push = function() {
  };
  // == Public API End ==
}
