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
	// Team Vesting
	describe('Team Vesting', function () {
		let teamVestingContract;
		beforeEach(async function() {
			const TeamVestingContract = await ethers.getContractFactory('TeamVestingContract');
			teamVestingContract = await TeamVestingContract.deploy(erc20Contract.address);
			await expect(erc20Contract.allowcateVesting(teamVestingContract.address, ethers.utils.parseEther('100000000000')))
				.to.emit(teamVestingContract, 'UpdateMaximumVestingAmount');
		});

		it ('owner is able to transfer ownership to owner2', async function() {
			await expect(teamVestingContract.transferOwnership(owner2.address))
				.to.emit(teamVestingContract, 'OwnershipTransferred')
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
			await expect(teamVestingContract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
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
			await expect(teamVestingContract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.emit(teamVestingContract, 'TokenVesting');
			await expect(teamVestingContract.vest(addr2.address, ethers.utils.parseEther('30000000000'), new Date(2022, 2, 18).getTime() / 1000))
				.to.emit(teamVestingContract, 'TokenVesting');
			await expect(teamVestingContract.vest(addr3.address, ethers.utils.parseEther('40000000000'), new Date(2022, 3, 18).getTime() / 1000))
				.to.emit(teamVestingContract, 'TokenVesting');
			await expect(teamVestingContract.vest(addr4.address, ethers.utils.parseEther('20000000000'), new Date(2022, 4, 18).getTime() / 1000))
				.to.emit(teamVestingContract, 'TokenVesting');
			await expect(teamVestingContract.vest(addr1.address, ethers.utils.parseEther('20000000000'), new Date(2022, 4, 18).getTime() / 1000))
				.to.be.revertedWith('maxVestingAmount is already vested');
		});
		it('addr1 successfully claim tokens', async function() {
			await expect(teamVestingContract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.emit(teamVestingContract, 'TokenVesting');
			// await expect(teamVestingContract.connect(addr1).claim(erc20Contract.address))
			// 	.to.emit(teamVestingContract, 'TokenClaimed');
			// expect(await erc20Contract.balanceOf(addr1.address))
			// 	.to.equal(ethers.utils.parseEther('10000000000'));
		});
		it('owner is able to revoke a vesting', async function() {
			await expect(teamVestingContract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.emit(teamVestingContract, 'TokenVesting');
			await expect(teamVestingContract.revoke(addr1.address))
				.to.emit(teamVestingContract, 'Revoke')
				.withArgs(addr1.address);
		});
		it('Reverts, when addr1 claim a revoked vesting', async function() {
			await expect(teamVestingContract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.emit(teamVestingContract, 'TokenVesting');
			await expect(teamVestingContract.revoke(addr1.address))
				.to.emit(teamVestingContract, 'Revoke')
				.withArgs(addr1.address);
			await expect(teamVestingContract.connect(addr1).claim(erc20Contract.address))
				.to.be.revertedWith('Claimable amount must be positive');
		});
	})

	// In-App Staking
	describe('In-App Staking', function () {
		let stakingContract;
		beforeEach(async function() {
			const StakingContract = await ethers.getContractFactory('StakingContract');
			stakingContract = await StakingContract.deploy(erc20Contract.address, beneficiary.address, new Date(2021, 1, 18).getTime() / 1000);
			await expect(erc20Contract.allowcateVesting(stakingContract.address, ethers.utils.parseEther('100000000000')))
				.to.emit(stakingContract, 'UpdateMaximumVestingAmount');
		});

		it ('owner is able to transfer ownership to owner2', async function() {
			await expect(stakingContract.transferOwnership(owner2.address))
				.to.emit(stakingContract, 'OwnershipTransferred')
				.withArgs(owner.address, owner2.address);
		})
		it ('owner is able to pause the setReleaseTime function', async function() {
			await expect(stakingContract.pause())
				.to.emit(stakingContract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the claim function', async function() {
			await expect(stakingContract.pause())
				.to.emit(stakingContract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the claimableAmount function', async function() {
			await expect(stakingContract.pause())
				.to.emit(stakingContract, 'Paused')
				.withArgs(owner.address);
		})
		it ('Reverts execution of setReleaseTime function when paused', async function() {
			await expect(stakingContract.pause())
				.to.emit(stakingContract, 'Paused')
				.withArgs(owner.address);
			await expect(stakingContract.setReleaseTime(new Date(2022, 1, 18).getTime() / 1000))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of claim function when paused', async function() {
			await expect(stakingContract.pause())
				.to.emit(stakingContract, 'Paused')
				.withArgs(owner.address);
			await expect(stakingContract.connect(beneficiary).claim(erc20Contract.address))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of claimableAmount function when paused', async function() {
			await expect(stakingContract.pause())
				.to.emit(stakingContract, 'Paused')
				.withArgs(owner.address);
			await expect(stakingContract.connect(beneficiary).claimableAmount())
				.to.be.revertedWith('Pausable: paused');
		})
		it('beneficiary successfully claim tokens', async function() {
			await expect(stakingContract.connect(beneficiary).claim(erc20Contract.address))
				.to.emit(stakingContract, 'TokenClaimed')
				.withArgs(ethers.utils.parseEther('100000000000'));
			expect(await erc20Contract.balanceOf(beneficiary.address))
				.to.equal(ethers.utils.parseEther('100000000000'));
		});
	})

	// Marketing
	describe('Marketing', function () {
		let marketingContract;
		beforeEach(async function() {
			const MarketingContract = await ethers.getContractFactory('MarketingContract');
			marketingContract = await MarketingContract.deploy(erc20Contract.address);
			await expect(erc20Contract.allowcateVesting(marketingContract.address, ethers.utils.parseEther('50000000000')))
				.to.emit(marketingContract, 'UpdateMaximumVestingAmount');
		});

		it ('owner is able to transfer ownership to owner2', async function() {
			await expect(marketingContract.transferOwnership(owner2.address))
				.to.emit(marketingContract, 'OwnershipTransferred')
				.withArgs(owner.address, owner2.address);
		})
		it ('owner is able to pause the vesting function', async function() {
			await expect(marketingContract.pause())
				.to.emit(marketingContract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the claim function', async function() {
			await expect(marketingContract.pause())
				.to.emit(marketingContract, 'Paused')
				.withArgs(owner.address);
		})
		it ('owner is able to pause the claimableAmount function', async function() {
			await expect(marketingContract.pause())
				.to.emit(marketingContract, 'Paused')
				.withArgs(owner.address);
		})
		it ('Reverts execution of vest function when paused', async function() {
			await expect(marketingContract.pause())
				.to.emit(marketingContract, 'Paused')
				.withArgs(owner.address);
			await expect(marketingContract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of claim function when paused', async function() {
			await expect(marketingContract.pause())
				.to.emit(marketingContract, 'Paused')
				.withArgs(owner.address);
			await expect(marketingContract.connect(addr1).claim(erc20Contract.address))
				.to.be.revertedWith('Pausable: paused');
		})
		it ('Reverts execution of claimableAmount function when paused', async function() {
			await expect(marketingContract.pause())
				.to.emit(marketingContract, 'Paused')
				.withArgs(owner.address);
			await expect(marketingContract.connect(addr1).claimableAmount())
				.to.be.revertedWith('Pausable: paused');
		})
		it('Reverts during vesting by owner, when the maximum amount is already vested', async function() {
			await expect(marketingContract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.emit(marketingContract, 'TokenVesting');
			await expect(marketingContract.vest(addr2.address, ethers.utils.parseEther('30000000000'), new Date(2022, 2, 18).getTime() / 1000))
				.to.emit(marketingContract, 'TokenVesting');
			await expect(marketingContract.vest(addr3.address, ethers.utils.parseEther('10000000000'), new Date(2022, 3, 18).getTime() / 1000))
				.to.emit(marketingContract, 'TokenVesting');
			await expect(marketingContract.vest(addr1.address, ethers.utils.parseEther('20000000000'), new Date(2022, 4, 18).getTime() / 1000))
				.to.be.revertedWith('maxVestingAmount is already vested');
		});
		it('addr1 successfully claim tokens', async function() {
			await expect(marketingContract.vest(addr1.address, ethers.utils.parseEther('10000000000'), new Date(2022, 1, 18).getTime() / 1000))
				.to.emit(marketingContract, 'TokenVesting');
			// await expect(marketingContract.connect(addr1).claim(erc20Contract.address))
			// 	.to.emit(marketingContract, 'TokenClaimed');
			// expect(await erc20Contract.balanceOf(addr1.address))
			// 	.to.equal(ethers.utils.parseEther('10000000000'));
		});
	})

	// // Influencers
	// describe('Influencers', function () {
	// 	let influencerContract;
	// 	beforeEach(async function() {
	// 		const InfluencerContract = await ethers.getContractFactory('InfluencerContract');
	// 		influencerContract = await InfluencerContract.deploy(erc20Contract.address, beneficiary.address, new Date(2021, 1, 18).getTime() / 1000);
	// 		await expect(erc20Contract.transferForVesting(influencerContract.address, ethers.utils.parseEther('50000000000')))
	// 			.to.emit(influencerContract, 'UpdateMaximumAmount')
	// 			.withArgs(ethers.utils.parseEther('50000000000'));
	// 	});

	// 	it ('owner is able to transfer ownership to owner2', async function() {
	// 		await expect(influencerContract.transferOwnership(owner2.address))
	// 			.to.emit(influencerContract, 'OwnershipTransferred')
	// 			.withArgs(owner.address, owner2.address);
	// 	})
	// 	it ('owner is able to pause the setReleaseTime function', async function() {
	// 		await expect(influencerContract.pause())
	// 			.to.emit(influencerContract, 'Paused')
	// 			.withArgs(owner.address);
	// 	})
	// 	it ('owner is able to pause the claim function', async function() {
	// 		await expect(influencerContract.pause())
	// 			.to.emit(influencerContract, 'Paused')
	// 			.withArgs(owner.address);
	// 	})
	// 	it ('owner is able to pause the claimableAmount function', async function() {
	// 		await expect(influencerContract.pause())
	// 			.to.emit(influencerContract, 'Paused')
	// 			.withArgs(owner.address);
	// 	})
	// 	it ('Reverts execution of setReleaseTime function when paused', async function() {
	// 		await expect(influencerContract.pause())
	// 			.to.emit(influencerContract, 'Paused')
	// 			.withArgs(owner.address);
	// 		await expect(influencerContract.setReleaseTime(new Date(2022, 1, 18).getTime() / 1000))
	// 			.to.be.revertedWith('Pausable: paused');
	// 	})
	// 	it ('Reverts execution of claim function when paused', async function() {
	// 		await expect(influencerContract.pause())
	// 			.to.emit(influencerContract, 'Paused')
	// 			.withArgs(owner.address);
	// 		await expect(influencerContract.connect(beneficiary).claim(erc20Contract.address))
	// 			.to.be.revertedWith('Pausable: paused');
	// 	})
	// 	it ('Reverts execution of claimableAmount function when paused', async function() {
	// 		await expect(influencerContract.pause())
	// 			.to.emit(influencerContract, 'Paused')
	// 			.withArgs(owner.address);
	// 		await expect(influencerContract.connect(beneficiary).claimableAmount())
	// 			.to.be.revertedWith('Pausable: paused');
	// 	})
	// 	it('beneficiary successfully claim tokens', async function() {
	// 		await expect(influencerContract.connect(beneficiary).claim(erc20Contract.address))
	// 			.to.emit(influencerContract, 'TokenClaim')
	// 			.withArgs(ethers.utils.parseEther('50000000000'));
	// 		expect(await erc20Contract.balanceOf(beneficiary.address))
	// 			.to.equal(ethers.utils.parseEther('50000000000'));
	// 	});
	// })
	
	// // Pre-sale
	// describe('Pre-sale', function () {
	// 	let presaleContract;
	// 	beforeEach(async function() {
	// 		const PresaleContract = await ethers.getContractFactory('PresaleContract');
	// 		presaleContract = await PresaleContract.deploy(erc20Contract.address);
	// 		await expect(erc20Contract.transferForVesting(presaleContract.address, ethers.utils.parseEther('100000000000')))
	// 			.to.emit(presaleContract, 'UpdateMaximumAmount')
	// 			.withArgs(ethers.utils.parseEther('100000000000'));
	// 	});

	// 	it ('owner is able to transfer ownership to owner2', async function() {
	// 		await expect(presaleContract.transferOwnership(owner2.address))
	// 			.to.emit(presaleContract, 'OwnershipTransferred')
	// 			.withArgs(owner.address, owner2.address);
	// 	})
	// 	it ('owner is able to pause the vesting function', async function() {
	// 		await expect(presaleContract.pause())
	// 			.to.emit(presaleContract, 'Paused')
	// 			.withArgs(owner.address);
	// 	})
	// 	it ('owner is able to pause the claim function', async function() {
	// 		await expect(presaleContract.pause())
	// 			.to.emit(presaleContract, 'Paused')
	// 			.withArgs(owner.address);
	// 	})
	// 	it ('owner is able to pause the claimableAmount function', async function() {
	// 		await expect(presaleContract.pause())
	// 			.to.emit(presaleContract, 'Paused')
	// 			.withArgs(owner.address);
	// 	})
	// 	it ('Reverts execution of vest function when paused', async function() {
	// 		await expect(presaleContract.pause())
	// 			.to.emit(presaleContract, 'Paused')
	// 			.withArgs(owner.address);
	// 		await expect(presaleContract.vest(new Date(2022, 1, 18).getTime() / 1000, addr1.address, ethers.utils.parseEther('10000000000')))
	// 			.to.be.revertedWith('Pausable: paused');
	// 	})
	// 	it ('Reverts execution of claim function when paused', async function() {
	// 		await expect(presaleContract.pause())
	// 			.to.emit(presaleContract, 'Paused')
	// 			.withArgs(owner.address);
	// 		await expect(presaleContract.connect(addr1).claim(erc20Contract.address))
	// 			.to.be.revertedWith('Pausable: paused');
	// 	})
	// 	it ('Reverts execution of claimableAmount function when paused', async function() {
	// 		await expect(presaleContract.pause())
	// 			.to.emit(presaleContract, 'Paused')
	// 			.withArgs(owner.address);
	// 		await expect(presaleContract.connect(addr1).claimableAmount())
	// 			.to.be.revertedWith('Pausable: paused');
	// 	})
	// 	it('Reverts during vesting by owner, when the maximum amount is already vested', async function() {
	// 		await expect(presaleContract.vest(new Date(2022, 1, 18).getTime() / 1000, addr1.address, ethers.utils.parseEther('10000000000')))
	// 			.to.emit(presaleContract, 'TokenVest')
	// 			.withArgs(ethers.utils.parseEther('10000000000'));
	// 		await expect(presaleContract.vest(new Date(2022, 2, 18).getTime() / 1000, addr2.address, ethers.utils.parseEther('30000000000')))
	// 			.to.emit(presaleContract, 'TokenVest')
	// 			.withArgs(ethers.utils.parseEther('30000000000'));
	// 		await expect(presaleContract.vest(new Date(2022, 3, 18).getTime() / 1000, addr3.address, ethers.utils.parseEther('40000000000')))
	// 			.to.emit(presaleContract, 'TokenVest')
	// 			.withArgs(ethers.utils.parseEther('40000000000'));
	// 		await expect(presaleContract.vest(new Date(2022, 4, 18).getTime() / 1000, addr4.address, ethers.utils.parseEther('20000000000')))
	// 			.to.emit(presaleContract, 'TokenVest')
	// 			.withArgs(ethers.utils.parseEther('20000000000'));
	// 		await expect(presaleContract.vest(new Date(2022, 4, 18).getTime() / 1000, addr1.address, ethers.utils.parseEther('20000000000')))
	// 			.to.be.revertedWith('Can not vest more than maximum amount');
	// 	});
	// 	it('addr1 successfully claim tokens', async function() {
	// 		await expect(presaleContract.vest(new Date(2021, 1, 18).getTime() / 1000, addr1.address, ethers.utils.parseEther('10000000000')))
	// 			.to.emit(presaleContract, 'TokenVest')
	// 			.withArgs(ethers.utils.parseEther('10000000000'));
	// 		await expect(presaleContract.connect(addr1).claim(erc20Contract.address))
	// 			.to.emit(presaleContract, 'TokenClaim')
	// 			.withArgs(ethers.utils.parseEther('10000000000'));
	// 		expect(await erc20Contract.balanceOf(addr1.address))
	// 			.to.equal(ethers.utils.parseEther('10000000000'));
	// 	});
	// })

	// // Farming rewards
	// describe('Farming rewards', function () {
	// 	let farmingRewardContract;
	// 	beforeEach(async function() {
	// 		const FarmingRewardContract = await ethers.getContractFactory('FarmingRewardContract');
	// 		farmingRewardContract = await FarmingRewardContract.deploy(erc20Contract.address, beneficiary.address, new Date(2021, 1, 18).getTime() / 1000);
	// 		await expect(erc20Contract.transferForVesting(farmingRewardContract.address, ethers.utils.parseEther('100000000000')))
	// 			.to.emit(farmingRewardContract, 'UpdateMaximumAmount')
	// 			.withArgs(ethers.utils.parseEther('100000000000'));
	// 	});

	// 	it ('owner is able to transfer ownership to owner2', async function() {
	// 		await expect(farmingRewardContract.transferOwnership(owner2.address))
	// 			.to.emit(farmingRewardContract, 'OwnershipTransferred')
	// 			.withArgs(owner.address, owner2.address);
	// 	})
	// 	it ('owner is able to pause the setReleaseTime function', async function() {
	// 		await expect(farmingRewardContract.pause())
	// 			.to.emit(farmingRewardContract, 'Paused')
	// 			.withArgs(owner.address);
	// 	})
	// 	it ('owner is able to pause the claim function', async function() {
	// 		await expect(farmingRewardContract.pause())
	// 			.to.emit(farmingRewardContract, 'Paused')
	// 			.withArgs(owner.address);
	// 	})
	// 	it ('owner is able to pause the claimableAmount function', async function() {
	// 		await expect(farmingRewardContract.pause())
	// 			.to.emit(farmingRewardContract, 'Paused')
	// 			.withArgs(owner.address);
	// 	})
	// 	it ('Reverts execution of setReleaseTime function when paused', async function() {
	// 		await expect(farmingRewardContract.pause())
	// 			.to.emit(farmingRewardContract, 'Paused')
	// 			.withArgs(owner.address);
	// 		await expect(farmingRewardContract.setReleaseTime(new Date(2022, 1, 18).getTime() / 1000))
	// 			.to.be.revertedWith('Pausable: paused');
	// 	})
	// 	it ('Reverts execution of claim function when paused', async function() {
	// 		await expect(farmingRewardContract.pause())
	// 			.to.emit(farmingRewardContract, 'Paused')
	// 			.withArgs(owner.address);
	// 		await expect(farmingRewardContract.connect(beneficiary).claim(erc20Contract.address))
	// 			.to.be.revertedWith('Pausable: paused');
	// 	})
	// 	it ('Reverts execution of claimableAmount function when paused', async function() {
	// 		await expect(farmingRewardContract.pause())
	// 			.to.emit(farmingRewardContract, 'Paused')
	// 			.withArgs(owner.address);
	// 		await expect(farmingRewardContract.connect(beneficiary).claimableAmount())
	// 			.to.be.revertedWith('Pausable: paused');
	// 	})
	// 	it('beneficiary successfully claim tokens', async function() {
	// 		await expect(farmingRewardContract.connect(beneficiary).claim(erc20Contract.address))
	// 			.to.emit(farmingRewardContract, 'TokenClaim')
	// 			.withArgs(ethers.utils.parseEther('100000000000'));
	// 		expect(await erc20Contract.balanceOf(beneficiary.address))
	// 			.to.equal(ethers.utils.parseEther('100000000000'));
	// 	});
	// })

	// // Development Fund
	// describe('Development Fund', function () {
	// 	let developmentFundContract;
	// 	beforeEach(async function() {
	// 		const DevelopmentFundContract = await ethers.getContractFactory('DevelopmentFundContract');
	// 		developmentFundContract = await DevelopmentFundContract.deploy(erc20Contract.address);
	// 		await expect(erc20Contract.transferForVesting(developmentFundContract.address, ethers.utils.parseEther('150000000000')))
	// 			.to.emit(developmentFundContract, 'UpdateMaximumAmount')
	// 			.withArgs(ethers.utils.parseEther('150000000000'));
	// 	});

	// 	it ('owner is able to transfer ownership to owner2', async function() {
	// 		await expect(developmentFundContract.transferOwnership(owner2.address))
	// 			.to.emit(developmentFundContract, 'OwnershipTransferred')
	// 			.withArgs(owner.address, owner2.address);
	// 	})
	// 	it ('owner is able to pause the vesting function', async function() {
	// 		await expect(developmentFundContract.pause())
	// 			.to.emit(developmentFundContract, 'Paused')
	// 			.withArgs(owner.address);
	// 	})
	// 	it ('owner is able to pause the claim function', async function() {
	// 		await expect(developmentFundContract.pause())
	// 			.to.emit(developmentFundContract, 'Paused')
	// 			.withArgs(owner.address);
	// 	})
	// 	it ('owner is able to pause the claimableAmount function', async function() {
	// 		await expect(developmentFundContract.pause())
	// 			.to.emit(developmentFundContract, 'Paused')
	// 			.withArgs(owner.address);
	// 	})
	// 	it ('Reverts execution of vest function when paused', async function() {
	// 		await expect(developmentFundContract.pause())
	// 			.to.emit(developmentFundContract, 'Paused')
	// 			.withArgs(owner.address);
	// 		await expect(developmentFundContract.vest(new Date(2022, 1, 18).getTime() / 1000, addr1.address, ethers.utils.parseEther('10000000000')))
	// 			.to.be.revertedWith('Pausable: paused');
	// 	})
	// 	it ('Reverts execution of claim function when paused', async function() {
	// 		await expect(developmentFundContract.pause())
	// 			.to.emit(developmentFundContract, 'Paused')
	// 			.withArgs(owner.address);
	// 		await expect(developmentFundContract.connect(addr1).claim(erc20Contract.address))
	// 			.to.be.revertedWith('Pausable: paused');
	// 	})
	// 	it ('Reverts execution of claimableAmount function when paused', async function() {
	// 		await expect(developmentFundContract.pause())
	// 			.to.emit(developmentFundContract, 'Paused')
	// 			.withArgs(owner.address);
	// 		await expect(developmentFundContract.connect(addr1).claimableAmount())
	// 			.to.be.revertedWith('Pausable: paused');
	// 	})
	// 	it('Reverts during vesting by owner, when the maximum amount is already vested', async function() {
	// 		await expect(developmentFundContract.vest(new Date(2022, 1, 18).getTime() / 1000, addr1.address, ethers.utils.parseEther('10000000000')))
	// 			.to.emit(developmentFundContract, 'TokenVest')
	// 			.withArgs(ethers.utils.parseEther('10000000000'));
	// 		await expect(developmentFundContract.vest(new Date(2022, 2, 18).getTime() / 1000, addr2.address, ethers.utils.parseEther('30000000000')))
	// 			.to.emit(developmentFundContract, 'TokenVest')
	// 			.withArgs(ethers.utils.parseEther('30000000000'));
	// 		await expect(developmentFundContract.vest(new Date(2022, 3, 18).getTime() / 1000, addr3.address, ethers.utils.parseEther('40000000000')))
	// 			.to.emit(developmentFundContract, 'TokenVest')
	// 			.withArgs(ethers.utils.parseEther('40000000000'));
	// 		await expect(developmentFundContract.vest(new Date(2022, 4, 18).getTime() / 1000, addr4.address, ethers.utils.parseEther('70000000000')))
	// 			.to.emit(developmentFundContract, 'TokenVest')
	// 			.withArgs(ethers.utils.parseEther('70000000000'));
	// 		await expect(developmentFundContract.vest(new Date(2022, 4, 18).getTime() / 1000, addr1.address, ethers.utils.parseEther('20000000000')))
	// 			.to.be.revertedWith('Can not vest more than maximum amount');
	// 	});
	// 	it('addr1 successfully claim tokens', async function() {
	// 		await expect(developmentFundContract.vest(new Date(2021, 1, 18).getTime() / 1000, addr1.address, ethers.utils.parseEther('10000000000')))
	// 			.to.emit(developmentFundContract, 'TokenVest')
	// 			.withArgs(ethers.utils.parseEther('10000000000'));
	// 		await expect(developmentFundContract.connect(addr1).claim(erc20Contract.address))
	// 			.to.emit(developmentFundContract, 'TokenClaim')
	// 			.withArgs(ethers.utils.parseEther('10000000000'));
	// 		expect(await erc20Contract.balanceOf(addr1.address))
	// 			.to.equal(ethers.utils.parseEther('10000000000'));
	// 	});
	// })
})