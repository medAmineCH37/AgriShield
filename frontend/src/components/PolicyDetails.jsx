
import { useState } from "react";
import { formatEther } from "ethers";

export default function PolicyDetails({ contracts, onMessage }) {
    const [policyId, setPolicyId] = useState("2");
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(false);
    const [claimMessage, setClaimMessage] = useState("");

    async function loadPolicy(event) {
        event.preventDefault();

        if (!contracts) {
            onMessage("Connect MetaMask first.", "error");
            return;
        }

        if (!/^\d+$/.test(policyId) || BigInt(policyId) <= 0n) {
            onMessage("Enter a valid positive policy ID.");
            return;
        }

        try {
            setLoading(true);
            setPolicy(null);

            const result = await contracts.policyManager.getPolicy(policyId);

            setPolicy({
                farmer: result.farmer,
                premium: formatEther(result.premium),
                threshold: result.rainfallThreshold.toString(),
                payoutAmount: formatEther(result.payoutAmount),
                period: result.period.toString(),
                active: result.active,
                paidOut: result.paidOut,
            });

            onMessage("Policy loaded successfully.", "success");
        } catch (error) {
            onMessage(
                error.shortMessage ||
                error.reason ||
                error.message ||
                "Could not load policy.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    }


    async function claimIndemnity() {
        if (!contracts || !policy) {
            onMessage("Load a policy first.");
            return;
        }

        if (!policy.active || policy.paidOut) {
            onMessage("This policy is inactive or has already been paid.");
            return;
        }

        try {
            setLoading(true);
            onMessage("Waiting for MetaMask confirmation...", "info");

            const tx = await contracts.policyManager.claimIndemnity(policyId);

            onMessage("Claim submitted. Waiting for confirmation...", "info");

            await tx.wait();

            setClaimMessage("✅ Indemnity claimed successfully!");

            onMessage("Indemnity claimed successfully!", "success");

            // Reload the policy to show its updated status.
            const result = await contracts.policyManager.getPolicy(policyId);

            setPolicy({
                farmer: result.farmer,
                premium: formatEther(result.premium),
                threshold: result.rainfallThreshold.toString(),
                payoutAmount: formatEther(result.payoutAmount),
                period: result.period.toString(),
                active: result.active,
                paidOut: result.paidOut,
            });
        } catch (error) {
            setClaimMessage(
                error.shortMessage || error.reason || error.message || "Claim failed."
            );
            onMessage(
                error.shortMessage ||
                error.reason ||
                error.message ||
                "Claim failed."
            );
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="feature-section">
            <h3>View Insurance Policy</h3>

            <form onSubmit={loadPolicy}>
                <label>
                    Policy ID:
                    <input
                        type="number"
                        min="1"
                        value={policyId}
                        onChange={(event) => setPolicyId(event.target.value)}
                        required
                    />
                </label>

                <button type="submit" disabled={!contracts || loading}>
                    {loading ? "Loading..." : "View Policy"}
                </button>
            </form>

            {policy && (
                <div>
                    <p><strong>Farmer:</strong> {policy.farmer}</p>
                    <p><strong>Premium:</strong> {policy.premium} ETH</p>
                    <p><strong>Period:</strong> {policy.period}</p>
                    <p><strong>Rainfall threshold:</strong> {policy.threshold}</p>
                    <p><strong>Payout amount:</strong> {policy.payoutAmount} ETH</p>
                    <p><strong>Active:</strong> {policy.active ? "Yes" : "No"}</p>
                    <p><strong>Paid out:</strong> {policy.paidOut ? "Yes" : "No"}</p>
                    <button
                        onClick={claimIndemnity}
                        disabled={loading || !policy.active || policy.paidOut}
                    >
                        {loading ? "Processing..." : "Claim Indemnity"}
                    </button>
                    {claimMessage && <p>{claimMessage}</p>}
                </div>
            )}
        </div>
    );
}
