
import { useState } from "react";
import { parseEther } from "ethers";

export default function AdminPanel({ contracts, onMessage }) {
  const [period, setPeriod] = useState("20261019");
  const [rainfall, setRainfall] = useState("10");
  const [depositAmount, setDepositAmount] = useState("0.1");
  const [loading, setLoading] = useState(false);

  async function publishRainfall(event) {
    event.preventDefault();

    if (!contracts) {
      onMessage("Connect MetaMask first.", "error");
      return;
    }

    if (
      !/^\d+$/.test(period) ||
      !/^\d+$/.test(rainfall) ||
      BigInt(period) <= 0n
    ) {
      onMessage("Enter a valid positive period and a non-negative rainfall value.");
      return;
    }

    try {
      setLoading(true);
      onMessage("Waiting for MetaMask confirmation...", "info");

      const tx = await contracts.oracle.updateRainfall(period, rainfall);

      onMessage("Rainfall transaction submitted...", "info");
      await tx.wait();

      onMessage("Rainfall data published successfully.", "success");
    } catch (error) {
      onMessage(
        error.shortMessage ||
          error.reason ||
          error.message ||
          "Could not publish rainfall data.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  async function fundPool(event) {
    event.preventDefault();

    if (!contracts) {
      onMessage("Connect MetaMask first.");
      return;
    }

    try {
      setLoading(true);
      onMessage("Waiting for MetaMask confirmation...");

      const tx = await contracts.payoutPool.deposit({
        value: parseEther(depositAmount),
      });

      onMessage("Deposit transaction submitted...", "info");
      await tx.wait();

      onMessage("Payout pool funded successfully.", "success");
    } catch (error) {
      onMessage(
        error.shortMessage ||
          error.reason ||
          error.message ||
          "Could not fund payout pool."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="feature-section">
      <h2>Administrator Panel</h2>

      <h3>Publish Rainfall Data</h3>
      <form onSubmit={publishRainfall}>
        <label>
          Period:
          <input
            type="number"
            min="1"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            required
          />
        </label>

        <label>
          Rainfall:
          <input
            type="number"
            min="0"
            value={rainfall}
            onChange={(event) => setRainfall(event.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={!contracts || loading}>
          {loading ? "Processing..." : "Publish Rainfall"}
        </button>
      </form>

      <h3>Fund Payout Pool</h3>
      <form onSubmit={fundPool}>
        <label>
          Amount (ETH):
          <input
            type="number"
            min="0.000000000000000001"
            step="any"
            value={depositAmount}
            onChange={(event) => setDepositAmount(event.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={!contracts || loading}>
          {loading ? "Processing..." : "Deposit ETH"}
        </button>
      </form>
    </div>
  );
}
