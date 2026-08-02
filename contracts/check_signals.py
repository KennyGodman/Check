# { "Depends": "py-genlayer:test" }
"""
CheckSignals — GenLayer Intelligent Contract

Manages smart-money trading signals on-chain. When a high-probability trading
alert is found by scanners, a trader submits the prediction to this contract.
Once the timeline expires, validators call resolve_signal() which fetches live 
price data from the DexScreener API and performs comparative LLM consensus to
judge if the token hit its move target. Submitters earn reputation on-chain.
"""

from genlayer import *
import json


class SignalStatus:
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"


class Signal(gl.dataclass):
    submitter: Address
    symbol: str
    token_address: str
    entry_price: float
    target_price: float
    mcap: float
    wallet_overlap: u256
    status: str
    verdict_reason: str
    timestamp: u256


class CheckSignals(gl.Contract):
    signals: DynArray[Signal]
    next_id: u256
    reputation: Map[Address, u256]

    def __init__(self):
        self.next_id = u256(0)

    # ------------------------------------------------------------------
    # Submit a high-probability signal to the GenLayer blockchain
    # ------------------------------------------------------------------
    @gl.public.write
    def submit_signal(
        self,
        symbol: str,
        token_address: str,
        entry_price: float,
        target_price: float,
        mcap: float,
        wallet_overlap: u256,
        timestamp: u256
    ) -> u256:
        sig = Signal(
            submitter=gl.message.sender_address,
            symbol=symbol,
            token_address=token_address,
            entry_price=entry_price,
            target_price=target_price,
            mcap=mcap,
            wallet_overlap=wallet_overlap,
            status=SignalStatus.PENDING,
            verdict_reason="",
            timestamp=timestamp
        )
        self.signals.append(sig)
        sig_id = self.next_id
        self.next_id = u256(self.next_id + 1)
        
        # Initialize reputation mapping if empty
        if self.reputation[gl.message.sender_address] is None:
            self.reputation[gl.message.sender_address] = u256(100) # base start reputation
            
        return sig_id

    # ------------------------------------------------------------------
    # Resolve the signal using live API data and multi-validator consensus
    # ------------------------------------------------------------------
    @gl.public.write
    def resolve_signal(self, signal_id: u256) -> str:
        sig = self.signals[signal_id]
        assert sig.status == SignalStatus.PENDING, "Signal has already been resolved"

        token_address = sig.token_address
        entry_price = sig.entry_price
        target_price = sig.target_price

        def fetch_and_evaluate() -> str:
            url = f"https://api.dexscreener.com/latest/dex/tokens/{token_address}"
            page_text = gl.nondet.web.render(url, mode="text")

            prompt = f"""
You are resolving a cryptocurrency signal prediction recorded on a GenLayer blockchain.
Verify if the token met its price target.

TOKEN METRICS:
- Address: {token_address}
- Entry Price: {entry_price}
- Target Price (Gain benchmark): {target_price}

API SCAN DATA (Fetched live from DexScreener):
---
{page_text}
---

INSTRUCTIONS:
1. Locate the current price in the API response (look for the "priceUsd" string, which is the current price).
2. Compare the current price with the target price.
3. If current price is equal to or greater than the target price, "meets_target" is true. Otherwise it is false.
4. Respond ONLY with a JSON object in this format (no other conversational text, no markdown block wrappers):
{{
  "current_price": <float value>,
  "meets_target": true or false,
  "reason": "a brief description (e.g. price reached $0.125 exceeding target $0.114)"
}}
"""
            response = gl.nondet.exec_prompt(prompt)
            # Safe JSON extraction
            cleaned = response.strip().strip("`").strip()
            if cleaned.lower().startswith("json"):
                cleaned = cleaned[4:].strip()
            parsed = json.loads(cleaned)
            return json.dumps({
                "current_price": float(parsed.get("current_price", 0.0)),
                "meets_target": bool(parsed.get("meets_target", False)),
                "reason": str(parsed.get("reason", ""))[:500]
            })

        # Run validators consensus using Equivalence Principle
        result_json = gl.eq_principle.prompt_comparative(
            fetch_and_evaluate,
            principle="""
The results must align on the meets_target verdict and the current price float parsed from the API text. Word differences in the reason field are fine as long as the truth evaluation is the same.
"""
        )

        parsed = json.loads(result_json)
        meets = parsed["meets_target"]
        reason = parsed["reason"]

        sig.verdict_reason = reason
        
        # Get reputation values
        current_rep = self.reputation[sig.submitter]
        if current_rep is None:
            current_rep = u256(100)

        if meets:
            sig.status = SignalStatus.SUCCESS
            self.reputation[sig.submitter] = u256(current_rep + 15) # reward reputation
        else:
            sig.status = SignalStatus.FAILED
            # Deduct points if prediction failed (to penalize false calls)
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
        rep = self.reputation[user]
        if rep is None:
            return u256(100)
        return rep
