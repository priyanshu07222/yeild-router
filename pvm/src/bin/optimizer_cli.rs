use pvm::strategy_optimizer::select_best_strategy_index;

fn main() {
    // This CLI is a minimal “host simulation” for the future PolkaVM precompile.
    //
    // It demonstrates the exact ABI contract used by Solidity:
    // - input:  hex calldata for `abi.encode(uint256[] apys, uint256[] risks)`
    // - output: hex-encoded 32-byte big-endian `uint256 bestIndex`
    //
    // Usage:
    //   cargo run -p pvm --bin optimizer_cli -- <hex_calldata>
    //
    // Example (APY=[800,1200,1500], risk=[2,4,7]):
    //   cargo run -p pvm --bin optimizer_cli -- 0x<...>
    //
    // In a real PolkaVM deployment, the runtime/precompile at `PVM_OPTIMIZER` would:
    // - decode the same calldata
    // - call the same Rust function
    // - return the same 32-byte output to Solidity via `staticcall`

    let mut args = std::env::args().skip(1);
    let hex = match args.next() {
        Some(v) => v,
        None => {
            eprintln!("missing hex calldata arg");
            std::process::exit(2);
        }
    };

    let calldata = match hex_to_bytes(&hex) {
        Ok(b) => b,
        Err(e) => {
            eprintln!("invalid hex calldata: {e}");
            std::process::exit(2);
        }
    };

    let (apys_u32, risks_u32) = match decode_two_u256_arrays(&calldata) {
        Ok(v) => v,
        Err(e) => {
            eprintln!("abi decode failed: {e}");
            std::process::exit(2);
        }
    };

    let best = select_best_strategy_index(&apys_u32, &risks_u32);

    // ABI return value: uint256 (32 bytes big-endian).
    let mut out = [0u8; 32];
    out[28..32].copy_from_slice(&best.to_be_bytes());
    println!("0x{}", bytes_to_hex(&out));
}

fn hex_to_bytes(s: &str) -> Result<Vec<u8>, String> {
    let s = s.strip_prefix("0x").unwrap_or(s);
    // Be tolerant to odd-length hex (common copy/paste issue) by left-padding a '0'.
    let owned;
    let s = if s.len() % 2 != 0 {
        owned = format!("0{s}");
        owned.as_str()
    } else {
        s
    };
    let mut out = Vec::with_capacity(s.len() / 2);
    let bytes = s.as_bytes();
    for i in (0..bytes.len()).step_by(2) {
        let hi = from_hex_nibble(bytes[i])?;
        let lo = from_hex_nibble(bytes[i + 1])?;
        out.push((hi << 4) | lo);
    }
    Ok(out)
}

fn from_hex_nibble(b: u8) -> Result<u8, String> {
    match b {
        b'0'..=b'9' => Ok(b - b'0'),
        b'a'..=b'f' => Ok(b - b'a' + 10),
        b'A'..=b'F' => Ok(b - b'A' + 10),
        _ => Err("non-hex character".to_string()),
    }
}

fn bytes_to_hex(bytes: &[u8]) -> String {
    const HEX: &[u8; 16] = b"0123456789abcdef";
    let mut s = String::with_capacity(bytes.len() * 2);
    for &b in bytes {
        s.push(HEX[(b >> 4) as usize] as char);
        s.push(HEX[(b & 0x0f) as usize] as char);
    }
    s
}

// Decode calldata for `abi.encode(uint256[] apys, uint256[] risks)`.
//
// ABI encoding (head/tail):
//   0x00: offset_to_apys (32 bytes)
//   0x20: offset_to_risks (32 bytes)
//   ... tails ...
//
// Each dynamic array tail:
//   at offset: length (32 bytes), then length elements of 32 bytes each.
fn decode_two_u256_arrays(calldata: &[u8]) -> Result<(Vec<u32>, Vec<u32>), String> {
    if calldata.len() < 64 {
        return Err("calldata too short".to_string());
    }
    let off1 = read_u256_as_usize(calldata, 0)?;
    let off2 = read_u256_as_usize(calldata, 32)?;

    let a = read_u256_array_u32(calldata, off1)?;
    let b = read_u256_array_u32(calldata, off2)?;
    Ok((a, b))
}

fn read_u256_as_usize(buf: &[u8], offset: usize) -> Result<usize, String> {
    let word = read_word(buf, offset)?;
    // We only need small offsets (within the calldata length); parse last 8 bytes.
    let mut last8 = [0u8; 8];
    last8.copy_from_slice(&word[24..32]);
    let v = u64::from_be_bytes(last8) as usize;
    Ok(v)
}

fn read_u256_array_u32(buf: &[u8], offset: usize) -> Result<Vec<u32>, String> {
    let len_word = read_word(buf, offset)?;
    let mut last8 = [0u8; 8];
    last8.copy_from_slice(&len_word[24..32]);
    let len = u64::from_be_bytes(last8) as usize;

    let mut out: Vec<u32> = Vec::with_capacity(len);
    let mut cur = offset + 32;
    for _ in 0..len {
        let w = read_word(buf, cur)?;
        // Enforce the ABI contract: values must fit into u32.
        // We accept only the last 4 bytes (big-endian) and require the top 28 bytes are zero.
        if w[0..28].iter().any(|&b| b != 0) {
            return Err("u256 element does not fit u32".to_string());
        }
        let mut last4 = [0u8; 4];
        last4.copy_from_slice(&w[28..32]);
        out.push(u32::from_be_bytes(last4));
        cur += 32;
    }
    Ok(out)
}

fn read_word(buf: &[u8], offset: usize) -> Result<[u8; 32], String> {
    if offset + 32 > buf.len() {
        return Err("out of bounds".to_string());
    }
    let mut w = [0u8; 32];
    w.copy_from_slice(&buf[offset..offset + 32]);
    Ok(w)
}

