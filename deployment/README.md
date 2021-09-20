# MIS Token contract deployment
Deployment commands are listed for various networks

## Testing
### Hardhat network
```bash
$npx hardhat run --network hardhat deployment/hardhat/deploy_hardhat.js
```
### Mainnet
* BSC
```bash
npx hardhat run --network bsc deployment/mainnet/BSC/deploy_mainnet_bsc.js
```
* ETH
```bash
npx hardhat run --network eth deployment/mainnet/ETH/deploy_mainnet_eth.js
```
### Testnet
* BSCTestnet
```bash
npx hardhat run --network bsctestnet deployment/testnet/BSCTestnet/deploy_testnet_bsc.js
```
* Rinkeby
```bash
npx hardhat run --network rinkeby deployment/testnet/Rinkeby/deploy_testnet_eth.js
```