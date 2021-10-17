import { ethers, network } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

let owner : SignerWithAddress, 
	owner2 : SignerWithAddress, 
	addr1 : SignerWithAddress, 
	addr2 : SignerWithAddress, 
	addr3 : SignerWithAddress, 
	addr4 : SignerWithAddress, 
	beneficiary: SignerWithAddress;
let token : Contract;

beforeEach(async function () {
	let accounts: SignerWithAddress[] = await ethers.getSigners();
	[owner, owner2, addr1, addr2, addr3, addr4, beneficiary] = accounts;
	
	const ERC20 =  await ethers.getContractFactory('MisBlockBase');
	token = await ERC20.deploy();
})


describe('MIS Vesting contract unit testing', function() {
	// Team Vesting
	describe('Team Vesting', function () {
		let contract : Contract;
		let amount : BigNumber;
		beforeEach(async function() {
			amount = ethers.utils.parseEther('100000000000');
			const TeamVestingContract = await ethers.getContractFactory('TeamVestingContract');
			contract = await TeamVestingContract.deploy(token.address, amount);
			await expect(token.transfer(contract.address, amount))
				.to.emit(token, 'Transfer');
			await expect(token.approve(contract.address, amount))
				.to.emit(token, 'Approval');
			expect (await token.allowance(owner.address, contract.address))
				.to.equal(amount)
		});

		it ('owner is able to transfer ownership to owner2', async function() {
			await expect(contract.transferOwnership(owner2.address))
				.to.emit(contract, 'OwnershipTransferred')
				.withArgs(owner.address, owner2.address);
		})
		it ('owner is able to pause the vesting function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the revoke function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the claim function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the claimableAmount function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('Reverts execution of vest function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of revoke function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.revoke(addr1.address))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of claim function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.connect(addr1).claim(token.address))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of claimableAmount function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.connect(addr1).claimableAmount(token.address))
				.to.be.revertedWith('Pausable: paused');
		})
		it('Reverts during vesting by owner, when the maximum amount is already vested', async function() {
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');
			await expect(contract.vest(addr2.address, ethers.utils.parseEther('30000000000'), new Date(2022, 2, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');
			await expect(contract.vest(addr3.address, ethers.utils.parseEther('40000000000'), new Date(2022, 3, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');
			await expect(contract.vest(addr4.address, ethers.utils.parseEther('20000000000'), new Date(2022, 4, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('20000000000'), new Date(2022, 4, 18).getTime() / 1000))
				.to.be.revertedWith('maxVestingAmount is already vested');
		});
		it('addr1 successfully claim tokens', async function() {
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');

			await network.provider.send(
				"evm_setNextBlockTimestamp", 
				[new Date(2022, 1, 18).getTime() / 1000]);

			await expect(contract.connect(addr1).claim(token.address))
				.to.emit(contract, 'TokenClaimed');
			expect(await token.balanceOf(addr1.address))
				.to.equal(ethers.utils.parseEther('10000000000'));

			expect(await contract.claimableAmount(addr1.address))
				.to.equal(0);

			await network.provider.request({
				method: "hardhat_reset",
				params: [{ timestamp: new Date().getTime() / 1000 }]});
		});
		it('owner is able to revoke a vesting', async function() {
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');
			await expect(contract.revoke(addr1.address))
				.to.emit(contract, 'Revoke');
		});
		it('Reverts, when addr1 claim a revoked vesting', async function() {
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');
			await expect(contract.revoke(addr1.address))
				.to.emit(contract, 'Revoke');
			await expect(contract.connect(addr1).claim(token.address))
				.to.be.revertedWith('Account must not already be revoked');
		});
	})

	// In-App Staking
	describe('In-App Staking', function () {
		let contract : Contract;
		let amount : BigNumber;
		beforeEach(async function() {
			amount = ethers.utils.parseEther('100000000000');
			const StakingContract = await ethers.getContractFactory('StakingContract');
			contract = await StakingContract.deploy(token.address, beneficiary.address, new Date(2022, 2, 15).getTime() / 1000, amount);
			await expect(token.transfer(contract.address, amount))
				.to.emit(token, 'Transfer');
			await expect(token.approve(contract.address, amount))
				.to.emit(token, 'Approval');
			expect (await token.allowance(owner.address, contract.address))
				.to.equal(amount)
		});

		it ('owner is able to transfer ownership to owner2', async function() {
			await expect(contract.transferOwnership(owner2.address))
				.to.emit(contract, 'OwnershipTransferred')
				.withArgs(owner.address, owner2.address);
		})
		it ('owner is able to pause the claim function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the claimableAmount function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('Reverts execution of claim function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.connect(beneficiary).claim(token.address))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of claimableAmount function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.connect(beneficiary).claimableAmount())
				.to.be.revertedWith('Pausable: paused');
		})
		it('beneficiary successfully claim tokens', async function() {
			await network.provider.send(
				"evm_setNextBlockTimestamp", 
				[new Date(2022, 2, 15).getTime() / 1000]);

			await expect(contract.connect(beneficiary).claim(token.address))
				.to.emit(contract, 'TokenClaimed');
			expect(await token.balanceOf(beneficiary.address))
				.to.equal(amount);

			await network.provider.request({
				method: "hardhat_reset",
				params: [{ timestamp: new Date().getTime() / 1000 }]});
		});
	})

	// Marketing
	describe('Marketing', function () {
		let contract : Contract;
		let amount : BigNumber;
		beforeEach(async function() {
			const amount = ethers.utils.parseEther('50000000000');
			const MarketingContract = await ethers.getContractFactory('MarketingContract');
			contract = await MarketingContract.deploy(token.address, amount);
			await expect(token.transfer(contract.address, amount))
				.to.emit(token, 'Transfer');
			await expect(token.approve(contract.address, amount))
				.to.emit(token, 'Approval');
			expect (await token.allowance(owner.address, contract.address))
				.to.equal(amount)
		});

		it ('owner is able to transfer ownership to owner2', async function() {
			await expect(contract.transferOwnership(owner2.address))
				.to.emit(contract, 'OwnershipTransferred')
				.withArgs(owner.address, owner2.address);
		})
		it ('owner is able to pause the vesting function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the claim function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the claimableAmount function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('Reverts execution of vest function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of claim function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.connect(addr1).claim(token.address))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of claimableAmount function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.connect(addr1).claimableAmount(addr1.address))
				.to.be.revertedWith('Pausable: paused');
		})
		it('Reverts during vesting by owner, when the maximum amount is already vested', async function() {
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');
			await expect(contract.vest(addr2.address, ethers.utils.parseEther('40000000000'), new Date(2022, 2, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('20000000000'), new Date(2022, 4, 18).getTime() / 1000))
				.to.be.revertedWith('maxVestingAmount is already vested');
		});
		it('addr1 successfully claim tokens', async function() {
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');

			await network.provider.send(
				"evm_setNextBlockTimestamp", 
				[new Date(2022, 1, 18).getTime() / 1000]);

			await expect(contract.connect(addr1).claim(token.address))
				.to.emit(contract, 'TokenClaimed');
			expect(await token.balanceOf(addr1.address))
				.to.equal(ethers.utils.parseEther('10000000000'));

			await network.provider.request({
				method: "hardhat_reset",
				params: [{ timestamp: new Date().getTime() / 1000 }]});
		});
	})

	// Influencers
	describe('Influencers', function () {
		let contract : Contract;
		let amount : BigNumber;
		beforeEach(async function() {
			amount = ethers.utils.parseEther('50000000000');
			const InfluencerContract = await ethers.getContractFactory('InfluencerContract');
			contract = await InfluencerContract.deploy(token.address, beneficiary.address, new Date(2021, 9, 17).getTime() / 1000, amount);
			await expect(token.transfer(contract.address, amount))
				.to.emit(token, 'Transfer');
			await expect(token.approve(contract.address, amount))
				.to.emit(token, 'Approval');
			expect (await token.allowance(owner.address, contract.address))
				.to.equal(amount)
		});

		it ('owner is able to transfer ownership to owner2', async function() {
			await expect(contract.transferOwnership(owner2.address))
				.to.emit(contract, 'OwnershipTransferred')
				.withArgs(owner.address, owner2.address);
		})
		it ('owner is able to pause the claim function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the claimableAmount function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('Reverts execution of claim function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.connect(beneficiary).claim(token.address))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of claimableAmount function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.connect(beneficiary).claimableAmount())
				.to.be.revertedWith('Pausable: paused');
		})
		it('beneficiary successfully claim tokens', async function() {
			await network.provider.send(
				"evm_setNextBlockTimestamp", 
				[new Date(2022, 2, 15).getTime() / 1000]);

			await expect(contract.connect(beneficiary).claim(token.address))
				.to.emit(contract, 'TokenClaimed');
			expect(await token.balanceOf(beneficiary.address))
				.to.equal(amount);

			await network.provider.request({
				method: "hardhat_reset",
				params: [{ timestamp: new Date().getTime() / 1000 }]});
		});
	})
	
	// Pre-sale
	describe('Pre-sale', function () {
		let contract : Contract;
		let amount : BigNumber;
		beforeEach(async function() {
			amount = ethers.utils.parseEther('100000000000');

			const PresaleContract = await ethers.getContractFactory('PresaleContract');
			contract = await PresaleContract.deploy(token.address, amount);
			await expect(token.transfer(contract.address, amount))
				.to.emit(token, 'Transfer');
			await expect(token.approve(contract.address, amount))
				.to.emit(token, 'Approval');
			expect (await token.allowance(owner.address, contract.address))
				.to.equal(amount)
		});

		it ('owner is able to transfer ownership to owner2', async function() {
			await expect(contract.transferOwnership(owner2.address))
				.to.emit(contract, 'OwnershipTransferred')
				.withArgs(owner.address, owner2.address);
		})
		it ('owner is able to pause the vesting function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the claim function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the claimableAmount function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('Reverts execution of vest function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of claim function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.connect(addr1).claim(token.address))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of claimableAmount function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.connect(addr1).claimableAmount(addr1.address))
				.to.be.revertedWith('Pausable: paused');
		})
		it('Reverts during vesting by owner, when the maximum amount is already vested', async function() {
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');
			await expect(contract.vest(addr2.address, ethers.utils.parseEther('30000000000'), new Date(2022, 2, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');
			await expect(contract.vest(addr3.address, ethers.utils.parseEther('40000000000'), new Date(2022, 3, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');
			await expect(contract.vest(addr4.address, ethers.utils.parseEther('20000000000'), new Date(2022, 4, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('20000000000'), new Date(2022, 4, 18).getTime() / 1000))
				.to.be.revertedWith('maxVestingAmount is already vested');
		});
		it('addr1 successfully claim tokens', async function() {
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');

			await network.provider.send(
				"evm_setNextBlockTimestamp", 
				[new Date(2022, 1, 18).getTime() / 1000]);

			await expect(contract.connect(addr1).claim(token.address))
				.to.emit(contract, 'TokenClaimed');
			expect(await token.balanceOf(addr1.address))
				.to.equal(ethers.utils.parseEther('10000000000'));

			await network.provider.request({
				method: "hardhat_reset",
				params: [{ timestamp: new Date().getTime() / 1000 }]});
		});
	})

	// Farming rewards
	describe('Farming rewards', function () {
		let contract : Contract;
		let amount : BigNumber;
		beforeEach(async function() {
			amount = ethers.utils.parseEther('100000000000');
			const FarmingRewardContract = await ethers.getContractFactory('FarmingRewardContract');
			contract = await FarmingRewardContract.deploy(token.address, beneficiary.address, amount);
			await expect(token.transfer(contract.address, amount))
				.to.emit(token, 'Transfer');
			await expect(token.approve(contract.address, amount))
				.to.emit(token, 'Approval');
			expect (await token.allowance(owner.address, contract.address))
				.to.equal(amount)
		});

		it ('owner is able to transfer ownership to owner2', async function() {
			await expect(contract.transferOwnership(owner2.address))
				.to.emit(contract, 'OwnershipTransferred')
				.withArgs(owner.address, owner2.address);
		})
		it ('owner is able to pause the claim function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the claimableAmount function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('Reverts execution of claim function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.connect(beneficiary).claim(token.address))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of claimableAmount function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.connect(beneficiary).claimableAmount())
				.to.be.revertedWith('Pausable: paused');
		})
		it('beneficiary successfully claim tokens', async function() {
			await expect(contract.connect(beneficiary).claim(token.address))
				.to.emit(contract, 'TokenClaimed');
			expect(await token.balanceOf(beneficiary.address))
				.to.equal(amount);
		});
	})

	// Development Fund
	describe('Development Fund', function () {
		let contract : Contract;
		let amount : BigNumber;
		beforeEach(async function() {
			const amount = ethers.utils.parseEther('150000000000');
			const DevelopmentFundContract = await ethers.getContractFactory('DevelopmentFundContract');
			contract = await DevelopmentFundContract.deploy(token.address, amount);
			await expect(token.transfer(contract.address, amount))
				.to.emit(token, 'Transfer');
			await expect(token.approve(contract.address, amount))
				.to.emit(token, 'Approval');
			expect (await token.allowance(owner.address, contract.address))
				.to.equal(amount)
		});

		it ('owner is able to transfer ownership to owner2', async function() {
			await expect(contract.transferOwnership(owner2.address))
				.to.emit(contract, 'OwnershipTransferred')
				.withArgs(owner.address, owner2.address);
		})
		it ('owner is able to pause the vesting function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the claim function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the claimableAmount function', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
		})
		it ('Reverts execution of vest function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of claim function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.connect(addr1).claim(token.address))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of claimableAmount function when paused', async function() {
			await expect(contract.pause())
				.to.emit(contract, 'Paused')
				.withArgs(owner.address);
			await expect(contract.connect(addr1).claimableAmount(addr1.address))
				.to.be.revertedWith('Pausable: paused');
		})
		it('Reverts during vesting by owner, when the maximum amount is already vested', async function() {
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');
			await expect(contract.vest(addr2.address, ethers.utils.parseEther('30000000000'), new Date(2022, 2, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');
			await expect(contract.vest(addr3.address, ethers.utils.parseEther('40000000000'), new Date(2022, 3, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');
			await expect(contract.vest(addr4.address, ethers.utils.parseEther('70000000000'), new Date(2022, 4, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('20000000000'), new Date(2022, 4, 18).getTime() / 1000))
				.to.be.revertedWith('maxVestingAmount is already vested');
		});
		it('addr1 successfully claim tokens', async function() {
			await expect(contract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.emit(contract, 'TokenVested');

			await network.provider.send(
				"evm_setNextBlockTimestamp", 
				[new Date(2022, 1, 18).getTime() / 1000]);

			await expect(contract.connect(addr1).claim(token.address))
				.to.emit(contract, 'TokenClaimed');
			expect(await token.balanceOf(addr1.address))
				.to.equal(ethers.utils.parseEther('10000000000'));

			await network.provider.request({
				method: "hardhat_reset",
				params: [{ timestamp: new Date().getTime() / 1000 }]});
		});
	})
})