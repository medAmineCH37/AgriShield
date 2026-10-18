import { useState } from "react";
import { BrowserProvider } from "ethers";

export default function ConnectWallet({ onConnected }) {
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");

  async function connectWallet() {
    setError("");

    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install or enable it.");
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);
      onConnected({ provider, signer, address });
    } catch (err) {
      setError(err.shortMessage || err.message || "Wallet connection failed.");
    }
  }

  return (
    <div>
      <button onClick={connectWallet}>
        {account
          ? `${account.slice(0, 6)}...${account.slice(-4)}`
          : "Connect MetaMask"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
