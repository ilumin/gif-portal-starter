import { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const ConnectWalletButton = ({ onClick }) => (
  <button className="cta-button connect-wallet-button" onClick={onClick}>
    Connect to Wallet
  </button>
);

const App = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const containerClassName = walletAddress ? "authed-container" : "container";

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);
      console.log(`Connected to wallet: ${address}`);
    }
  };

  const checkWalletConnection = async () => {
    try {
      const { solana } = window;

      if (!solana) {
        throw new Error(`Solana object not found`);
      }

      console.log("Connecting ...");

      const response = await solana.connect({ onlyIfTrusted: true });
      console.log("Connected with public key:", response.publicKey.toString());

      setWalletAddress(response.publicKey.toString());
    } catch (err) {
      console.warn("Cannot connect to Solana wallet");
      console.error(err);
    }
  };

  useEffect(() => {
    window.addEventListener("load", async (event) => {
      await checkWalletConnection();
    });
  }, []);

  return (
    <div className="App">
      <div className={containerClassName}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress && (
            <ConnectWalletButton onClick={() => connectWallet()} />
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
