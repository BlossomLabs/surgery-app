require('dotenv').config()

require('@1hive/hardhat-aragon')
require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-truffle5')
require('@nomiclabs/hardhat-web3')
require('hardhat-deploy')
require('hardhat-gas-reporter')
require('solidity-coverage')

const { node_url, accounts } = require('./utils/network')

process.removeAllListeners('warning')
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.4.24',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000,
          },
        },
      },
    ],
  },
  aragon: {
    appEnsName: 'surgery.open.aragonpm.eth',
    appContractName: 'Surgery',
    appRoles: [
    ],
    appBuildOutputPath: 'public/',
  },
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0,
      // process.env.HARDHAT_FORK will specify the network that the fork is made from.
      // this line ensure the use of the corresponding accounts
      accounts: accounts(process.env.HARDHAT_FORK),
      forking: process.env.HARDHAT_FORK
        ? {
            url: node_url(process.env.HARDHAT_FORK),
            blockNumber: process.env.HARDHAT_FORK_NUMBER
              ? parseInt(process.env.HARDHAT_FORK_NUMBER)
              : undefined,
          }
        : undefined,
    },
    localhost: {
      url: node_url('localhost'),
      accounts: accounts(),
      ensRegistry: '0xaafca6b0c89521752e559650206d7c925fd0e530',
    },
    mainnet: {
      url: node_url('mainnet'),
      accounts: accounts('mainnet'),
      appEnsName: 'batcher.open.aragonpm.eth',
    },
    xdai: {
      url: node_url('xdai'),
      accounts: accounts('xdai'),
      ensRegistry: '0xaafca6b0c89521752e559650206d7c925fd0e530',
    },
    polygon: {
      url: node_url('polygon'),
      accounts: accounts('polygon'),
      ensRegistry: '0x7EdE100965B1E870d726cD480dD41F2af1Ca0130',
    },
    mumbai: {
      url: node_url('mumbai'),
      accounts: accounts('mumbai'),
      ensRegistry: '0xB1576a9bE5EC445368740161174f3Dd1034fF8be',
    },
    arbitrum: {
      url: node_url('arbitrum'),
      accounts: accounts('arbitrum'),
      ensRegistry: '0xB1576a9bE5EC445368740161174f3Dd1034fF8be',
    },
    arbtest: {
      url: node_url('arbtest'),
      accounts: accounts('arbtest'),
      ensRegistry: '0x73ddD4B38982aB515daCf43289B41706f9A39199',
    },
    frame: {
      url: 'http://localhost:1248',
      httpHeaders: { origin: 'hardhat' },
      timeout: 0,
      gas: 0,
    },
  },
  ipfs: {
    gateway: 'https://ipfs.blossom.software/',
    pinata: {
      key: process.env.PINATA_KEY || '',
      secret: process.env.PINATA_SECRET_KEY || '',
    },
  },
  gasReporter: {
    enabled: !!process.env.REPORT_GAS,
  },
  mocha: {
    timeout: 0,
  },
  external: process.env.HARDHAT_FORK
    ? {
        deployments: {
          // process.env.HARDHAT_FORK will specify the network that the fork is made from.
          // these lines allow it to fetch the deployments from the network being forked from both for node and deploy task
          hardhat: ['deployments/' + process.env.HARDHAT_FORK],
          localhost: ['deployments/' + process.env.HARDHAT_FORK],
        },
      }
    : undefined,
}
