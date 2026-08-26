# { "Depends": "py-genlayer:latest" }
"""
CheckSignals — GenLayer Intelligent Contract

Manages smart-money trading signals on-chain.
Anti-Gaming Guarantees:
1. Fixed Outcome Window: Signals are strictly bound to a prediction window and settlement deadline.
   Early resolution is blocked; arbitrarily late resolution defaults to terminal failure.
2. Canonical Price Source Binding: Each signal explicitly binds an immutable canonical price endpoint,
   enforcing strict validation across Host, Token, Chain, and Pair.
3. Forced Terminal Results: Expired or unverified signals are force-resolved to FAILED,
   ensuring losing signals cannot sit in pending to evade reputation penalties.
"""

from genlayer import *
from dataclasses import dataclass
import json


class SignalStatus:
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"


@allow_storage
@dataclass
class Signal:
    submitter: Address
    symbol: str
    token_address: str
    chain_id: str
    pair_address: str
    price_source: str
    entry_price: str
    target_price: str
    mcap: str
    wallet_overlap: u256
    status: str
    verdict_reason: str
    timestamp: u256
    prediction_window: u256
    settlement_deadline: u256
    resolved_at: u256
    resolved_price: str


class CheckSignals(gl.Contract):
    signals: DynArray[Signal]
    next_id: u256
    reputation: TreeMap[Address, u256]
    min_prediction_window: u256
    default_grace_period: u256

    def __init__(self):
        self.signals = DynArray()
        self.next_id = u256(0)
        self.reputation = TreeMap()
        self.min_prediction_window = u256(60000)  # Enforced min window 60s (60,000ms)
        self.default_grace_period = u256(300000)  # 5 min grace window for settlement (300,000ms)

    # ------------------------------------------------------------------
    # Submit a high-probability signal bound to canonical oracle & fixed outcome window
    # ------------------------------------------------------------------
    @gl.public.write
    def submit_signal(
        self,
        symbol: str,
        token_address: str,
        entry_price: str,
        target_price: str,
        mcap: str,
        wallet_overlap: u256,
        timestamp: u256 = u256(0),
        prediction_window: u256 = u256(300000),  # Default 5 min window (300,000ms)
        chain_id: str = "solana",
        pair_address: str = "",
        price_source: str = ""
    ) -> u256:
        assert len(token_address.strip()) > 0, "Token address cannot be empty"
        assert len(symbol.strip()) > 0, "Symbol cannot be empty"
        
        target_chain = chain_id.strip().lower() if len(chain_id.strip()) > 0 else "solana"
        target_pair = pair_address.strip()

        # Strict Canonical URL Construction & Host Validation
        # Prohibit arbitrary caller URLs: URL must strictly bind to api.dexscreener.com and the specific token/pair
        if len(price_source.strip()) > 0:
            provided_src = price_source.strip()
            assert provided_src.startswith("https://api.dexscreener.com/"), "Invalid price source host: Must use canonical https://api.dexscreener.com/"
            assert (token_address.lower() in provided_src.lower()) or (len(target_pair) > 0 and target_pair.lower() in provided_src.lower()), "Invalid price source path: Must bind to designated token address or pair address"
            canonical_source = provided_src
        else:
            if len(target_pair) > 0:
                canonical_source = f"https://api.dexscreener.com/latest/dex/pairs/{target_chain}/{target_pair}"
            else:
                canonical_source = f"https://api.dexscreener.com/latest/dex/tokens/{token_address.strip()}"

        window = prediction_window
        if window < self.min_prediction_window:
            window = self.min_prediction_window

        start_time = gl.block.timestamp * 1000
        deadline = start_time + window + self.default_grace_period

        sig = Signal(
            submitter=gl.message.sender_address,
            symbol=symbol.strip().upper(),
            token_address=token_address.strip(),
            chain_id=target_chain,
            pair_address=target_pair,
            price_source=canonical_source,
            entry_price=str(entry_price),
            target_price=str(target_price),
            mcap=str(mcap),
            wallet_overlap=wallet_overlap,
            status=SignalStatus.PENDING,
            verdict_reason="",
            timestamp=start_time,
            prediction_window=window,
            settlement_deadline=deadline,
            resolved_at=u256(0),
            resolved_price="0.0"
        )
        self.signals.append(sig)
        sig_id = self.next_id
        self.next_id = u256(self.next_id + 1)
        
        if gl.message.sender_address not in self.reputation:
            self.reputation[gl.message.sender_address] = u256(100)
            
        return sig_id

    # ------------------------------------------------------------------
    # Resolve signal with strict 4-point canonical validation (Host, Token, Chain, Pair)
    # ------------------------------------------------------------------
    @gl.public.write
    def resolve_signal(self, signal_id: u256, current_timestamp: u256 = u256(0)) -> str:
        sig = self.signals[signal_id]
        assert sig.status == SignalStatus.PENDING, "Signal has already reached a terminal state"

        onchain_timestamp = gl.block.timestamp * 1000
        assert onchain_timestamp >= sig.timestamp + sig.prediction_window, "Prediction window has not elapsed. Early resolution is blocked to prevent reputation farming."

        current_rep = self.reputation[sig.submitter] if sig.submitter in self.reputation else u256(100)

        # Anti-Gaming Rule: If settlement deadline has passed, signal is expired and forced to terminal failure
        if onchain_timestamp > sig.settlement_deadline:
            sig.status = SignalStatus.FAILED
            sig.resolved_at = onchain_timestamp
            sig.resolved_price = "0.0"
            sig.verdict_reason = "Settlement deadline exceeded. Signal expired without timely target verification - forced terminal failure."
            
            if current_rep > 10:
                self.reputation[sig.submitter] = u256(current_rep - 10)
            else:
                self.reputation[sig.submitter] = u256(0)
                
            return sig.status

        # Validate Host before performing non-deterministic fetch
        assert sig.price_source.startswith("https://api.dexscreener.com/"), "Invalid price source host: Must be canonical DexScreener API"

        # Within valid outcome evaluation window: query canonical price source
        token_address = sig.token_address
        symbol = sig.symbol
        chain_id = sig.chain_id
        pair_address = sig.pair_address
        entry_price_str = sig.entry_price
        target_price_str = sig.target_price
        canonical_source = sig.price_source

        def fetch_and_evaluate() -> str:
            page_text = gl.nondet.web.render(canonical_source, mode="text")

            prompt = f"""
You are an impartial on-chain consensus validator resolving a cryptocurrency trading signal on the GenLayer blockchain.
You must strictly validate the market data against the signal's 4 CANONICAL BINDING PARAMETERS: HOST, TOKEN, CHAIN, and PAIR.

CANONICAL BINDING PARAMETERS:
- Source Endpoint: {canonical_source}
- Expected Host: api.dexscreener.com
- Expected Symbol: {symbol}
- Expected Token Address: {token_address}
- Expected Chain ID: {chain_id}
- Expected Pair Address: {pair_address if len(pair_address) > 0 else 'PRIMARY_LIQUIDITY_PAIR'}
- Entry Benchmark Price: ${entry_price_str}
- Target Benchmark Price: ${target_price_str}

API SCAN DATA (Fetched live from Canonical DexScreener):
---
{page_text}
---

STRICT 4-STEP VALIDATION INSTRUCTIONS:
1. HOST VALIDATION:
   - Confirm that the response is valid DexScreener market data containing a 'pairs' array.

2. TOKEN VALIDATION:
   - Inspect the 'pairs' array.
   - Verify that there exists at least one pair where 'baseToken.address' (case-insensitive) matches '{token_address}' and/or 'baseToken.symbol' matches '{symbol}'.
   - If no pair matches the expected token address, token validation FAILS.

3. CHAIN VALIDATION:
   - Verify that the matching pair's 'chainId' matches '{chain_id}' (e.g. solana, ethereum, base, bsc, etc.).
   - If the pair is on a different chain, chain validation FAILS.

4. PAIR VALIDATION & CANONICAL PRICE EXTRACTION:
   - If an expected pair address '{pair_address}' is specified, match that exact pair. Otherwise, identify the primary pair on '{chain_id}' with the highest liquidity.
   - Extract the canonical 'priceUsd' (as a floating-point number) from this verified pair.
   - Compare the canonical price with the target price (${target_price_str}).
   - If and only if all 4 checks (Host, Token, Chain, Pair) PASS and canonical_price >= {target_price_str}, then 'meets_target' is true. Otherwise false.

Respond ONLY with a JSON object in this format (no markdown code blocks, no other text):
{{
  "host_valid": true,
  "token_matched": true,
  "chain_matched": true,
  "pair_matched": true,
  "canonical_price": <float priceUsd or 0.0>,
  "meets_target": true or false,
  "reason": "A concise summary describing host, token, chain, pair validation status, canonical price found, and target comparison"
}}
"""
            response = gl.nondet.exec_prompt(prompt)
            cleaned = response.strip().strip("`").strip()
            if cleaned.lower().startswith("json"):
                cleaned = cleaned[4:].strip()
            parsed = json.loads(cleaned)
            return json.dumps({
                "host_valid": bool(parsed.get("host_valid", False)),
                "token_matched": bool(parsed.get("token_matched", False)),
                "chain_matched": bool(parsed.get("chain_matched", False)),
                "pair_matched": bool(parsed.get("pair_matched", False)),
                "canonical_price": float(parsed.get("canonical_price", 0.0)),
                "meets_target": bool(parsed.get("meets_target", False)),
                "reason": str(parsed.get("reason", ""))[:500]
            })

        result_json = gl.eq_principle.prompt_comparative(
            fetch_and_evaluate,
            principle="""
The validator nodes must reach consensus on:
1. host_valid (boolean)
2. token_matched (boolean)
3. chain_matched (boolean)
4. pair_matched (boolean)
5. canonical_price (float within 0.1% tolerance)
6. meets_target (boolean)
Minor wording differences in the reason summary are permitted.
"""
        )

        parsed = json.loads(result_json)
        host_valid = bool(parsed.get("host_valid", False))
        token_matched = bool(parsed.get("token_matched", False))
        chain_matched = bool(parsed.get("chain_matched", False))
        pair_matched = bool(parsed.get("pair_matched", False))
        meets = bool(parsed.get("meets_target", False))
        reason = str(parsed.get("reason", ""))
        curr_price_str = str(parsed.get("canonical_price", 0.0))

        all_valid = host_valid and token_matched and chain_matched and pair_matched

        sig.verdict_reason = reason
        sig.resolved_at = onchain_timestamp
        sig.resolved_price = curr_price_str

        if all_valid and meets:
            sig.status = SignalStatus.SUCCESS
            self.reputation[sig.submitter] = u256(current_rep + 15)
        else:
            sig.status = SignalStatus.FAILED
            if current_rep > 10:
                self.reputation[sig.submitter] = u256(current_rep - 10)
            else:
                self.reputation[sig.submitter] = u256(0)

        return sig.status

    # ------------------------------------------------------------------
    # Force resolve expired signals (Permissionless Crank / Sweeper)
    # ------------------------------------------------------------------
    @gl.public.write
    def force_resolve_expired(self, signal_id: u256) -> str:
        sig = self.signals[signal_id]
        assert sig.status == SignalStatus.PENDING, "Signal has already reached a terminal state"

        onchain_timestamp = gl.block.timestamp * 1000
        assert onchain_timestamp > sig.settlement_deadline, "Signal has not exceeded its settlement deadline yet"

        current_rep = self.reputation[sig.submitter] if sig.submitter in self.reputation else u256(100)

        sig.status = SignalStatus.FAILED
        sig.resolved_at = onchain_timestamp
        sig.resolved_price = "0.0"
        sig.verdict_reason = "Forced terminal failure: Abandoned/unresolved signal expired past settlement deadline."

        if current_rep > 10:
            self.reputation[sig.submitter] = u256(current_rep - 10)
        else:
            self.reputation[sig.submitter] = u256(0)

        return sig.status

    # ------------------------------------------------------------------
    # Read Methods
    # ------------------------------------------------------------------
    @gl.public.view
    def get_signal(self, signal_id: u256) -> Signal:
        return self.signals[signal_id]

    @gl.public.view
    def get_signal_count(self) -> u256:
        return u256(len(self.signals))

    @gl.public.view
    def get_reputation(self, user: Address) -> u256:
        if user in self.reputation:
            return self.reputation[user]
        return u256(100)
