/// Strategy optimizer (PolkaVM experimentation).
///
/// This module provides a small, deterministic scoring function that mirrors the
/// Solidity-side strategy selection logic used in the demo:
///
/// score = apy - (risk_score * 100)
///
/// Where:
/// - `apy` is in basis points (e.g. 800 = 8.00%)
/// - `risk_score` is an integer 1..10 (demo convention)
///
/// The function returns the index of the strategy with the highest score.
/// If there is a tie, it returns the first strategy with that highest score
/// (stable winner).
///
/// This function is intended to be called from Solidity via the StrategyOptimizerAdapter:
/// the Rust code is compiled to PolkaVM bytecode and deployed as a PVM smart contract
/// on Polkadot Hub; the adapter calls that contract with APY and risk arrays and gets the best index.
///
/// --- ABI contract with Solidity (StrategyOptimizerAdapter.sol) ---
/// - Inputs: two slices (apys, risks) equivalent to Solidity's abi.encode(apys, risks)
///   when decoded on the PVM side; values are expected to fit in u32.
/// - Output: u32 best index; Solidity expects a single uint256.
/// - Formula and tie-break must match: score = apy - (risk * 100); first highest wins.

/// Compute the score for a single strategy: `apy - (risk * 100)`.
///
/// Used by `select_best_strategy_index`. Exposed so the crate offers more than
/// a single entry point and can be used as a small library (e.g. by tests or
/// a precompile implementation).
#[inline]
pub fn compute_score(apy: u32, risk: u32) -> i64 {
    apy as i64 - (risk as i64).saturating_mul(100)
}

/// Select the best strategy index based on APY and risk scores.
///
/// # Inputs
/// - `apys`: APY values in basis points (e.g. 1200 = 12.00%).
/// - `risks`: Risk scores (e.g. 2, 4, 7).
///
/// # Returns
/// - `u32`: Index of the strategy with the highest score.
///
/// # Behavior
/// - If the arrays are empty or have mismatched lengths, the function returns 0.
///   Callers are expected to validate inputs on the Solidity side before invoking
///   this helper in a PolkaVM context.
pub fn select_best_strategy_index(apys: &[u32], risks: &[u32]) -> u32 {
    if apys.is_empty() || apys.len() != risks.len() {
        // Safe fallback for invalid input; in a PolkaVM setting the Solidity caller
        // should guarantee non-empty, matching-length arrays.
        return 0;
    }

    let mut best_index: usize = 0;
    let mut best_score: i64 = compute_score(apys[0], risks[0]);

    for i in 1..apys.len() {
        let score = compute_score(apys[i], risks[i]);
        if score > best_score {
            best_score = score;
            best_index = i;
        }
    }

    best_index as u32
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn example_scores_and_index() {
        // Example:
        // APY = [800,1200,1500]
        // Risk = [2,4,7]
        // Scores = [600,800,800] -> returns index 1 (first best).
        let apy = [800u32, 1200u32, 1500u32];
        let risk = [2u32, 4u32, 7u32];
        assert_eq!(select_best_strategy_index(&apy, &risk), 1u32);
    }

    #[test]
    fn tie_returns_first() {
        let apy = [1000u32, 1000u32];
        let risk = [1u32, 1u32];
        assert_eq!(select_best_strategy_index(&apy, &risk), 0u32);
    }

    #[test]
    fn single_strategy_returns_zero() {
        let apy = [500u32];
        let risk = [1u32];
        assert_eq!(select_best_strategy_index(&apy, &risk), 0u32);
    }

    #[test]
    fn highest_score_last_index() {
        let apy = [100u32, 200u32, 1500u32];
        let risk = [1u32, 1u32, 7u32];
        // Scores: 0, 100, 800 -> best at index 2
        assert_eq!(select_best_strategy_index(&apy, &risk), 2u32);
    }

    #[test]
    fn empty_arrays_return_zero() {
        let apy: [u32; 0] = [];
        let risk: [u32; 0] = [];
        assert_eq!(select_best_strategy_index(&apy, &risk), 0u32);
    }

    #[test]
    fn length_mismatch_returns_zero() {
        let apy = [800u32, 1200u32];
        let risk = [2u32];
        assert_eq!(select_best_strategy_index(&apy, &risk), 0u32);
    }

    #[test]
    fn compute_score_matches_formula() {
        assert_eq!(compute_score(800, 2), 600);
        assert_eq!(compute_score(1200, 4), 800);
        assert_eq!(compute_score(1500, 7), 800);
    }
}

