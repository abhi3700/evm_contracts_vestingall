const { ethers, upgrades } = require('hardhat');
const { expect } = require("chai");

let timelockReceiver;
let erc20Contract;
let vestingContract;
let presaleContract;

beforeEach(async function () {
	timelockReceiver = "0x359f3C1DB466252510d699F4778D501920AEA1E7";
	const ERC20 =  await ethers.getContractFactory('MisBlockBase');
	const VestingContract = await ethers.getContractFactory('VestingContract');
	const PresaleContract = await ethers.getContractFactory('PresaleContract');

	erc20Contract = await ERC20.deploy();
	vestingContract = await VestingContract.deploy(timelockReceiver, erc20Contract.address);
	presaleContract = await PresaleContract.deploy(erc20Contract.address);

	await erc20Contract.transfer(vestingContract.address, ethers.utils.parseEther('100000000000'));
	await erc20Contract.transfer(presaleContract.address, ethers.utils.parseEther('100000000000'));
})

describe("Test", function () {
	it("Vesting Contract Test", async function () {
		await expect(vestingContract.claim())
			.to.emit(vestingContract, 'TokensClaim')
			.withArgs(ethers.utils.parseEther('10000000000'));

		await expect(vestingContract.withdraw())
			.to.emit(vestingContract, 'TokensWithdraw')
			.withArgs(ethers.utils.parseEther('10000000000'));

		const balance = await erc20Contract.balanceOf(timelockReceiver);
		expect(balance).to.equal(ethers.utils.parseEther('10000000000'));
	});

	it("Presale Contract Test", async function () {
		await expect(presaleContract.unlock())
			.to.emit(presaleContract, 'TokensUnlock')
			.withArgs(ethers.utils.parseEther('10000000000'));

		await expect(presaleContract.presale(timelockReceiver, ethers.utils.parseEther('10000000000')))
			.to.emit(presaleContract, 'TokensPresale')
			.withArgs(ethers.utils.parseEther('10000000000'));

		const balance = await erc20Contract.balanceOf(timelockReceiver);
		expect(balance).to.equal(ethers.utils.parseEther('10000000000'));
	});
});
