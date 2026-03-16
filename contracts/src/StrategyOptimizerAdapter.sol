// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StrategyOptimizerAdapter
 * @notice Adapter interface: Solidity delegates optimization to Rust (PolkaVM) via a contract or precompile.
 * @dev Invokes targetOptimizer (constructor-set address), which can be a PolkaVM-enabled contract or
 *      precompile as supported by the runtime. Falls back to the Solidity implementation if the call
 *      fails, reverts, or returns invalid data (e.g. wrong length or index out of range).
 *
 *      On PolkaVM Hub pass the deployed optimizer address; on EVM pass address(0) to use default
 *      PVM_OPTIMIZER (call fails, fallback runs). Same formula in both paths; see README.
 *
 *      --- ABI contract with Rust (pvm/strategy_optimizer.rs) ---
 *      - Input: abi.encode(apys, risks); values must fit in u32.
 *      - Output: single uint256 (best index).
 *      - Formula: score = apy - (risk * 100); tie-break: first highest wins.
 */
contract StrategyOptimizerAdapter {
    uint256 internal constant _U32_MAX = type(uint32).max;

    /// @notice Default address used when no optimizer is set at deploy (e.g. EVM simulation).
    address public constant PVM_OPTIMIZER =
        address(0x0000000000000000000000000000000000000800);

    /// @notice Call target: PolkaVM-enabled contract or precompile (as supported by runtime).
    /// @dev Set in constructor; use address(0) on EVM so fallback runs.
    address public immutable targetOptimizer;

    constructor(address _optimizer) {
        targetOptimizer = _optimizer != address(0) ? _optimizer : PVM_OPTIMIZER;
    }

    /**
     * @notice Get the index of the best strategy based on APY and risk
     * @dev Score formula: score = apy - (risk * 100)
     *      APY is expected in basis points (e.g., 800 = 8.00%).
     *      Returns the first highest score in case of ties.
     * @param apys Array of APY values
     * @param risks Array of risk scores
     * @return bestIndex Index of the strategy with the highest score
     */
    function getBestStrategyIndex(
        uint256[] memory apys,
        uint256[] memory risks
    ) external view returns (uint256 bestIndex) {
        require(apys.length > 0, "StrategyOptimizerAdapter: empty inputs");
        require(apys.length == risks.length, "StrategyOptimizerAdapter: length mismatch");

        // Enforce the ABI contract with the Rust module: values must fit into u32.
        // This keeps behavior consistent between:
        // - EVM fallback (Solidity)
        // - PolkaVM path (Rust expects u32 slices)
        for (uint256 i = 0; i < apys.length; i++) {
            require(apys[i] <= _U32_MAX, "StrategyOptimizerAdapter: apy too large");
            require(risks[i] <= _U32_MAX, "StrategyOptimizerAdapter: risk too large");
        }

        // Invoke PVM optimizer (contract or precompile) at targetOptimizer.
        bytes memory encoded = abi.encode(apys, risks);
        (bool success, bytes memory data) = targetOptimizer.staticcall(encoded);

        if (success && data.length >= 32) {
            bestIndex = abi.decode(data, (uint256));
            // Valid index: return it. Invalid index (e.g. >= length) → fallback.
            if (bestIndex < apys.length) {
                return bestIndex;
            }
        }

        // Fallback: call failed, reverted, or returned invalid data (see README).
        int256 bestScore = _score(apys[0], risks[0]);
        bestIndex = 0;

        for (uint256 i = 1; i < apys.length; i++) {
            int256 s = _score(apys[i], risks[i]);
            if (s > bestScore) {
                bestScore = s;
                bestIndex = i;
            }
        }
    }

    function _score(uint256 apy, uint256 risk) internal pure returns (int256) {
        // Cast to int256 to allow subtraction.
        // `risk * 100` is safe for the small demo values but uses checked arithmetic in 0.8.x.
        return int256(apy) - int256(risk * 100);
    }
}

