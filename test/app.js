/* global artifacts contract beforeEach it assert */

const { injectWeb3, injectArtifacts } = require('@1hive/contract-helpers-test')
const { newDao, installNewApp } = require('@1hive/contract-helpers-test/src/aragon-os')
const { isAddress } = require('ethers/lib/utils')

injectWeb3(web3)
injectArtifacts(artifacts)

const Surgery = artifacts.require('Surgery.sol')

contract('Surgery', ([appManager, user]) => {
  let surgeryBase, app

  const APP_ID = '0x1234123412341234123412341234123412341234123412341234123412341234'

  before(async () => {
    // Deploy the app's base contract
    surgeryBase = await Surgery.new()
  })

  beforeEach('deploy dao and app', async () => {
    const { dao } = await newDao(appManager)
    app = Surgery.at(await installNewApp(dao, APP_ID, surgeryBase.address, appManager))
  })

  it('app should be deployed', async () => {
    assert.isTrue(isAddress((await app).address), 'app should be initialized')
  })
})
