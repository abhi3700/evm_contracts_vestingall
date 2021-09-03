const { ethers, upgrades } = require('hardhat');
const { expect } = require("chai");
const TEST = artifacts.require("ERC20");

let timelockReceiver;
let erc20Contract;
let vestingContract;

beforeEach(async function () {
	timelockReceiver = "0x359f3C1DB466252510d699F4778D501920AEA1E7";
	const ERC20 = await ethers.getContractFactory('MisBlockBase');
	const VestingContract = await ethers.getContractFactory('VestingContract');
	erc20Contract = await ERC20.deploy();
	vestingContract = await VestingContract.deploy(timelockReceiver, erc20Contract.address);

	await erc20Contract.transfer(vestingContract.address, ethers.utils.parseEther('100000000000'));

})

describe("Vesting", function () {
	it("Vesting Contract Test", async function () {
		await vestingContract.claim();
		const totalClaimableAmount = await vestingContract.totalClaimableAmount();
		expect(totalClaimableAmount).to.equal(ethers.utils.parseEther('10000000000'));

		await vestingContract.withdraw();
		const totalWithdrawAmount = await vestingContract.totalWithdrawAmount();
		expect(totalWithdrawAmount).to.equal(ethers.utils.parseEther('10000000000'));

		const balance = await erc20Contract.balanceOf(timelockReceiver);
		expect(balance).to.equal(ethers.utils.parseEther('10000000000'));
	});
});
