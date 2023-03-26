pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/common/IForwarder.sol";


contract Surgery is AragonApp, IForwarder {

    string private constant ERROR_IS_NOT_INITIALIZABLE = "SURGERY_IS_NOT_INITIALIZABLE";
    string private constant ERROR_CANNOT_FORWARD = "ERROR_CANNOT_FORWARD";

    event PerformedSurgery(address indexed surgeon, uint256 slot, bytes32 value);
    event PerformedCallScript(address indexed surgeon, bytes script);

    function initialize() onlyInit public {
        require(false, ERROR_IS_NOT_INITIALIZABLE);
    }

    function operate(uint256 slot, bytes32 value) isInitialized external {
        assembly {
            sstore(slot, value)
        }

        emit PerformedSurgery(msg.sender, slot, value);
    }

    function forward(bytes evmCallScript) public {
        require(canForward(msg.sender, evmCallScript), ERROR_CANNOT_FORWARD);
        runScript(evmCallScript, new bytes(0), new address[](0));

        emit PerformedCallScript(msg.sender, evmCallScript);
    }

    function canForward(address sender, bytes evmCallScript) public view returns (bool) {
        return hasInitialized();
    }

    function isForwarder() public pure returns (bool) {
        return true;
    }
}
