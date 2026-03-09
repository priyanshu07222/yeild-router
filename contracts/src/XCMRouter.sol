// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title XCMRouter
 * @notice Simulates Polkadot XCM cross-chain asset transfers between parachains
 * @dev This contract does NOT move tokens. It only emits an event to demonstrate
 *      cross-chain messaging in a DeFi yield router context.
 *
 *      In production, this would integrate with Polkadot XCM via chain-specific
 *      precompiles, pallets, or messaging endpoints to dispatch an actual XCM
 *      message and coordinate asset movements across parachains.
 */
contract XCMRouter {
    /**
     * @notice Emitted when a simulated cross-chain transfer is requested
     * @param fromChain Source parachain identifier (simulated)
     * @param toChain Destination parachain identifier (simulated)
     * @param strategy Strategy contract address associated with the transfer
     * @param amount Amount being "transferred" (simulated)
     */
    event XCMTransfer(
        uint256 indexed fromChain,
        uint256 indexed toChain,
        address indexed strategy,
        uint256 amount
    );

    /**
     * @notice Simulate sending an XCM message for a cross-chain transfer
     * @dev Emits {XCMTransfer}. No tokens are moved and no message is actually dispatched.
     * @param fromChain Source parachain identifier (simulated)
     * @param toChain Destination parachain identifier (simulated)
     * @param strategy Strategy contract address associated with the transfer
     * @param amount Amount being "transferred" (simulated)
     */
    function sendXCM(
        uint256 fromChain,
        uint256 toChain,
        address strategy,
        uint256 amount
    ) external {
        require(strategy != address(0), "XCMRouter: invalid strategy");
        require(amount > 0, "XCMRouter: amount must be greater than 0");

        emit XCMTransfer(fromChain, toChain, strategy, amount);
    }
}

