const { ethers, upgrades } = require('hardhat');
const { expect } = require("chai");

let owner, beneficiary, addr1, addr2;

let erc20Contract;
let vestingContract;
let presaleContract;

beforeEach(async function () {
	[owner, beneficiary, addr1, addr2] = await ethers.getSigners();
	
	const ERC20 =  await ethers.getContractFactory('MisBlockBase');
	erc20Contract = await ERC20.deploy();

	
	const VestingContract = await ethers.getContractFactory('VestingContract');
	vestingContract = await VestingContract.deploy(beneficiary.address, erc20Contract.address, ethers.utils.parseEther("100000000000"));
	await erc20Contract.transfer(vestingContract.address, ethers.utils.parseEther('100000000000'));


	const PresaleContract = await ethers.getContractFactory('PresaleContract');
	presaleContract = await PresaleContract.deploy(erc20Contract.address, ethers.utils.parseEther("100000000000"));
	await erc20Contract.transfer(presaleContract.address, ethers.utils.parseEther('100000000000'));
})

describe('Unit Test', function() {
	describe('Vesting Contract Test', function () {
		it('Vesting Test', async function() {
			// 18 february 2022 - 1 month unlock
			const vesting1 = new Date(2022, 1, 18); 
			expect(await vestingContract.vesting(vesting1.getTime() / 1000, 10))
				.to.emit(vestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('10000000000'));
	
			// 18 March 2022 - 2 month unlock
			const vesting2 = new Date(2022, 2, 18); 
			expect(await vestingContract.vesting(vesting2.getTime() / 1000, 10))
				.to.emit(vestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('20000000000'));
	
			// 18 April 2022 - 3 month unlock
			const vesting3 = new Date(2022, 3, 18); 
			expect(await vestingContract.vesting(vesting3.getTime() / 1000, 10))
				.to.emit(vestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('30000000000'));
	
			// 18 May 2022 - 4 month unlock
			const vesting4 = new Date(2022, 4, 18); 
			expect(await vestingContract.vesting(vesting4.getTime() / 1000, 10))
				.to.emit(vestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('40000000000'));
				
			// ....
		});

		it('Widthdraw Test', async function() {
			// test vesting
			const vesting_test = new Date(2021, 8, 1); 
			expect(await vestingContract.vesting(vesting_test.getTime() / 1000, 10))
				.to.emit(vestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('10000000000'));

			expect(await vestingContract.claimableAmount())
				.to.equal(ethers.utils.parseEther('10000000000'));

			expect(await vestingContract.withdraw())
				.to.emit(vestingContract, 'TokenWithdraw')
				.withArgs(ethers.utils.parseEther('10000000000'));
		});
	})
})