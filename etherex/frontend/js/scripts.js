/* etherex.js -- EtherEx frontend
 *
 * Copyright (c) 2014 EtherEx
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

(function($) {

  EtherEx = {};

  EtherEx.coinbase = "0x995db8d9f8f4dcc2b35da87a3768bd10eb8ee2da";

  EtherEx.addresses = {
    namereg: "0x9bdb1a48ecfea81a2a752c05870d38f6e59c90ad", // "8b01a7e2317fbb6d8096bb667d0604ce898aeaf8"
    trades: "0xffabe02d3ef93ee947dd534e032812a41a109555",
    markets: "0x5620133321fcac7f15a5c570016f6cb6dc263f9d"
  };

  EtherEx.init = [
    "0xac873234d24964d3ef3ded0aa77493b40e5e5cf5",
    "0x1e2130bab79f92547f446969328a8c95721a2e2c",
    "0x8b01a7e2317fbb6d8096bb667d0604ce898aeaf8",
    "0xffabe02d3ef93ee947dd534e032812a41a109555"
  ];

  EtherEx.markets = [
    {},
    {
      name: "XETH/ETH",
      address: "0xe559de5527492bcb42ec68d07df0742a98ec3f1e",
      minamount: Ethereum.BigInteger("10").pow(18),
      minprice: Ethereum.BigInteger("10").pow(8),
    }
  ];

  EtherEx.units = {
    "Uether": Ethereum.BigInteger("1000000000000000000000000000000000000000000000000000000"),
    "Vether": Ethereum.BigInteger("1000000000000000000000000000000000000000000000000000"),
    "Dether": Ethereum.BigInteger("1000000000000000000000000000000000000000000000000"),
    "Nether": Ethereum.BigInteger("1000000000000000000000000000000000000000000000"),
    "Yether": Ethereum.BigInteger("1000000000000000000000000000000000000000000"),
    "Zether": Ethereum.BigInteger("1000000000000000000000000000000000000000"),
    "Eether": Ethereum.BigInteger("1000000000000000000000000000000000000"),
    "Pether": Ethereum.BigInteger("1000000000000000000000000000000000"),
    "Tether": Ethereum.BigInteger("1000000000000000000000000000000"),
    "Gether": Ethereum.BigInteger("1000000000000000000000000000"),
    "Mether": Ethereum.BigInteger("1000000000000000000000000"),
    "Kether": Ethereum.BigInteger("1000000000000000000000"),
    "ether" : Ethereum.BigInteger("1000000000000000000"),
    "finney": Ethereum.BigInteger("1000000000000000"),
    "szabo" : Ethereum.BigInteger("1000000000000"),
    "Gwei"  : Ethereum.BigInteger("1000000000"),
    "Mwei"  : Ethereum.BigInteger("1000000"),
    "Kwei"  : Ethereum.BigInteger("1000"),
    "wei"   : Ethereum.BigInteger("1")
  };

  EtherEx.formatBalance = function(_b) {
    if (_b > EtherEx.units[0] * 10000)
      return (_b / EtherEx.units[0]).toFixed(5) + " " + Object.keys(EtherEx.units)[0];
    for (i in EtherEx.units) {
      if (EtherEx.units[i] != 1 && _b >= EtherEx.units[i] * 100) {
        return ((_b / (EtherEx.units[i] / 1000)) / 1000).toFixed(5) + " " + i
      }
    }
    return _b.toFixed(5) + " wei";
  };

  EtherEx.loadMarkets = function() {
    var last = eth.storageAt(EtherEx.addresses.markets, String(2));
    for (var i = 100; i < 100 + parseInt(last) / 10000000; i = i + 5) {
      var id = eth.storageAt(EtherEx.addresses.markets, String(i+4)).dec();
      EtherEx.markets[id] = {
        name: eth.storageAt(EtherEx.addresses.markets, String(i)),
        address: eth.storageAt(EtherEx.addresses.markets, String(i+3)),
        minamount: eth.storageAt(EtherEx.addresses.markets, String(i+1)).dec(),
        minprice: eth.storageAt(EtherEx.addresses.markets, String(i+2)).dec(),
      }
    };
    // console.log(EtherEx.markets);
  };

  EtherEx.getAddress = function(_a) {
    return eth.storageAt(EtherEx.addresses.namereg, _a).substr(2);
  };

  EtherEx.getName = function(_a) {
    return eth.storageAt(EtherEx.addresses.namereg, "0x" + _a).bin().unpad();
  };

  EtherEx.create = function() {
    eth.create(
      eth.key,
      $("#endowment").val(),
      $("#code").val(),
      $("#gas").val(),
      eth.gasPrice
    );
  };

  EtherEx.transact = function(to, gas, value, data) {
    // console.log(data);
    var adata = data.split(" ");
    var pdata = "";
    for (var i in adata)
      pdata += String(adata[i]).pad(32)
    eth.transact(
      eth.key,
      String(value),
      "0x" + to,
      pdata,
      String(gas),
      eth.gasPrice
    );
  };

  EtherEx.txdata = function() {
    var data = String(1).pad(32);
    data += String(Ethereum.BigInteger(document.getElementById("amount").value).multiply(Ethereum.BigInteger("10").pow(18))).pad(32);
    data += String(Ethereum.BigInteger(document.getElementById("price").value).multiply(Ethereum.BigInteger("10").pow(8))).pad(32);
    data += String(1).pad(32);
    return data;
  };

  EtherEx.sendETH = function() {
    eth.transact(
      eth.key,
      String(Ethereum.BigInteger($("#value").val()).multiply(Ethereum.BigInteger("10").pow(18))),
      "0x" + $("#to").val(),
      "",
      "500",
      eth.gasPrice
    );
  };

  EtherEx.sendXETH = function() {
    eth.transact(
      eth.key,
      "0",
      EtherEx.markets[1].address,
      eth.secretToAddress(document.getElementById("to").value).pad(32) + document.getElementById("value").value.pad(32),
      "1000",
      eth.gasPrice
    );
  };

  EtherEx.check = function () {
    var data = EtherEx.txdata();
    document.getElementById("checkval").innerHTML = "<p>" + data.unbin().substr(2) + "</p>";

    var pdata = "";
    var adata = $("#data").val().split(" ");
    for (var d in adata)
      pdata += String(adata[d]).pad(32)
    document.getElementById("checkval").innerHTML += "<p>" + pdata.unbin().substr(2) + "</p>";
  };

  EtherEx.clear = function () {
    document.getElementById("checkval").innerHTML = "";
    document.getElementById("log").innerHTML = "";
  };

  EtherEx.buy = function() {
    var data = EtherEx.txdata();

    eth.transact(
      eth.key,
      "0",
      EtherEx.coinbase,
      data,
      "100000",
      eth.gasPrice,
      EtherEx.updateBalances
    );
  };

  EtherEx.sell = function() {
    var data = EtherEx.txdata();

    eth.transact(
      eth.key,
      String(Ethereum.BigInteger(document.getElementById("amount").value).multiply(Ethereum.BigInteger("10").pow(18))),
      EtherEx.coinbase,
      data,
      "100000",
      eth.gasPrice,
      EtherEx.updateBalances
    );
  };

  EtherEx.getOrderbook = function() {
    var startkey = 100;
    var lastkey = eth.storageAt(EtherEx.addresses.trades, "10").dec();

    var table = "<table><tr><th class='book'>Buy</th><th class='book'>Sell</th></tr>";

    document.getElementById("last").innerHTML = lastkey;

    var check = 0;
    var booklength = lastkey / 5;
    var length = startkey + parseInt(lastkey);

    for (var i = startkey; i < length; i = i + 5) {
      var value = eth.storageAt(EtherEx.addresses.trades, String(i).bin()).dec();

      if (value) {
        var type = eth.storageAt(EtherEx.addresses.trades, String(i)).dec();
        var price = Ethereum.BigInteger(eth.storageAt(EtherEx.addresses.trades, String(i+1)).dec()) / Math.pow(10, 8);
        var strprice = price + " ETH/XETH";
        var amount = eth.storageAt(EtherEx.addresses.trades, String(i+2)).dec() / Math.pow(10, 18);
        var stramount = "<br />of " + eth.storageAt(EtherEx.addresses.trades, String(i+2)).dec();
        document.getElementById("lastprice").innerHTML = price;
        var owner = "<br />by " + eth.storageAt(EtherEx.addresses.trades, String(i+3)).substr(2);
        if (price) {
          table += "<tr>\
                <td class='book'>" + ((type == 1) ? strprice + stramount + owner : '') + "</td>\
                <td class='book'>" + ((type == 2) ? strprice + stramount + owner : '') + "</td>\
            </tr>";
          document.getElementById("price").value = price;
        };
        if (amount) {
          document.getElementById("amount").value = amount;
        };
      };
    };
    table += "</table>";
    document.getElementById('book').innerHTML = table;
  };

  EtherEx.showError = function(e) {
    var err = $('<a class="error" href="#"><i class="icon-cancel" title="Error - try reloading"></i></a>');
    err.on('click', function() {
      location.reload(true);
    })
    $("#page h2").eq(0).append(err);
    $('#log').append(String(e) + "<br />");
  };

  EtherEx.updateBalances = function() {

    try {
      // Cleanup
      $(".error").remove();
      $("#addressbook > table > tbody tr").remove();

      EtherEx.loadMarkets();

      document.getElementById("eth").innerHTML = EtherEx.formatBalance(eth.balanceAt(eth.coinbase).dec()); // Ethereum.BigInteger(eth.balanceAt(eth.coinbase).dec()).divide(Ethereum.BigInteger("10").pow(18));

      document.getElementById("xeth").innerHTML = eth.storageAt(EtherEx.markets[1].address, eth.coinbase).dec();
      document.getElementById("tot").innerHTML = eth.balanceAt(EtherEx.coinbase).dec();

      var keys = eth.keys;

      for (var i = keys.length - 1; i >= 0; i--) {
        var key = eth.secretToAddress(keys[i]);
        var bal = Ethereum.BigInteger(eth.balanceAt(key).dec()).divide(Ethereum.BigInteger("10").pow(18));
        var entry = $("<tr><td><div>" + key.substr(2) + "</div></td><td>" + bal + " ETH</td></tr>");

        $("#addressbook > table > tbody").append(entry);

        try {
          for (var m = EtherEx.markets.length - 1; m >= 1; m--) {
            var subbal = eth.storageAt(EtherEx.markets[m].address, key).dec();
            var length = EtherEx.markets[m].name.length - 4;
            var subentry = $('<tr><td class="sub">+ ' + '</td><td>' + subbal + " " + EtherEx.markets[m].name.substr(0, length) + " </td></tr>");

            $("#addressbook > table > tbody").append(subentry);
          };
        }
        catch (e) {
          EtherEx.showError(e);
        }
      };

      EtherEx.getOrderbook();
    }
    catch (e) {
      EtherEx.showError(e);
    }
  };

  $(document).ready(function() {
    // var graph = new Rickshaw.Graph( {
    //   element: document.querySelector("#chart"),
    //   series: [{
    //     color: 'lightblue',
    //     data: [
    //       { x: 0, y: 40 },
    //       { x: 1, y: 49 },
    //       { x: 2, y: 38 },
    //       { x: 3, y: 30 },
    //       { x: 4, y: 32 } ]
    //   }]
    // });
    
    // graph.setRenderer('line');

    // var axes = new Rickshaw.Graph.Axis.Time( { graph: graph } );

    // graph.render();

    $("#tabs").tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );

    $("#check").on('click', function() {
      EtherEx.check();
    });

    $("#buy").on('click', function() {
      if (window.confirm("Buy " + $("#amount").val() + " ETH at " + $("#price").val() + " ETH/XETH ?")) {
        EtherEx.buy();
      }
    });

    $("#sell").on('click', function() {
      if (window.confirm("Sell " + $("#amount").val() + " ETH at " + $("#price").val() + " ETH/XETH ?")) {
        EtherEx.sell();
      }
    });

    $("#to,#tto").on('keyup', function(e) {
      this.addr = EtherEx.getAddress($(this).val());
      if (this.addr.length == 40)
        $(this).val(this.addr);

      this.namereg = EtherEx.getName($(this).val());
      if (this.namereg.length > 0) {
        $(this).css('color', 'rgba(0,0,0,.15)');
        $(this).next('span').html(this.namereg);
      }
      else {
        $(this).css('color', 'rgba(0,0,0)');
        $(this).next('span').html("");
      }
    });
    $("#to,#tto").on('focus', function() {
      $(this).css('color', 'rgba(0,0,0)');
      $(this).next('span').html("");
    });

    $("#toname").on('click', function() {
      $("#to").focus();
    });

    $("#addr").on('keyup', function(e) {
      this.namereg = EtherEx.getName($(this).val());
      if (this.namereg.length > 0)
        $("#addrResult").html(this.namereg);
      else
        $("#addrResult").html("");
    });

    $("#sendeth").on('click', function() {
      if ($("#to").val() == "") {
        alert("Please provide a recipient address.");
        return;
      }
      if (window.confirm("Send " + $("#value").val() + " ETH to " + $("#to").val() + " ?")) {
        EtherEx.sendETH();
      }
    });

    $("#sendxeth").on('click', function() {
      if ($("#to").val() == "") {
        alert("Please provide a recipient address.");
        return;
      }
      if (window.confirm("Send " + $("#value").val() + " XETH to " + $("#to").val() + " ?")) {
        EtherEx.sendXETH();
      }
    });

    $("#create").on('click', function() {
      if ($("#code").val() == "") {
        alert("Please provide the compiled contract code.");
        return;
      }
      if (window.confirm("Create contract with " + $("#gas").val() + " gas?")) {
        EtherEx.create();
      }
    });

    $("#transact").on('click', function() {
      if (window.confirm("Make transaction with " + $("#tgas").val() + " gas?")) {
        EtherEx.transact(
          $("#tto").val(),
          $("#tgas").val(),
          $('#tval').val(),
          $('#data').val()
          // EtherEx.coinbase.pad(32)
          // EtherEx.init[0].pad(32) + EtherEx.init[1].pad(32) + EtherEx.init[2].pad(32) + EtherEx.init[3].pad(32)
        );
      }
    });

    $("#refresh, #clear").on('click', function() {
      EtherEx.clear();
      EtherEx.updateBalances();
    });

    EtherEx.updateBalances();
    $("#to").trigger('keyup');
    eth.watch(EtherEx.markets[1].address, eth.coinbase, EtherEx.updateBalances);
  });

})(jQuery);
