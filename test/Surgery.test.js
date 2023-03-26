/* global artifacts contract beforeEach it assert */

const { injectWeb3, injectArtifacts, bn } = require('@1hive/contract-helpers-test')
const { newDao, installNewApp, encodeCallScript, EMPTY_CALLS_SCRIPT } = require('@1hive/contract-helpers-test/src/aragon-os')
const { assertRevert, assertBn } = require('@1hive/contract-helpers-test/src/asserts')

injectWeb3(web3)
injectArtifacts(artifacts)

const APP_BASES_NAMESPACE = '0xf1f3eb40f5bc1ad1344716ced8b8a0431d840b5783aea1fd01786bc26f35ac0f'

const Surgery = artifacts.require('Surgery.sol')
const Patient = artifacts.require('Patient.sol')
const AppProxyUpgradeable = artifacts.require('AppProxyUpgradeable.sol')
const ExecutionTarget = artifacts.require('ExecutionTarget')

contract('Surgery', ([appManager, user]) => {
  let dao, surgeryBase, patientBase, patient, executionTarget

  const PATIENT_APP_ID = '0x1234123412341234123412341234123412341234123412341234123412341234'
  const SURGERY_APP_ID = '0x1234123412341234123412341234123412341234123412341234123412341235'

  before(async () => {
    // Deploy the app's base contract
    surgeryBase = await Surgery.new()
    patientBase = await Patient.new()
  })

  beforeEach('deploy dao and patient app', async () => {
    ({ dao } = await newDao(appManager));
    patient = await Patient.at(await installNewApp(dao, PATIENT_APP_ID, patientBase.address, appManager))

    // Install the first instance of the Patient app
    patient = await Patient.at(await installNewApp(dao, PATIENT_APP_ID, patientBase.address, appManager));
    await patient.initialize();

    // Install the second instance of the Patient app
    patient2 = await Patient.at(await installNewApp(dao, PATIENT_APP_ID, patientBase.address, appManager));

    assert.isTrue(await patient.hasInitialized(), 'patient app should be initialized')
    assert.isFalse(await patient2.hasInitialized(), 'patient2 app should not be initialized')
    assert.equal(await patient.bar(), '0xDEADbEeF000000000000000000000000DeaDbeEf', 'bar variable should be initialized')
  })

  it('should not be initializable', async () => {
    const surgery = await Surgery.at(await installNewApp(dao, SURGERY_APP_ID, surgeryBase.address, appManager))
    await assertRevert(surgery.initialize(), 'SURGERY_IS_NOT_INITIALIZABLE');
  })

  context('when the surgery app is an upgrade to the patient app', () => {
    beforeEach(async () => {
      executionTarget = await ExecutionTarget.new()
      await dao.setApp(APP_BASES_NAMESPACE, PATIENT_APP_ID, surgeryBase.address)
      surgery = await Surgery.at(patient.address)
    })

    it('should be an upgrade to a patient app', async () => {
      const proxy = await AppProxyUpgradeable.at(patient.address)
      assert.equal(await proxy.implementation(), surgeryBase.address, 'surgery should be an upgrade to patient')
    })

    async function performSurgery(slot, newValue, offset, size) {
      const tx = await surgery.operate(slot, newValue, offset, size, { from: user });

      // Update the base contract to the previous version
      await dao.setApp(APP_BASES_NAMESPACE, PATIENT_APP_ID, patientBase.address);
      patient = await Patient.at(patient.address);

      assert.equal(tx.logs.length, 1, 'should have emitted one event');
      assert.equal(tx.logs[0].event, 'PerformedSurgery', 'event should be PerformedSurgery');
      assert.equal(tx.logs[0].args.surgeon, user, 'event surgeon should be the sender');
      assert.equal(tx.logs[0].args.slot.toNumber(), slot, 'event slot should be the expected value');
      assertBn(tx.logs[0].args.value, bn(newValue), 'event value should be the expected value');
    }

    it('should update the entire storage value', async () => {
      const slot = 0; // Assuming 'foo' variable is stored at slot 0
      const newValue = web3.utils.sha3('test_value'); // New bytes32 value

      await performSurgery(slot, newValue, 0, 32);

      const updatedBar = await patient.foo();
      assert.equal(updatedBar, newValue, 'foo variable should be updated');
    });

    it('should update the first few bytes of the storage value', async () => {
      const slot = 1; // Assuming 'bar' variable is stored at slot 1
      const newValue = '0x1337000000000000000000000000000000001337'; // New address value

      await performSurgery(slot, newValue, 0, 20);

      const updatedBar = await patient.bar();
      assert.equal(updatedBar, newValue, 'bar variable should be updated');
    });

    it('should update the middle bytes of a storage value', async () => {
      const slot = 1; // Assuming 'baz' variable is stored at slot 1
      const newValue = 42; // New uint8 value

      await performSurgery(slot, newValue, 20, 1);

      const updatedBaz = await patient.baz();
      assert.equal(updatedBaz, newValue, 'baz variable should be updated');
    });

    it('should update the last few bytes of a storage value', async () => {
      const slot = 1; // Assuming 'qux' variable is stored at slot 1
      const newValue = 42; // New uint8 value

      await performSurgery(slot, newValue, 20 + 1, 11);

      const updatedBaz = await patient.qux();
      assert.equal(updatedBaz, newValue, 'qux variable should be updated');
    });

    it('should revert when surgery is not allowed', async () => {
      const slot = 10;
      const value = web3.utils.sha3('test_value');

      await dao.setApp(APP_BASES_NAMESPACE, PATIENT_APP_ID, surgeryBase.address, { from: appManager });
      surgery = await Surgery.at(patient2.address);

      await assertRevert(surgery.operate(slot, value, 0, 0, { from: user }), 'INIT_NOT_INITIALIZED');
    });

    it('should revert when the offset is too big', async () => {
      const slot = 1;
      const newValue = 42;
    
      await assertRevert(
        performSurgery(slot, newValue, 32, 1),
        'SURGERY_OFFSET_TOO_BIG'
      );
    });
    
    it('should revert when the size is too big', async () => {
      const slot = 1;
      const newValue = 42;
    
      await assertRevert(
        performSurgery(slot, newValue, 0, 33),
        'SURGERY_SIZE_TOO_BIG'
      );
    });
    
    it('should revert when the offset + size is too big', async () => {
      const slot = 1;
      const newValue = 42;
    
      await assertRevert(
        performSurgery(slot, newValue, 16, 17),
        'SURGERY_SIZE_TOO_BIG'
      );
    });
    
    it('should revert when the value is too big for the specified size', async () => {
      const slot = 1;
      const newValue = 1 << 8; // A value too big to fit into 1 byte
    
      await assertRevert(
        performSurgery(slot, newValue, 20, 1),
        'SURGERY_VALUE_TOO_BIG'
      );
    });

    it('should forward call script', async () => {
      const action = { to: executionTarget.address, calldata: executionTarget.contract.methods.execute().encodeABI() }
      const callScript = encodeCallScript([action])

      const tx = await surgery.forward(callScript, { from: user });

      assert.equal(tx.logs.length, 2, 'should have emitted two events');

      assert.equal(tx.logs[0].event, 'ScriptResult', 'event should be ScriptResult');
      assert.equal(tx.logs[0].args.script, callScript, 'event script should be the expected value');

      assert.equal(tx.logs[1].event, 'PerformedCallScript', 'event should be PerformedCallScript');
      assert.equal(tx.logs[1].args.surgeon, user, 'event surgeon should be the sender');
      assert.equal(tx.logs[1].args.script, callScript, 'event script should be the expected value');
    });


    it('should revert when forward is not allowed', async () => {
      await dao.setApp(APP_BASES_NAMESPACE, PATIENT_APP_ID, surgeryBase.address, { from: appManager });
      surgery = await Surgery.at(patient2.address);
      const callScript = EMPTY_CALLS_SCRIPT;
      await assertRevert(surgery.forward(callScript, { from: user }), 'SURGERY_CANNOT_FORWARD');
    });
  })
})
