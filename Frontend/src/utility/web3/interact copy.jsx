import React from "react";
import { BigNumber } from "bignumber.js";
const contractABI = require("./contract-abi.json");
const uniContractAddr = "0x78635608942585be5E6F9521ebdc2587c12925Ca";
const uniBinanceContractAddr = "0x89643704ff263AaE520f95c2Bb5e97ae2eAE436a";
const Web3Instance = require("web3");

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

export const mintUNICN = async (address, mintAddr, mintNum) => {
  if (mintAddr.trim() === "") {
    return {
      success: false,
      status: "❗Please make sure if address field is filled before transfer.",
    };
  }
  if (mintNum.trim() === "") {
    return {
      success: false,
      status: "❗Please make sure if amount field is filled before transfer.",
    };
  }
  const web3 = new Web3Instance(window.web3.currentProvider);
  const uniContract = new web3.eth.Contract(
    contractABI.abi,
    uniContractAddr
  );
  let mintWei;
  let numAmount = parseFloat(mintNum);
  if (!isNaN(numAmount)){
    // mintAmount = unitsInTokenAmount(numAmount, ETH_DECIMALS);
    mintWei = web3.utils.toWei(mintNum, "ether");
  }
  else {
    return {
      success: false,
      status: "❗Please make sure if nubmer is correct.",
    };
  }
  console.log(address);
  console.log(mintAddr);
  // console.log(mintAmount);
  console.log(mintWei);
  try {
    await uniContract.methods.mint(mintAddr, mintWei).send({
      from: address,
    });
  } catch (e) {
    console.log(e);
    return {
      success: false,
      status: "❗Error on buyLands",
    };
  }
  return {
		success: true,
		status:
			"✅  Finished mint"
	};
};
export const mintBSCUNICN = async (address, mintAddr, mintNum) => {
  if (mintAddr.trim() === "") {
    return {
      success: false,
      status: "❗Please make sure if address field is filled before transfer.",
    };
  }
  if (mintNum.trim() === "") {
    return {
      success: false,
      status: "❗Please make sure if amount field is filled before transfer.",
    };
  }
  const web3 = new Web3Instance(window.web3.currentProvider);
  const uniBSCContract = new web3.eth.Contract(
    contractABI.abi,
    uniBinanceContractAddr
  );
  let mintWei;
  let numAmount = parseFloat(mintNum);
  if (!isNaN(numAmount)){
    mintWei = web3.utils.toWei(mintNum, "ether");
  }
  else {
    return {
      success: false,
      status: "❗Please make sure if nubmer is correct.",
    };
  }
  console.log(address);
  console.log(mintAddr);
  // console.log(mintAmount);
  console.log(mintWei);
  try {
    await uniBSCContract.methods.mint(mintAddr, mintWei).send({
      from: address,
    });
  } catch (e) {
    console.log(e);
    return {
      success: false,
      status: "❗Error on mint",
    };
  }
  return {
		success: true,
		status:
			"✅  Finished mint"
	};
};
export const burnBSCUNICN = async (address, mintAddr, mintNum) => {
  if (mintAddr.trim() === "") {
    return {
      success: false,
      status: "❗Please make sure if address field is filled before transfer.",
    };
  }
  if (mintNum.trim() === "") {
    return {
      success: false,
      status: "❗Please make sure if amount field is filled before transfer.",
    };
  }
  const web3 = new Web3Instance(window.web3.currentProvider);
  const uniBSCContract = new web3.eth.Contract(
    contractABI.abi,
    uniBinanceContractAddr
  );
  let mintWei;
  let numAmount = parseFloat(mintNum);
  if (!isNaN(numAmount)){
    mintWei = web3.utils.toWei(mintNum, "ether");
  }
  else {
    return {
      success: false,
      status: "❗Please make sure if nubmer is correct.",
    };
  }
  console.log(address);
  console.log(mintAddr);
  // console.log(mintAmount);
  console.log(mintWei);
  try {
    await uniBSCContract.methods.burn(mintAddr, mintWei).send({
      from: address,
    });
  } catch (e) {
    console.log(e);
    return {
      success: false,
      status: "❗Error on burn",
    };
  }
  return {
		success: true,
		status:
			"✅  Finished burn"
	};
}
export const tokenAmountInUnitsToBigNumber = (amount, decimals) => {
  const decimalsPerToken = new BigNumber(10).pow(decimals);
  return amount.div(decimalsPerToken);
};
export const tokenAmountInUnits = (amount, decimals, toFixedDecimals = 3) => {
  return tokenAmountInUnitsToBigNumber(amount, decimals).toFixed(
    toFixedDecimals
  );
};

export const unitsInTokenAmount = (units, decimals) => {
  const decimalsPerToken = new BigNumber(10).pow(decimals);

  return new BigNumber(units).multipliedBy(decimalsPerToken);
};
