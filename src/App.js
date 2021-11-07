import { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const TEST_GIFS = [
  "https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp",
  "https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g",
  "https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g",
  "https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp",
];

const ConnectWalletButton = ({ onClick }) => (
  <button className="cta-button connect-wallet-button" onClick={onClick}>
    Connect to Wallet
  </button>
);

const ContentContainer = ({ items, value, onChange, onSubmit }) => (
  <div className="connected-container">
    <input
      type="text"
      placeholder="Enter gif link!"
      value={value}
      onChange={onChange}
    />
    <button className="cta-button submit-gif-button" onClick={onSubmit}>
      Submit
    </button>
    <div className="gif-grid">
      {items.map((gif) => (
        <div className="gif-item" key={gif}>
          <img src={gif} alt={gif} />
        </div>
      ))}
    </div>
  </div>
);

const App = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [gifList, setGifList] = useState([]);

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

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log("Gif link:", inputValue);
      setGifList([...gifList, inputValue]);
    } else {
      console.log("Empty input try again");
    }
  };

  useEffect(() => {
    window.addEventListener("load", async (event) => {
      await checkWalletConnection();
    });
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching GIF list ...");

      setGifList(TEST_GIFS);
    }
  }, [walletAddress]);

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
          {walletAddress && (
            <ContentContainer
              items={gifList}
              value={inputValue}
              onChange={onInputChange}
              onSubmit={sendGif}
            />
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
