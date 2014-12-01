(function(){
  "use strict";

  if ( window.SpareCoins === undefined )
    window.spareCoins = function(){ } ;

  SpareCoins.start = function( ) {
    var wallet = new pareCoins.Wallet( ) ;
  } ;

  SpareCoins.start( ) ;

  SpareCoins.Wallet = function( fStorage ) {
    var self ;
    var fAddresses ;
    var fTxs ;

    init( ) ;

    self.addressStr ;
    self.refresh = refresh ;

    return self ;

    function init( ) {
      self = { } ;

      fAddresses = [ ] ;
      fTxs = [ ] ;
      fBalance = 0 ;

      refresh( ) ;
    }

    function generateAddress( passwordDigest ) {
      var newAddress = new spareCoins.Address( ) ;

      if ( newAddress.save( passwordDigest, fStorage ) )
        fAddresses.push( newAddress ) ;
      else
        spareCoins.ExceptionHandle.raise( new Error("New Address is not able to grenerate!") ) ;
    }

    function buildPendingTransaction( passwordDigest ) {
      // should passwordDigest be global ?
    }

    function refresh( ) {
      getTransactions( ) ;
      getWallet( ) ;
    }

    function getLatestData( ) {
      refresh( ) ;
      var addressStrs = addressStrs( ) ;
      BlockchainInfoAPI.multiAddr(addressStrs, function(err, ajaxResults){
        // do stuff
      } ) ;
    }

    function getWallet( ) {
      var data = fStorage.get( 'wallet' ) ;
      var addresses = Object.keys( data ) ;

      for ( var i = 0; i < addresses.length; i++){
        var address = addresses[i] ;
        var cryptPrivateKey = data[address] ;
        var newAddress = new SpareCoins.Address( address, cryptPrivateKey) ;

        fAddresses.push( newAddress ) ;
      }
    }

    function getTransactions( ) {
      fTxs = fStorage.get('txs') ;
    }

    function getAddressStr( ) {
      var addressStr = [ ];
      for ( var i = 0; i < fAddresses.length; i++) {

        if ( fAddresses[i].validate( ) )
          addressStr.push( fAddresses[i].address) ;

      }
      return addressStr ;
    }

  } ;


  spareCoins.Address = function( fAddress, fCryptPrivateKey ) {
    var self ;
    var fPrivateKey ;
    var fBalance ;

    init( ) ;

    function init( ) {
      self = { } ;
      fBalance = 0 ;

      if ( fAddress === undefined && fCryptPrivateKey === undefined)
        createNewAddress( ) ;
    }

    function createNewAddress( ) {
      var privateKeyBytes = privateKeyBytes( ) ;
      var ecKey = new Bitcoin.ECKey(privateKeyBytes) ;
      var address = ecKey.getBitcoinAddress( ).toString( ) ;

      var privateKeyWIF = new Bitcoin.Address( privateKeyBytes ) ;
      privateKeyWIF.version = 0x80;
      privateKeyWIF = privateKeyWIF.toString( ) ;

      fAddress = address ;
      fPrivateKey = privateKeyWIF ;
    }

    function privateKeyBytes( ) {
      var privateKeyBytes = [ ] ;
      var randArr = new Unit8Array(32) ;
      crypto.getRandomValues(randArr) ;

      for (var i = 0; i < randArr.length; i++ )
        privateKeyBytes[i] = randArr[i] ;

      return privateKeyBytes;
    }

    function validate( ) {
      var bytes = toBytes( ) ;
      var end   = bytes.length - 4 ;
      var addressChecksum = bytes.slice (end, bytes.length ) ;

      var hash = bytes.slice( 0, end ) ;
      var hashChecksum = doubleShaBytes( hash ) ;

      return assertEqual( addressChecksum, hashChecksum.slice(0, 4) ) ;

      function doubleShaBytes(hash) {
        var asBytes = { asBytes: true };
        return Crypto.SHA256( Crypto.SHA256( hash, asBytes ), asBytes );
      }

      // TODO: if (self.privateKey !== "") check private key as well
      function assertEqual(checksum1, checksum2) {
        if (checksum1.length !== checksum2.length || checksum1.length !== 4) {
          return false;
        }

        for (var i = 0; i < checksum1.length; ++i) {
          if (checksum1[i] !== checksum2[i]) return false;
        }

        return true;
      }

    }

    function toBytes( ) {
      return Bitcoin.Base58.decode(fAddress) ;
    }

    function updateBalance( balance ) {
      fBalance = balance ;
    }
    // returns: boolean
    function save( passwordDigest, storage ) {
      // what should password digest be equal to for it to be true ?
      // be specific
      if ( passwordDigest !== undefined )
        encrypt(passwordDigest);
      else
        return false;

      // TODO: Validate fCryptPrivateKey
      if ( fCryptPrivateKey !== undefined && validate( ) ) {
        storage.set("wallet", fAddress, fCryptPrivateKey);
        return true;
      } else
        return false;
    }

    function encrypt( passwordDigest ) {

      // TODO: check prsence of privateKey
      // TODO: make sure its UTF8 encoded
      if ( fPrivateKey !== undefined ){
        var encrypted = CryptoJS.AES.encrypt(fPrivateKey, "password_digest");
        fCryptPrivateKey = encrypted.toString( );
        fPrivateKey = undefined;
      }
    }

    function decrypt( passwordDigest ) {
      // TODO: Check for presence
      var encryptedRoot = fCryptPrivateKey;
      var decrypted = CryptoJS.AES.decrypt(encryptedRoot, passwordDigest);
      fPrivateKey = decrypted.toString(CryptoJS.enc.Utf8);
      // TODO: return boolean
    }

    function toHash160( ) {
      var bytes = toBytes( ) ;
      var end = bytes.length - 4;
      var hash160 = bytes.slice( 1, end ) ;
      return Crypto.util.bytesToHex( hash160 ) ;
    }

  } ;


  // To do PendingTransactions PUBLIC API
  // PendingTransactions.toString
  // PendingTransactions.push


})( ) ;






