// let request = require("request");
let rp = require('request-promise');

let urls = [
  'https://www.bitoex.com/api/v1/get_rate',
  'https://www.maicoin.com/api/prices/eth-twd',
  'https://api.bitfinex.com/v1/pubticker/ethbtc',
  'https://api.bitfinex.com/v1/pubticker/btcusd',
  'http://asper-bot-rates.appspot.com/currency.json',
  'https://www.okcoin.com/api/v1/ticker.do?symbol=btc_usd',
]

let promises = urls.map(url => {
  return rp({uri: url, json: true});
})

Promise.all(promises).then(values => {
  // console.log(values);
  let bitoex_btc_twd_price = values[0].buy;
  let mai_eth_twd_price = values[1].raw_sell_price / 100000;
  let bfnx_eth_btc_price = values[2].ask; // lowest ask
  let bfnx_btc_usd_price = values[3].bid; // highest bid
  let usd_twd_buy_price = values[4].rates.USD.buySpot;
  let usd_twd_sell_price = values[4].rates.USD.sellSpot;
  let okcoin_btc_usd_price = values[5].ticker.sell; // lowest

  let bfnx_taker_fee_rate = 0.002;
  let bfnx_withdraw_fee_rate = 0.01;
  let okcoin_deposit_fee_rate = 0.001;
  let okcoin_withdraw_fee = 0.0005;

  let ratio, roi, principal, startTwd, finalTwd;
  let message = '';

  // Plan A
  ratio = 1 / bitoex_btc_twd_price * bfnx_btc_usd_price * (1 - bfnx_taker_fee_rate) * (1 - bfnx_withdraw_fee_rate) * usd_twd_buy_price;
  roi = (ratio - 1) * 100;
  message += 'Plan A:\n';
  message += 'Bitoex(TWD->BTC) + Bitfinex(BTC->USD->TWD)\n';
  message += 'roi: ' + roi.toFixed(3) + ' %\n';
  message += '------------\n';

  // Plan B
  ratio = 1 / bitoex_btc_twd_price / bfnx_eth_btc_price * (1 - bfnx_taker_fee_rate) * mai_eth_twd_price;
  roi = (ratio - 1) * 100;
  message += 'Plan B:\n';
  message += 'Bitoex(TWD->BTC) + Bitfinex(BTC->ETH) + Maicoin(ETH->TWD)\n';
  message += 'roi: ' + roi.toFixed(3) + ' %\n';
  message += '------------\n';

  // Plan C
  function planC(principal) {
    let final = (principal / usd_twd_sell_price - 10) * (1 - okcoin_deposit_fee_rate);
    final = final / okcoin_btc_usd_price - okcoin_withdraw_fee;
    final = final * bfnx_btc_usd_price * (1 - bfnx_taker_fee_rate);
    final = final * (1 - bfnx_withdraw_fee_rate) * usd_twd_buy_price;
    let roi = ((final / principal) - 1) * 100
    return roi
  }
  message += 'Plan C:\n';
  message += 'OKCoin(TWD->USD->BTC) + Bitfinex(BTC->USD->TWD)\n';
  for(let principal of [50000, 100000]) {
    message += 'principal: ' + principal.toString() + ' TWD, ';
    message += 'roi: ' + planC(principal).toFixed(3) + ' %\n';
  }
  message += '------------\n';

  // Plan D
  function planD(principal) {
    let final = (principal / usd_twd_sell_price - 10) * (1 - okcoin_deposit_fee_rate);
    final = final / okcoin_btc_usd_price - okcoin_withdraw_fee;
    final = final / bfnx_eth_btc_price * (1 - bfnx_taker_fee_rate);
    final = final * mai_eth_twd_price;
    let roi = ((final / principal) - 1) * 100
    return roi;
  }
  message += 'Plan D:\n';
  message += 'OKCoin(TWD->USD->BTC) + Bitfinex(BTC->ETH) + Maicoin(ETH->TWD)\n';
  for(let principal of [50000, 100000]) {
    message += 'principal: ' + principal.toString() + ' TWD, ';
    message += 'roi: ' + planD(principal).toFixed(3) + ' %\n';
  }
  message += '------------\n';

  console.log(message);
});
