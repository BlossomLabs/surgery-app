/* global artifacts contract beforeEach it assert */

const { injectWeb3, injectArtifacts } = require('@1hive/contract-helpers-test')
const { newDao, installNewApp } = require('@1hive/contract-helpers-test/src/aragon-os')
const { assertRevert } = require('@1hive/contract-helpers-test/src/asserts')

injectWeb3(web3)
injectArtifacts(artifacts)

const Surgery = artifacts.require('Surgery.sol')
const Patient = artifacts.require('Patient.sol')

contract('Surgery', ([appManager, user]) => {
  let dao, surgeryBase, patientBase, patient

  const APP_ID = '0x1234123412341234123412341234123412341234123412341234123412341234'
  const APP_ID_2 = '0x1234123412341234123412341234123412341234123412341234123412341235'

  before(async () => {
    // Deploy the app's base contract
    surgeryBase = await Surgery.new()
    patientBase = await Patient.new()
  })

  beforeEach('deploy dao and app', async () => {
    ({ dao } = await newDao(appManager));
    patient = await Patient.at(await installNewApp(dao, APP_ID, patientBase.address, appManager))
    await patient.initialize();
  })

  it('should initialize Patient', async () => {
    assert.isTrue(await patient.hasInitialized(), 'app should be initialized')
  })

  it('should not allow initialize Surgery', async () => {
    const surgery = await Surgery.at(await installNewApp(dao, APP_ID_2, surgeryBase.address, appManager))
    await assertRevert(surgery.initialize(), 'SURGERY_IS_NOT_INITIALIZABLE');
  })
})
