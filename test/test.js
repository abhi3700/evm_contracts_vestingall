const { ethers, upgrades } = require('hardhat');
const { expect } = require("chai");

let owner, beneficiary, addr1, addr2;

let erc20Contract;
let vestingContract;
let teamVestingContract;
let presaleContract;

beforeEach(async function () {
	[owner, beneficiary, addr1, addr2] = await ethers.getSigners();
	
	const ERC20 =  await ethers.getContractFactory('MisBlockBase');
	erc20Contract = await ERC20.deploy();

	
	const VestingContract = await ethers.getContractFactory('VestingContract');
	vestingContract = await VestingContract.deploy(beneficiary.address, erc20Contract.address, ethers.utils.parseEther("100000000000"));
	await erc20Contract.transfer(vestingContract.address, ethers.utils.parseEther('100000000000'));

	const TeamVestingContract = await ethers.getContractFactory('TeamVestingContract');
	teamVestingContract = await TeamVestingContract.deploy(erc20Contract.address, ethers.utils.parseEther("100000000000"));
	await erc20Contract.transfer(teamVestingContract.address, ethers.utils.parseEther('100000000000'));

	const PresaleContract = await ethers.getContractFactory('PresaleContract');
	presaleContract = await PresaleContract.deploy(erc20Contract.address, ethers.utils.parseEther("100000000000"));
	await erc20Contract.transfer(presaleContract.address, ethers.utils.parseEther('100000000000'));
})

describe('Unit Test', function() {
	describe('Vesting Contract Test', function () {
		it('Ownable Test', async function() {
			await expect(vestingContract.connect(addr1).vesting(new Date(2022, 1, 18).getTime() / 1000, 10))
				.to.be.revertedWith('Ownable: caller is not the owner');
			await expect(vestingContract.connect(addr1).claimableAmount())
				.to.be.revertedWith('Ownable: caller is not the owner');
			await expect(vestingContract.connect(addr1).withdraw())
				.to.be.revertedWith('Ownable: caller is not the owner');
			await expect(vestingContract.connect(addr1).pause())
				.to.be.revertedWith('Ownable: caller is not the owner');
		})

		it('Pausable Test', async function() {
			await vestingContract.pause();
			await expect(vestingContract.vesting(new Date(2022, 1, 18).getTime() / 1000, 10))
				.to.be.revertedWith('Pausable: paused');
			await expect(vestingContract.claimableAmount())
				.to.be.revertedWith('Pausable: paused');
			await expect(vestingContract.withdraw())
				.to.be.revertedWith('Pausable: paused');
			await expect(vestingContract.pause())
				.to.be.revertedWith('Pausable: paused');
		})
		
		it('Claimable Amount Test', async function() {
			expect(await vestingContract.vesting(new Date(2021, 1, 18).getTime() / 1000, 10))
				.to.emit(vestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('10000000000'));
			expect(await vestingContract.vesting(new Date(2022, 2, 18).getTime() / 1000, 10))
				.to.emit(vestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('20000000000'));

			expect(await vestingContract.claimableAmount())
				.to.equal(ethers.utils.parseEther('10000000000'));
		})

		it('Vesting Test', async function() {
			expect(await vestingContract.vesting(new Date(2022, 1, 18).getTime() / 1000, 10))
				.to.emit(vestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('10000000000'));
			expect(await vestingContract.vesting(new Date(2022, 2, 18).getTime() / 1000, 10))
				.to.emit(vestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('20000000000'));
			expect(await vestingContract.vesting(new Date(2022, 3, 18).getTime() / 1000, 10))
				.to.emit(vestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('30000000000'));
			await expect(vestingContract.vesting(new Date(2022, 4, 18).getTime() / 1000, 80))
				.to.be.revertedWith('Can not vest more than total amount');
		});

		it('Widthdraw Test', async function() {
			expect(await vestingContract.vesting(new Date(2021, 8, 1).getTime() / 1000, 10))
				.to.emit(vestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('10000000000'));
			expect(await vestingContract.claimableAmount())
				.to.equal(ethers.utils.parseEther('10000000000'));
			expect(await vestingContract.withdraw())
				.to.emit(vestingContract, 'TokenWithdraw')
				.withArgs(ethers.utils.parseEther('10000000000'));
			expect(await erc20Contract.balanceOf(beneficiary.address))
				.to.equal(ethers.utils.parseEther('10000000000'));
			await expect(vestingContract.withdraw())
				.to.be.revertedWith('Claimable amount is zero');
		});
	})

	describe('Team Vesting Contract Test', function () {
		it('Ownable Test', async function() {
			await expect(teamVestingContract.connect(addr1).vesting(new Date(2022, 1, 18).getTime() / 1000, addr1.address, 10))
				.to.be.revertedWith('Ownable: caller is not the owner');
			await expect(teamVestingContract.connect(addr1).claimableAmount())
				.to.be.revertedWith('Ownable: caller is not the owner');
			await expect(teamVestingContract.connect(addr1).withdraw())
				.to.be.revertedWith('Ownable: caller is not the owner');
			await expect(teamVestingContract.connect(addr1).pause())
				.to.be.revertedWith('Ownable: caller is not the owner');
		})

		it('Pausable Test', async function() {
			await teamVestingContract.pause();
			await expect(teamVestingContract.vesting(new Date(2022, 1, 18).getTime() / 1000, addr1.address, 10))
				.to.be.revertedWith('Pausable: paused');
			await expect(teamVestingContract.claimableAmount())
				.to.be.revertedWith('Pausable: paused');
			await expect(teamVestingContract.withdraw())
				.to.be.revertedWith('Pausable: paused');
			await expect(teamVestingContract.pause())
				.to.be.revertedWith('Pausable: paused');
		})
		
		it('Claimable Amount & Revoke Test', async function() {
			expect(await teamVestingContract.vesting(new Date(2021, 1, 18).getTime() / 1000, addr1.address, 10))
				.to.emit(teamVestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('10000000000'));
			expect(await teamVestingContract.vesting(new Date(2022, 2, 18).getTime() / 1000, addr2.address, 10))
				.to.emit(teamVestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('20000000000'));
			expect(await teamVestingContract.claimableAmount())
				.to.equal(ethers.utils.parseEther('10000000000'));
			expect(await teamVestingContract.revoke(addr2.address))
				.to.emit(teamVestingContract, 'Revoke')
				.withArgs(addr2.address);
			expect(await teamVestingContract.claimableAmount())
				.to.equal(ethers.utils.parseEther('20000000000'));
		})

		it('Vesting Test', async function() {
			expect(await teamVestingContract.vesting(new Date(2022, 1, 18).getTime() / 1000, addr1.address, 10))
				.to.emit(teamVestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('10000000000'));
			expect(await teamVestingContract.vesting(new Date(2022, 2, 18).getTime() / 1000, addr1.address, 10))
				.to.emit(teamVestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('20000000000'));
			expect(await teamVestingContract.vesting(new Date(2022, 3, 18).getTime() / 1000, addr2.address, 10))
				.to.emit(teamVestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('30000000000'));
			await expect(teamVestingContract.vesting(new Date(2022, 4, 18).getTime() / 1000, addr2.address, 80))
				.to.be.revertedWith('Can not vest more than total amount');
		});

		it('Widthdraw Test', async function() {
			expect(await teamVestingContract.vesting(new Date(2022, 1, 18).getTime() / 1000, addr1.address, 10))
				.to.emit(teamVestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('10000000000'));
			await expect(teamVestingContract.withdraw())
				.to.be.revertedWith('Claimable amount is zero');
			expect(await teamVestingContract.revoke(addr1.address))
				.to.emit(teamVestingContract, 'Revoke')
				.withArgs(addr1.address);
			expect(await teamVestingContract.withdraw())
				.to.emit(teamVestingContract, 'TokenWithdraw')
				.withArgs(ethers.utils.parseEther('10000000000'));
		});
	})

	describe('Presale Contract Test', function () {
		it('Ownable Test', async function() {
			await expect(presaleContract.connect(addr1).presale(new Date(2022, 1, 18).getTime() / 1000, addr1.address, 10))
				.to.be.revertedWith('Ownable: caller is not the owner');
			await expect(presaleContract.connect(addr1).availableAmount())
				.to.be.revertedWith('Ownable: caller is not the owner');
			await expect(presaleContract.connect(addr1).withdraw())
				.to.be.revertedWith('Ownable: caller is not the owner');
			await expect(presaleContract.connect(addr1).pause())
				.to.be.revertedWith('Ownable: caller is not the owner');
		})

		it('Pausable Test', async function() {
			await presaleContract.pause();
			await expect(presaleContract.presale(new Date(2022, 1, 18).getTime() / 1000, addr1.address, 10))
				.to.be.revertedWith('Pausable: paused');
			await expect(presaleContract.availableAmount())
				.to.be.revertedWith('Pausable: paused');
			await expect(presaleContract.withdraw())
				.to.be.revertedWith('Pausable: paused');
			await expect(presaleContract.pause())
				.to.be.revertedWith('Pausable: paused');
		})
		
		it('Avaialbe Amount & Revoke Test', async function() {
			expect(await presaleContract.presale(new Date(2021, 1, 18).getTime() / 1000, addr1.address, 10))
				.to.emit(presaleContract, 'TokenPresale')
				.withArgs(ethers.utils.parseEther('10000000000'));
			expect(await presaleContract.presale(new Date(2022, 2, 18).getTime() / 1000, addr2.address, 10))
				.to.emit(presaleContract, 'TokenPresale')
				.withArgs(ethers.utils.parseEther('20000000000'));
			expect(await presaleContract.availableAmount())
				.to.equal(ethers.utils.parseEther('10000000000'));
			expect(await presaleContract.revoke(addr2.address))
				.to.emit(presaleContract, 'Revoke')
				.withArgs(addr2.address);
			expect(await presaleContract.availableAmount())
				.to.equal(ethers.utils.parseEther('20000000000'));
		})

		it('Presale Test', async function() {
			expect(await presaleContract.presale(new Date(2022, 1, 18).getTime() / 1000, addr1.address, 10))
				.to.emit(presaleContract, 'TokenPresale')
				.withArgs(ethers.utils.parseEther('10000000000'));
			expect(await presaleContract.presale(new Date(2022, 2, 18).getTime() / 1000, addr1.address, 10))
				.to.emit(presaleContract, 'TokenPresale')
				.withArgs(ethers.utils.parseEther('20000000000'));
			expect(await presaleContract.presale(new Date(2022, 3, 18).getTime() / 1000, addr2.address, 10))
				.to.emit(presaleContract, 'TokenPresale')
				.withArgs(ethers.utils.parseEther('30000000000'));
			await expect(presaleContract.presale(new Date(2022, 4, 18).getTime() / 1000, addr2.address, 80))
				.to.be.revertedWith('Can not presale more than total amount');
		});

		it('Withdraw Test', async function() {
			expect(await presaleContract.presale(new Date(2022, 1, 18).getTime() / 1000, addr1.address, 10))
				.to.emit(presaleContract, 'TokenPresale')
				.withArgs(ethers.utils.parseEther('10000000000'));
			await expect(presaleContract.withdraw())
				.to.be.revertedWith('Available amount is zero');
			expect(await presaleContract.revoke(addr1.address))
				.to.emit(presaleContract, 'Revoke')
				.withArgs(addr1.address);
			expect(await presaleContract.withdraw())
				.to.emit(presaleContract, 'TokenWithdraw')
				.withArgs(ethers.utils.parseEther('10000000000'));
		});
	})
})