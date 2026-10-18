
import { useState } from "react";
import ConnectWallet from "./components/ConnectWallet";
import { getContractInstances } from "./contracts/contractInstances";
import PolicyForm from "./components/PolicyForm";
import PolicyDetails from "./components/PolicyDetails";
import AdminPanel from "./components/AdminPanel";
import "./App.css";

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [contracts, setContracts] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [poolBalance, setPoolBalance] = useState(null);
  const [rainfallPeriod, setRainfallPeriod] = useState("20261019");
  const [rainfallValue, setRainfallValue] = useState(null);

  function notify(text, type = "info") {
    setMessage(text);
    setMessageType(type);
  }

  async function handleWalletConnected(connection) {
    try {
      const network = await connection.provider.getNetwork();

      if (network.chainId !== 1337n) {
        notify(
          `Wrong network. Expected Chain ID 1337, received ${network.chainId.toString()}.`,
          "error"
        );
        return;
      }

      const instances = getContractInstances(connection.signer);

      setWallet(connection);
      setContracts(instances);
      notify("Wallet connected to the AgriShield blockchain.", "success");
    } catch (error) {
      notify(error.shortMessage || error.message, "error");
    }
  }

  async function readPoolBalance() {
    if (!contracts) return;

    try {
      const balance = await contracts.payoutPool.getBalance();
      setPoolBalance((Number(balance) / 1e18).toFixed(4));
      notify("Payout pool balance loaded successfully.", "success");
    } catch (error) {
      notify(error.shortMessage || error.message, "error");
    }
  }

  async function readRainfall() {
    if (!contracts) return;

    try {
      const available = await contracts.oracle.dataAvailable(rainfallPeriod);

      if (!available) {
        setRainfallValue(null);
        notify("No rainfall data available for this period.", "error");
        return;
      }

      const rainfall = await contracts.oracle.getRainfall(rainfallPeriod);

      setRainfallValue(rainfall.toString());
      notify("Rainfall data loaded successfully.", "success");
    } catch (error) {
      notify(error.shortMessage || error.message, "error");
    }
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>AgriShield</h1>
        <p>Blockchain-based parametric drought insurance</p>
        <ConnectWallet onConnected={handleWalletConnected} />
      </header>

      <section className="dashboard">
        <div className="dashboard-heading">
          <div>
            <h2>Dashboard</h2>
            <p>Manage drought insurance on the blockchain.</p>
          </div>
          <span className={`connection-badge ${wallet ? "connected" : ""}`}>
            {wallet ? "Wallet connected" : "Wallet disconnected"}
          </span>
        </div>

        {wallet ? (
          <div className="wallet-card">
            <div>
              <span className="summary-label">Wallet address</span>
              <strong className="wallet-address">{wallet.address}</strong>
            </div>
            <div>
              <span className="summary-label">Network</span>
              <strong>Ganache Local · Chain ID 1337</strong>
            </div>
            <div>
              <span className="summary-label">Smart contracts</span>
              <strong>{contracts ? "Connected" : "Not connected"}</strong>
            </div>
          </div>
        ) : (
          <div className="wallet-card">
            Connect MetaMask to access AgriShield features.
          </div>
        )}

        {message && (
          <div
            className={`message message-${messageType}`}
            role={messageType === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            <strong>
              {messageType === "success"
                ? "Success: "
                : messageType === "error"
                  ? "Error: "
                  : "Info: "}
            </strong>
            {message}
          </div>
        )}

        <section className="feature-section">
          <div className="section-heading">
            <div>
              <h3>Payout Pool</h3>
              <p>Available funds for indemnity payments.</p>
            </div>
          </div>

          <button onClick={readPoolBalance} disabled={!contracts}>
            Check Payout Pool Balance
          </button>

          {poolBalance !== null && (
            <div className="balance-display">
              <span className="summary-label">Current balance</span>
              <strong>{poolBalance} ETH</strong>
            </div>
          )}
        </section>

        <div className="feature-section">
          <h3>Rainfall Data</h3>
          <p>Read the rainfall value recorded for an insurance period.</p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              readRainfall();
            }}
          >
            <label>
              Period:
              <input
                type="number"
                min="1"
                value={rainfallPeriod}
                onChange={(event) => setRainfallPeriod(event.target.value)}
                required
              />
            </label>

            <button type="submit" disabled={!contracts}>
              Check Rainfall
            </button>
          </form>

          {rainfallValue !== null && (
            <div className="result-row">
              <span>Recorded rainfall</span>
              <strong>{rainfallValue}</strong>
            </div>
          )}
        </div>

        <PolicyForm
          contracts={contracts}
          onMessage={notify}
        />

        <PolicyDetails
          contracts={contracts}
          onMessage={notify}
        />

        <AdminPanel
          contracts={contracts}
          onMessage={notify}
        />
      </section>
    </main>
  );
}
