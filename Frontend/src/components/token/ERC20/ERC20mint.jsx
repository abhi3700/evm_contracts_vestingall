import React, { useEffect, useState } from "react";
import {
  connectWallet,
  getCurrentWalletConnected,
  bridgeTransfer,
} from "../../../utility/web3/interact.jsx";

const ERC20Mint = () => {
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");

  const [transAmount, setTransAmount] = useState("");
  const [receiverAddr, setReceiver] = useState("");
  const [transTo, setDirective] = useState("ethToBsc");
  useEffect(() => {
    async function fetchData() {
      const { address, status } = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status);

      addWalletListener();
    }
    fetchData();
  }, []);

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://metamask.io/download.html`}
          >
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onTransHandle = async () => {
    const { status } = await bridgeTransfer(
      walletAddress,
      receiverAddr,
      transAmount,
      transTo
    );
    setStatus(status);
  };

  return (
    <div className="container">
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>
      <div className="bridgetransfer_wrap">
        <div className="bridgetransfer">
          <br /> <h1 id="title"> UNICOIN Cross-chain Interaction </h1>{" "}
          <p>
            {" "}
            Please press "Transfer" after filling out the following fields{" "}
          </p>{" "}
          <form>
            <input
              type="text"
              placeholder="Enter Receiver's address like 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
              onChange={(event) => setReceiver(event.target.value)}
            />{" "}
            <input
              type="text"
              placeholder="Enter transfer amount like 1000"
              onChange={(event) => setTransAmount(event.target.value)}
            />{" "}
            <select
              value={transTo}
              onChange={(event) => setDirective(event.target.value)}
            >
              <option value="ethToBsc">ETH to BSC</option>
              <option value="bscToEth">BSC to ETH</option>
            </select>
          </form>{" "}
          <button id="transBtn" className="mt-4" onClick={onTransHandle}>
            Transfer{" "}
          </button>
          <p
            id="status"
            style={{
              color: "red",
              position: "relative",
              top: "0%",
              marginTop: "30px",
            }}
          >
            {" "}
            {status}{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ERC20Mint;
