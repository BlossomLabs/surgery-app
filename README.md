Surgery Aragon App 👨🏻‍⚕️
=====================

Surgery is an Aragon app that allows updating specific portions of the storage value at a given slot without affecting the surrounding data. This can be useful for making targeted changes to contract storage in case of emergencies or necessary updates.

Security considerations
-----------------------

> **☢️ Use with the utmost care, irreversible damage can be done ☢️**

Always exercise caution when using the Surgery app, as it enables direct manipulation of contract storage. Ensure that you have a clear understanding of the intended changes and potential consequences before performing any actions, and always test your changes in a test environment before performing them in a production environment.

Features
--------

What a Surgeon can do with this app:
-   Surgery: Update a specific portion of a storage value at a given slot without affecting surrounding data.
-   Phone Calls: Forward an EVM call script through the contract.
-   Emergency Kit: Recover the app's funds in case of emergency.

Installation
------------

The Surgery app is not intended to be installed as a standalone app in an Aragon DAO. Instead, it should be used as a temporary upgrade to an existing, initialized app to perform necessary actions or updates, and then the app should be downgraded back to its previous code.

To use the Surgery app for an existing Aragon app, follow these steps:

1.  Deploy the Surgery app contract to the same network as the existing app.
2.  Ensure you have the necessary permissions and authority to upgrade the existing app.
3.  Upgrade the existing app to the deployed Surgery app contract address, effectively replacing the existing app's code with the Surgery app's code.
4.  Perform the required actions using the Surgery app's functions.
5.  Downgrade the app back to its original code by upgrading it to the previous contract address.

You can use [EVMcrispr](https://evmcrispr.com) to perform these steps in a single transaction.

```text
load aragonos as ar
ar:connect token-manager voting (
  upgrade <your-app> <surgery-app-address>
  # Perform surgery actions here
  upgrade <your-app> <previous-app-address>
)
```

Usage
-----

### Updating storage values

To update a portion of the storage value at a given slot, call the `operate` function with the following parameters:

-   `slot`: The storage slot where the value is stored.
-   `value`: The new value to be stored in the specified portion of the storage slot.
-   `offset`: The right-to-left byte offset within the storage slot where the new value will be placed (0 to 31).
-   `size`: The size in bytes of the value to be updated (1 to 32).

Example (using [EVMcrispr](https://evmcrispr.com)):

```text
# Disable the maxAccountTokens setting in the Token Manager app

load aragonos as ar

set $operateABI operate(uint256,uint256,uint256,uint256)
set $slot 1
set $value 0
set $offset 0
set $size 32

ar:connect token-manager voting (
  upgrade token-manager <surgery-app-address>
  exec token-manager $operateABI $slot $value $offset $size
  upgrade token-manager latest
)
```

### Forwarding EVM call scripts

To forward an EVM call script through the contract, call the `forward` function with the following parameter:

-   `evmCallScript`: The EVM call script to be forwarded.

Example (using [EVMcrispr](https://evmcrispr.com)):

```text
# Change the token transferability from the Token Manager app

load aragonos as ar

ar:connect token-manager voting (
  set $token token-manager::token()

  upgrade token-manager <surgery-app-address>
  forward $token (
    exec $token enableTransfers(bool) true
  )
  upgrade token-manager latest
)
```

### Recovering funds

To recover the app's funds in case of not knowing how much tokens there will be in the moment of the vote execution,
call the `withdraw` function with the following parameters:

-  `token`: The address of the token to be withdrawn.
-  `to`: The address where the funds will be sent.

Example (using [EVMcrispr](https://evmcrispr.com)):

```text
# Recover ETH and DAI from the voting app

load aragonos as ar

ar:connect token-manager voting (
  set $recoveryAddress <your-recovery-address>

  upgrade voting <surgery-app-address>
  exec voting withdraw ETH $recoveryAddress
  exec voting withdraw @token(DAI) $recoveryAddress
  upgrade voting latest
)
```


Events
------

The Surgery app emits the following events:

-   `PerformedSurgery`: Emitted when a surgery operation is performed, including the surgeon's address, storage slot, and updated value.
-   `PerformedCallScript`: Emitted when an EVM call script is forwarded through the contract, including the surgeon's address and the executed script.
-   `PerformedTransfer`: Emitted when the app's funds are transferred, including the surgeon's address, the recovery address, and the amount transferred.

Contributing
------------

Contributions to the Surgery app are welcome. Please follow the [Aragon contribution guidelines](https://github.com/aragon/CONTRIBUTING.md) for more information on how to contribute.

License
-------

The Surgery app is released under the [AGPL-3.0](LICENSE) license.