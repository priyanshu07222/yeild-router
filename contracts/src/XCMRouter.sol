// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title XCMRouter
 * @notice Routing layer: Vault → XCMRouter → XCM precompile (see README).
 * @dev When xcmPrecompile is set, sendXCM calls it then emits XCMTransfer. When zero, only emits.
 *      Payload is simplified for demonstration: abi.encode(fromChain, toChain, strategy, amount).
 *      Real XCM messages typically include execution weight limits, fee assets, and origin context.
 */
contract XCMRouter {
    /// @notice XCM precompile address; when set, sendXCM forwards the call to it (see README).
    address public immutable xcmPrecompile;

    constructor(address _xcmPrecompile) {
        xcmPrecompile = _xcmPrecompile;
    }

    /**
     * @notice Emitted when a cross-chain transfer is requested (simulation or after XCM precompile)
     */
    event XCMTransfer(
        uint256 indexed fromChain,
        uint256 indexed toChain,
        address indexed strategy,
        uint256 amount
    );

    /**
     * @notice Send XCM: when xcmPrecompile is set, calls it; always emits XCMTransfer.
     * @dev In this demo, fromChain/toChain are EVM chain IDs (as passed by Vault). In production, caller would pass parachain IDs for XCM routing (README). Payload simplified: abi.encode(fromChain, toChain, strategy, amount). Precompile ABI is chain-specific.
     */
    function sendXCM(
        uint256 fromChain,
        uint256 toChain,
        address strategy,
        uint256 amount
    ) external {
        require(strategy != address(0), "XCMRouter: invalid strategy");
        require(amount > 0, "XCMRouter: amount must be greater than 0");

        if (xcmPrecompile != address(0)) {
            bytes memory payload = abi.encode(fromChain, toChain, strategy, amount);
            (bool ok,) = xcmPrecompile.call(payload);
            require(ok, "XCMRouter: precompile call failed");
        }

        emit XCMTransfer(fromChain, toChain, strategy, amount);
    }
}

