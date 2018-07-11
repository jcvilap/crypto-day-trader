# Crypto Day-Trader
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/jcvilap/artificial-trader)

## Milestones
#### Setup
- [x] Set up a Node server and deploy it to Heroku
- [x] Setup a Mongo instance in mLab and connect to it from Node

#### Server
- [ ] Handle security based on Robinhood account
- [ ] Listen to changes on selected crypto-currency (for now only one currency is supported)
- [ ] Hold feeds in a local data structure
- [ ] Fetch user account info from Robinhood
- [x] Define `Rule` class
- [x] Fetch user `rules` from database
- [ ] Enable Buy/Sell actions
- [ ] Perform analysis based on `rules`
- [ ] Alert via email/SMS/native notifications when a transaction happened

### Rules
I define a `Rule` as a single instance of multiple trading strategies to be used by the `Engine`. Rules can be defined by the user and will be stored in the Mongo instance

### License

Copyright (c) 2018 Mauer Principles Inc

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

