// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {XCMRouter} from "../src/XCMRouter.sol";

/**
 * @title XCMRouterTest
 * @notice Verifies XCMRouter behavior matches README: simulation (precompile=0) vs production (call precompile).
 */
contract XCMRouterTest is Test {
    XCMRouter public router;

    function setUp() public {
        router = new XCMRouter(address(0));
    }

    /// @dev With precompile=0 (simulation): sendXCM only emits, no external call.
    function test_SimulationMode_OnlyEmits() public {
        address strategy = address(0x123);
        vm.expectEmit(true, true, true, true);
        emit XCMRouter.XCMTransfer(1284, 592, strategy, 100e18);
        router.sendXCM(1284, 592, strategy, 100e18);
    }

    /// @dev With precompile set: sendXCM calls it then emits. Mock precompile returns success.
    function test_ProductionMode_CallsPrecompileThenEmits() public {
        MockPrecompile mock = new MockPrecompile();
        XCMRouter prodRouter = new XCMRouter(address(mock));
        address strategy = address(0x456);
        vm.expectEmit(true, true, true, true);
        emit XCMRouter.XCMTransfer(2004, 2006, strategy, 50e18);
        prodRouter.sendXCM(2004, 2006, strategy, 50e18);
        assertTrue(mock.called(), "Precompile should have been called");
    }

    /// @dev When precompile call fails, sendXCM reverts.
    function test_ProductionMode_PrecompileReverts_SendReverts() public {
        RevertingPrecompile reverting = new RevertingPrecompile();
        XCMRouter prodRouter = new XCMRouter(address(reverting));
        vm.expectRevert("XCMRouter: precompile call failed");
        prodRouter.sendXCM(1284, 592, address(0x1), 1);
    }

    function test_InvalidStrategyReverts() public {
        vm.expectRevert("XCMRouter: invalid strategy");
        router.sendXCM(1284, 592, address(0), 100);
    }

    function test_ZeroAmountReverts() public {
        vm.expectRevert("XCMRouter: amount must be greater than 0");
        router.sendXCM(1284, 592, address(0x1), 0);
    }
}

contract MockPrecompile {
    bool public called;

    receive() external payable {
        called = true;
    }

    fallback() external payable {
        called = true;
    }
}

contract RevertingPrecompile {
    fallback() external payable {
        revert("precompile error");
    }
}
