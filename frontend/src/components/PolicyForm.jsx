
import { useState } from "react";
import { parseEther } from "ethers";

export default function PolicyForm({ contracts, onMessage }) {
    const [period, setPeriod] = useState("20261018");
    const [threshold, setThreshold] = useState("20");
    const [loading, setLoading] = useState(false);

    async function subscribeToPolicy(event) {
        event.preventDefault();

        if (!contracts) {
            onMessage("Connect MetaMask first.", "error");
            return;
        }

        if (
            !/^\d+$/.test(period) ||
            !/^\d+$/.test(threshold) ||
            BigInt(period) <= 0n ||
            BigInt(threshold) <= 0n
        ) {
            onMessage(
                "Period and rainfall threshold must be positive integers.",
                "error"
            );
            return;
        }

        try {
            setLoading(true);
            onMessage("Waiting for MetaMask confirmation...", "info");

            const nextId = await contracts.policyManager.nextPolicyId();

            const tx = await contracts.policyManager.subscribe(
                period,
                threshold,
                { value: parseEther("0.01") }
            );

            onMessage("Transaction submitted. Waiting for confirmation...", "info");

            await tx.wait();

            onMessage(
                `Policy created successfully! Policy ID: ${nextId.toString()}`,
                "success"
            );
        } catch (error) {
            onMessage(
                error.shortMessage ||
                error.reason ||
                error.message ||
                "Subscription failed.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="feature-section">
            <h3>Subscribe to Insurance</h3>
            <p>Premium: 0.01 ETH</p>

            <form onSubmit={subscribeToPolicy}>
                <label>
                    Insurance period:
                    <input
                        type="number"
                        min="1"
                        value={period}
                        onChange={(event) => setPeriod(event.target.value)}
                        required
                    />
                </label>

                <label>
                    Rainfall threshold:
                    <input
                        type="number"
                        min="1"
                        value={threshold}
                        onChange={(event) => setThreshold(event.target.value)}
                        required
                    />
                </label>

                <button type="submit" disabled={!contracts || loading}>
                    {loading ? "Processing..." : "Subscribe"}
                </button>
            </form>
        </div>
    );
}
