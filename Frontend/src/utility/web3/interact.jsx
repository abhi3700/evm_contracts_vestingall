import React from "react";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.REACT_APP_BASE_URL || "";
console.log("base url is", BASE_URL);
export const connectWallet = async () => {
  console.log("window ehtereum-----", window.ethereum);
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: "👆🏽 Write a message in the text-field above.",
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
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
        </span>
      ),
    };
  }
};
export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "👆🏽 Please fill out all the fields above.",
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
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
        </span>
      ),
    };
  }
};

export const bridgeTransfer = async (
  address,
  receiverAddr,
  transferNum,
  transferTo
) => {
  if (receiverAddr.trim() === "") {
    return {
      success: false,
      status: "❗Please make sure if address field is filled before transfer.",
    };
  }
  if (transferNum.trim() === "") {
    return {
      success: false,
      status: "❗Please make sure if amount field is filled before transfer.",
    };
  }
  let numAmount = parseInt(transferNum);
  if (isNaN(numAmount)) {
    return {
      success: false,
      status: "❗Please make sure if nubmer is correct.",
    };
  }
  console.log(address);
  console.log(receiverAddr);
  console.log(transferNum);
  console.log(transferTo);
  try {
    const apiBody = { from: address, to: receiverAddr, amount: transferNum };
    let res;
    if (transferTo === "ethToBsc") {
      res = await axios.post(BASE_URL + "/api/v1/bridge/ethtobsc", apiBody);
    } else if (transferTo === "bscToEth") {
      res = await axios.post(BASE_URL + "/api/v1/bridge/bsctoeth", apiBody);
    }
    console.log(res.data);
  } catch (e) {
    console.log(e);
    return {
      success: false,
      status: "❗Error on transfer",
    };
  }
  return {
    success: true,
    status: "✅  Finished transfer",
  };
};
