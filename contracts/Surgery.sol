pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/common/IForwarder.sol";

import "hardhat/console.sol";

contract Surgery is AragonApp, IForwarder {

    string private constant ERROR_IS_NOT_INITIALIZABLE = "SURGERY_IS_NOT_INITIALIZABLE";
    string private constant ERROR_OFFSET_TOO_BIG = "SURGERY_OFFSET_TOO_BIG";
    string private constant ERROR_SIZE_TOO_BIG = "SURGERY_SIZE_TOO_BIG";
    string private constant ERROR_VALUE_TOO_BIG = "SURGERY_VALUE_TOO_BIG";
    string private constant ERROR_CANNOT_FORWARD = "SURGERY_CANNOT_FORWARD";

    event PerformedSurgery(address indexed surgeon, uint256 slot, uint256 value);
    event PerformedCallScript(address indexed surgeon, bytes script);

    /**
     * @notice This function should not be called as the Surgery contract is not initializable
     */
    function initialize() onlyInit public {
        require(false, ERROR_IS_NOT_INITIALIZABLE);
    }

    /**
     * @notice Update a portion of the storage value at the slot `slot` with the value `value`, without affecting the
     * surrounding data, starting at byte offset `offset` and with a size of `size` bytes
     * @param slot The storage slot where the value is stored.
     * @param value The new value to be stored in the specified portion of the storage slot.
     * @param offset The right-to-left byte offset within the storage slot where the new value will be placed (0 to 31).
     * @param size The size in bytes of the value to be updated (1 to 32).
     */
    function operate(uint256 slot, uint256 value, uint256 offset, uint256 size) isInitialized external {
        require(offset < 32, ERROR_OFFSET_TOO_BIG);
        require(size <= 32 && offset + size <= 32, ERROR_SIZE_TOO_BIG); // We check both because of a possible overflow
        // When size is 32, 2**(size * 8) overflows, but it's still valid as `2**(32 * 8) - 1` overflow back to the maximum possible value.
        require(value <= 2 ** (size * 8) - 1, ERROR_VALUE_TOO_BIG); 
        assembly {
            let originalValue := sload(slot)
            let updateMask := sub(exp(2, mul(size, 8)), 1) // Create the mask based on the size in bytes
            let shiftedUpdateMask := mul(updateMask, exp(2, mul(offset, 8))) // Shift the mask according to the offset by multiplying instead of using shl
            let shiftedValue := mul(value, exp(2, mul(offset, 8))) // Shift the value by multiplying instead of using shl
            let updatedValue := or(and(originalValue, not(shiftedUpdateMask)), and(shiftedValue, shiftedUpdateMask))
            sstore(slot, updatedValue)
        }

        emit PerformedSurgery(msg.sender, slot, value);
    }

    /**
     * @notice Forward an EVM call script `evmCallScript` through this contract
     * @param evmCallScript The EVM call script to be forwarded
     */
    function forward(bytes evmCallScript) public {
        require(canForward(msg.sender, evmCallScript), ERROR_CANNOT_FORWARD);
        runScript(evmCallScript, new bytes(0), new address[](0));

        emit PerformedCallScript(msg.sender, evmCallScript);
    }

    /**
     * @notice Check if the sender `sender` is allowed to forward the EVM call script `evmCallScript`
     *  @param sender The address of the sender
     * @param evmCallScript The EVM call script to be checked
     */
    function canForward(address sender, bytes evmCallScript) public view returns (bool) {
        return hasInitialized();
    }

    /**
     * @notice Check if this contract is an Aragon forwarder
     * @return Always true
     */
    function isForwarder() public pure returns (bool) {
        return true;
    }
}
