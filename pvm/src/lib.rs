//! PolkaVM optimizer library (see README).
//!
//! This crate is compiled to PolkaVM bytecode and deployed as a PVM smart
//! contract on Polkadot Hub; StrategyOptimizerAdapter (Solidity) calls it.

// Standalone module at `pvm/strategy_optimizer.rs`; re-exported here.
#[path = "../strategy_optimizer.rs"]
pub mod strategy_optimizer;

