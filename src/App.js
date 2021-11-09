import { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Provider, Program, web3 } from "@project-serum/anchor";
import idl from "./idl.json";
import kp from "./keypair.json";

import "./App.css";

const { SystemProgram, Keypair } = web3;
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = Keypair.fromSecretKey(secret);
const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl("devnet");
const opts = {
  preflightCommitment: "processed",
};

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const TEST_GIFS = [
  "https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp",
  "https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif",
  "https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif",
  "https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp",
];

const ConnectWalletButton = ({ onClick }) => (
  <button className="cta-button connect-wallet-button" onClick={onClick}>
    Connect to Wallet
  </button>
);

const ContentContainer = ({
  items,
  value,
  createGifAccount,
  onChange,
  onSubmit,
}) => (
  <div className="connected-container">
    {!items && (
      <button
        className="cta-button submit-gif-button"
        onClick={createGifAccount}
      >
        Do one-time initialization for GIF program account
      </button>
    )}
    {items && (
      <>
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
            <div className="gif-item" key={gif.gifLink}>
              <img src={gif.gifLink} alt={gif.gifLink} />
              <div className="owner">{gif.userAddress.toString()}</div>
              <button className="cta-button up-vote">👍 up vote</button>
              <button className="cta-button send-tip">🧧 send tips</button>
            </div>
          ))}
        </div>
      </>
    )}
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

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment
    );

    return provider;
  };

  const sendGif = async () => {
    if (inputValue.length <= 0) {
      console.log("Empty input try again");
      return;
    }

    if (inputValue.length > 0) {
      console.log("Gif link:", inputValue);

      try {
        const provider = getProvider();
        const program = new Program(idl, programID, provider);

        await program.rpc.addGif(inputValue, {
          accounts: {
            baseAccount: baseAccount.publicKey,
          },
        });
        console.log("GIF successfully sent!");

        setInputValue("");

        await getGifList();
      } catch (error) {
        console.error("Error sending GIF:", error);
      }
    }
  };

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log("Got the account:", account);
      setGifList(account.gifList);
    } catch (error) {
      console.log("Error on get GIF:", error);
      setGifList(null);
    }
  };

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping...");

      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        "created a new base account w/ address:",
        baseAccount.publicKey.toString()
      );

      await getGifList();
    } catch (error) {
      console.log("error during create account:", error);
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

      getGifList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              createGifAccount={createGifAccount}
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
