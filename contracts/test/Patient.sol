pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/common/IForwarder.sol";


contract Patient is AragonApp {

    bytes32 public constant ERROR_CANNOT_INITIALIZE = keccak256("ERROR_CANNOT_INITIALIZE");
    bytes32 public constant ERROR_CANNOT_FORWARD = keccak256("ERROR_CANNOT_FORWARD");

    bytes32 public foo = 0xdeadbeef;
    address public bar = 0xdeadbeef;
    uint8 public baz = 33;


    function initialize() onlyInit public {
        initialized();
    }
}
