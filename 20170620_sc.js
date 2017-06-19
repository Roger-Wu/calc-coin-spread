// let request = require("request");
let rp = require('request-promise');

let urls = [
  'https://poloniex.com/public?command=returnTicker',
  'https://yunbi.com/api/v2/tickers',
  // 'https://www.bitoex.com/api/v1/get_rate',
  // 'https://www.maicoin.com/api/prices/eth-twd',
  // 'https://api.bitfinex.com/v1/pubticker/ethbtc',
  // 'https://api.bitfinex.com/v1/pubticker/btcusd',
  // 'http://asper-bot-rates.appspot.com/currency.json',
  // 'https://www.okcoin.com/api/v1/ticker.do?symbol=btc_usd',
]



function calc() {
  let promises = urls.map(url => {
    return rp({uri: url, json: true});
  })

  Promise.all(promises).then(values => {
    // console.log(values[1]);
    let polo_sc_btc = values[0].BTC_SC.last
    let yunbi_sc_cny = values[1].sccny.ticker.last
    let yunbi_btc_cny = values[1].btccny.ticker.last

    let yunbi_sc_btc = yunbi_sc_cny / yunbi_btc_cny;

    let polo_taker_fee = 0.0025;
    let yunbi_btc_trading_fee = 0.002;
    let yunbi_sc_trading_fee = 0.001;

    let time = new Date();
    console.log(time);
    console.log('polo_sc_btc', polo_sc_btc);
    console.log('yunbi_sc_btc', yunbi_sc_btc);
    console.log('spread:', ((yunbi_sc_btc / polo_sc_btc) - 1) * 100, '%');
    setTimeout(calc, 2000);
  });
}

calc();