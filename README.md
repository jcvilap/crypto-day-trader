# Artificial Trader

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/jcvilap/artificial-trader)


## Milestones
#### Setup
- [x] Set up a Node server and deploy it to Heroku
- [ ] Setup a Mongo instance in mLab and connect to it from Node
- [ ] Deploy Client app to Surge.sh and point server calls to server's APIs
- [ ] Create an API interact with Rules
#### Server
- [ ] Connect to GDAX sandboxes for development and production environment 
- [ ] Handle security based on GDAX/Coinbase account
- [ ] Listen to changes on crypto-currencies
- [ ] Store and read user preferences and gather what currencies to watch and what rules to apply
- [ ] Enable Buy/Sell, Taker/Maker actions based on user preferences
- [ ] Build an engine to analyze data and come up with limits for specific timeframes. Identify walls an use them to come up with smart limits
- [ ] Perform transactions based on analysis
- [ ] Alert via email/SMS/native notifications when a transaction happened
### Client
- [ ] Enable new users to enter their Coinbase credentials
- [ ] Enable user to create or reuse rules. Which will affect the percentage-risk for automated trading
- [ ] Enable user to start/stop their artificial traders
- [ ] Connect via Websockets to show transactions realtime
- [ ] Show statistics, history and performance 
## Docs
### Rules
I define a `Rule` as a single instance of multiple trading strategies to be used by the `Engine`. Rules can be defined by the user and will be stored in the Mongo instance
######Attributes // TODO

## Additional thoughts:
- Create both Desktop and Web versions and share the code as much as possible
- Enable the user to select what currency to watch
- Enable user settings in general including the above mentioned and also rules created and current rules used
- Enable notifications by email or text messages. Also use the native notifications API in the browser

