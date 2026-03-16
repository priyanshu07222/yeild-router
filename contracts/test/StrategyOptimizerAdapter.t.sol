// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {StrategyOptimizerAdapter} from "../src/StrategyOptimizerAdapter.sol";

/**
 * @title StrategyOptimizerAdapterTest
 * @notice Tests for StrategyOptimizerAdapter; cross-validate with Rust pvm/strategy_optimizer.rs
 * @dev These test vectors must match the Rust unit tests so that Solidity fallback and
 *      future PVM Rust precompile produce identical results.
 */
contract StrategyOptimizerAdapterTest is Test {
    StrategyOptimizerAdapter public adapter;

    function setUp() public {
        adapter = new StrategyOptimizerAdapter(address(0));
    }

    /// @dev Matches Rust test: example_scores_and_index
    ///      APY = [800,1200,1500], Risk = [2,4,7] -> Scores 600, 800, 800 -> first best index 1
    function test_MatchesRustExampleScoresAndIndex() public view {
        uint256[] memory apys = new uint256[](3);
        apys[0] = 800;
        apys[1] = 1200;
        apys[2] = 1500;
        uint256[] memory risks = new uint256[](3);
        risks[0] = 2;
        risks[1] = 4;
        risks[2] = 7;

        uint256 bestIndex = adapter.getBestStrategyIndex(apys, risks);
        assertEq(bestIndex, 1, "Must match Rust: first highest score is at index 1");
    }

    /// @dev Matches Rust test: tie_returns_first
    function test_MatchesRustTieReturnsFirst() public view {
        uint256[] memory apys = new uint256[](2);
        apys[0] = 1000;
        apys[1] = 1000;
        uint256[] memory risks = new uint256[](2);
        risks[0] = 1;
        risks[1] = 1;

        uint256 bestIndex = adapter.getBestStrategyIndex(apys, risks);
        assertEq(bestIndex, 0, "Must match Rust: tie returns first index");
    }

    function test_EmptyApysReverts() public {
        uint256[] memory apys = new uint256[](0);
        uint256[] memory risks = new uint256[](0);
        vm.expectRevert("StrategyOptimizerAdapter: empty inputs");
        adapter.getBestStrategyIndex(apys, risks);
    }

    function test_LengthMismatchReverts() public {
        uint256[] memory apys = new uint256[](2);
        apys[0] = 800;
        apys[1] = 1200;
        uint256[] memory risks = new uint256[](1);
        risks[0] = 2;
        vm.expectRevert("StrategyOptimizerAdapter: length mismatch");
        adapter.getBestStrategyIndex(apys, risks);
    }

    function test_SingleStrategyReturnsZero() public view {
        uint256[] memory apys = new uint256[](1);
        apys[0] = 500;
        uint256[] memory risks = new uint256[](1);
        risks[0] = 1;
        assertEq(adapter.getBestStrategyIndex(apys, risks), 0);
    }

    function test_HighestScoreLastIndex() public view {
        uint256[] memory apys = new uint256[](3);
        apys[0] = 100;
        apys[1] = 200;
        apys[2] = 1500;
        uint256[] memory risks = new uint256[](3);
        risks[0] = 1;
        risks[1] = 1;
        risks[2] = 7;
        // Scores: 0, 100, 800 -> best at index 2
        assertEq(adapter.getBestStrategyIndex(apys, risks), 2);
    }
}
