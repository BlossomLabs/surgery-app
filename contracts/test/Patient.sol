pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/common/IForwarder.sol";


contract Patient is AragonApp {

    bytes32 public foo;
    address public bar;
    uint8 public baz;
    uint88 public qux;

    function initialize() onlyInit public {
        foo = keccak256("foo");
        bar = 0xDEADbEeF000000000000000000000000DeaDbeEf;
        baz = 33;
        qux = 88;
        initialized();
    }
}
