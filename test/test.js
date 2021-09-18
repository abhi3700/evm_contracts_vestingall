const { ethers, upgrades } = require('hardhat');
const { expect } = require("chai");

let owner, owner2, addr1, addr2, addr3, addr4, beneficiary;

let erc20Contract;

beforeEach(async function () {
	[owner, owner2, addr1, addr2, addr3, addr4, beneficiary] = await ethers.getSigners();
	
	const ERC20 =  await ethers.getContractFactory('MisBlockBase');
	erc20Contract = await ERC20.deploy();
})


describe('MIS Vesting contract unit testing', function() {
	describe('Team Vesting', function () {
		let teamVestingContract;
		beforeEach(async function() {
			const TeamVestingContract = await ethers.getContractFactory('TeamVestingContract');
			teamVestingContract = await TeamVestingContract.deploy(erc20Contract.address);
			await expect(erc20Contract.transferForVesting(teamVestingContract.address, ethers.utils.parseEther('100000000000')))
				.to.emit(teamVestingContract, 'UpdateMaximumAmount')
				.withArgs(ethers.utils.parseEther('100000000000'));
		});

		it ('owner is able to transfer ownership to owner2', async function() {
			await expect(erc20Contract.transferOwnership(owner2.address))
				.to.emit(erc20Contract, 'OwnershipTransferred')
				.withArgs(owner.address, owner2.address);
		})
		it ('owner is able to pause the vesting function', async function() {
			await expect(teamVestingContract.pause())
				.to.emit(teamVestingContract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the revoke function', async function() {
			await expect(teamVestingContract.pause())
				.to.emit(teamVestingContract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the claim function', async function() {
			await expect(teamVestingContract.pause())
				.to.emit(teamVestingContract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the claimableAmount function', async function() {
			await expect(teamVestingContract.pause())
				.to.emit(teamVestingContract, 'Paused')
				.withArgs(owner.address);
		})
		it ('Reverts execution of vest function when paused', async function() {
			await expect(teamVestingContract.pause())
				.to.emit(teamVestingContract, 'Paused')
				.withArgs(owner.address);
			await expect(teamVestingContract.vest(new Date(2022, 1, 18).getTime() / 1000, addr1.address, ethers.utils.parseEther('10000000000')))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of revoke function when paused', async function() {
			await expect(teamVestingContract.pause())
				.to.emit(teamVestingContract, 'Paused')
				.withArgs(owner.address);
			await expect(teamVestingContract.revoke(addr1.address))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of claim function when paused', async function() {
			await expect(teamVestingContract.pause())
				.to.emit(teamVestingContract, 'Paused')
				.withArgs(owner.address);
			await expect(teamVestingContract.connect(addr1).claim(erc20Contract.address))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of claimableAmount function when paused', async function() {
			await expect(teamVestingContract.pause())
				.to.emit(teamVestingContract, 'Paused')
				.withArgs(owner.address);
			await expect(teamVestingContract.connect(addr1).claimableAmount())
				.to.be.revertedWith('Pausable: paused');
		})
		it('Reverts during vesting by owner, when the maximum amount is already vested', async function() {
			await expect(teamVestingContract.vest(new Date(2022, 1, 18).getTime() / 1000, addr1.address, ethers.utils.parseEther('10000000000')))
				.to.emit(teamVestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('10000000000'));
			await expect(teamVestingContract.vest(new Date(2022, 2, 18).getTime() / 1000, addr2.address, ethers.utils.parseEther('30000000000')))
				.to.emit(teamVestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('30000000000'));
			await expect(teamVestingContract.vest(new Date(2022, 3, 18).getTime() / 1000, addr3.address, ethers.utils.parseEther('40000000000')))
				.to.emit(teamVestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('40000000000'));
			await expect(teamVestingContract.vest(new Date(2022, 4, 18).getTime() / 1000, addr4.address, ethers.utils.parseEther('20000000000')))
				.to.emit(teamVestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('20000000000'));
			await expect(teamVestingContract.vest(new Date(2022, 4, 18).getTime() / 1000, addr1.address, ethers.utils.parseEther('20000000000')))
				.to.be.revertedWith('Can not vest more than maximum amount');
		});
		it('addr1 successfully claim tokens', async function() {
			await expect(teamVestingContract.vest(new Date(2021, 1, 18).getTime() / 1000, addr1.address, ethers.utils.parseEther('10000000000')))
				.to.emit(teamVestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('10000000000'));
			await expect(teamVestingContract.connect(addr1).claim(erc20Contract.address))
				.to.emit(teamVestingContract, 'TokenClaim')
				.withArgs(ethers.utils.parseEther('10000000000'));
			expect(await erc20Contract.balanceOf(addr1.address))
				.to.equal(ethers.utils.parseEther('10000000000'));
		});
		it('owner is able to revoke a vesting', async function() {
			await expect(teamVestingContract.vest(new Date(2021, 1, 18).getTime() / 1000, addr1.address, ethers.utils.parseEther('10000000000')))
				.to.emit(teamVestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('10000000000'));
			await expect(teamVestingContract.revoke(addr1.address))
				.to.emit(teamVestingContract, 'Revoke')
				.withArgs(addr1.address);
		});
		it('Reverts, when addr1 claim a revoked vesting', async function() {
			await expect(teamVestingContract.vest(new Date(2021, 1, 18).getTime() / 1000, addr1.address, ethers.utils.parseEther('10000000000')))
				.to.emit(teamVestingContract, 'TokenVest')
				.withArgs(ethers.utils.parseEther('10000000000'));
			await expect(teamVestingContract.revoke(addr1.address))
				.to.emit(teamVestingContract, 'Revoke')
				.withArgs(addr1.address);
			await expect(teamVestingContract.connect(addr1).claim(erc20Contract.address))
				.to.be.revertedWith('Claimable amount is zero');
		});
	})
})