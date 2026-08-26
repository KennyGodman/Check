# { "Depends": "py-genlayer:latest" }
"""
CheckSignals — GenLayer Intelligent Contract

Manages smart-money trading signals on-chain.
Anti-Gaming Guarantees:
1. Fixed Outcome Window: Signals are strictly bound to a prediction window and settlement deadline.
   Early resolution is blocked; arbitrarily late resolution defaults to terminal failure.
2. Canonical Price Source: Each signal explicitly binds an immutable canonical price endpoint.
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
    # Submit a high-probability signal bound to a fixed outcome window
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
        price_source: str = ""
    ) -> u256:
        window = prediction_window
        if window < self.min_prediction_window:
            window = self.min_prediction_window

        start_time = gl.block.timestamp * 1000
        deadline = start_time + window + self.default_grace_period
        
        canonical_source = price_source
        if len(canonical_source) == 0:
            canonical_source = f"https://api.dexscreener.com/latest/dex/tokens/{token_address}"

        sig = Signal(
            submitter=gl.message.sender_address,
            symbol=symbol,
            token_address=token_address,
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
    # Resolve signal using canonical price source & multi-validator consensus
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

        # Within valid outcome evaluation window: query canonical price source
        token_address = sig.token_address
        entry_price_str = sig.entry_price
        target_price_str = sig.target_price
        canonical_source = sig.price_source

        def fetch_and_evaluate() -> str:
            page_text = gl.nondet.web.render(canonical_source, mode="text")

            prompt = f"""
You are resolving a cryptocurrency signal prediction recorded on the GenLayer blockchain.
Verify if the token met its price target using the designated canonical price source.

CANONICAL DATA SOURCE:
- Source Endpoint: {canonical_source}
- Token Address: {token_address}
- Entry Benchmark Price: {entry_price_str}
- Target Benchmark Price: {target_price_str}

API SCAN DATA (Fetched live from Canonical DexScreener):
---
{page_text}
---

INSTRUCTIONS:
1. Locate the canonical price in the API response (look for the "priceUsd" field for the primary pair).
2. Compare the canonical price with the target price ({target_price_str}).
3. If the canonical price is equal to or greater than the target price, "meets_target" is true. Otherwise false.
4. Respond ONLY with a JSON object in this format (no markdown blocks, no commentary):
{{
  "current_price": <float value>,
  "meets_target": true or false,
  "reason": "a brief description (e.g. price reached $0.125 exceeding target $0.114)"
}}
"""
            response = gl.nondet.exec_prompt(prompt)
            cleaned = response.strip().strip("`").strip()
            if cleaned.lower().startswith("json"):
                cleaned = cleaned[4:].strip()
            parsed = json.loads(cleaned)
            return json.dumps({
                "current_price": float(parsed.get("current_price", 0.0)),
                "meets_target": bool(parsed.get("meets_target", False)),
                "reason": str(parsed.get("reason", ""))[:500]
            })

        result_json = gl.eq_principle.prompt_comparative(
            fetch_and_evaluate,
            principle="""
The results must align on the meets_target verdict and the canonical price float parsed from the API text. Minor word differences in the reason field are permitted.
"""
        )

        parsed = json.loads(result_json)
        meets = parsed["meets_target"]
        reason = parsed["reason"]
        curr_price_str = str(parsed.get("current_price", 0.0))

        sig.verdict_reason = reason
        sig.resolved_at = onchain_timestamp
        sig.resolved_price = curr_price_str

        if meets:
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
