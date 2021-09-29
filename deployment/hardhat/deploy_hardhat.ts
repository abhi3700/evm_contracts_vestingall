import { ethers } from "hardhat";

async function main() {
    const [deployer, beneficiary] = await ethers.getSigners();
    console.log(
      "Deploying the contracts with the account: ",
      await deployer.getAddress()
    );
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const MisBlockBase = await ethers.getContractFactory("MisBlockBase");
    const misBlockBase = await MisBlockBase.deploy();
    await misBlockBase.deployed();
    console.log("Token address:", misBlockBase.address);

    let amount = ethers.utils.parseEther('100000000000');
    const TeamVestingContract = await ethers.getContractFactory('TeamVestingContract');
    const teamVestingContract = await TeamVestingContract.deploy(misBlockBase.address, amount);
    await teamVestingContract.deployed();
    console.log("Team Vesting address:", teamVestingContract.address);

    amount = ethers.utils.parseEther('100000000000');
    const StakingContract = await ethers.getContractFactory('StakingContract');
    const stakingContract = await StakingContract.deploy(misBlockBase.address, beneficiary.address, new Date(2022, 2, 15).getTime() / 1000, amount);
    await stakingContract.deployed();
    console.log("In-App Staking address:", stakingContract.address);

    const MarketingContract = await ethers.getContractFactory('MarketingContract');
    const marketingContract = await MarketingContract.deploy(misBlockBase.address, amount);
    await marketingContract.deployed();
    console.log("Marketing address:", marketingContract.address);

    const InfluencerContract = await ethers.getContractFactory('InfluencerContract');
    const influencerContract = await InfluencerContract.deploy(misBlockBase.address, beneficiary.address, new Date(2021, 9, 17).getTime() / 1000, amount);
    await influencerContract.deployed();
    console.log("Influencers address:", influencerContract.address);

    const PresaleContract = await ethers.getContractFactory('PresaleContract');
    const presaleContract = await PresaleContract.deploy(misBlockBase.address, amount);
    await influencerContract.deployed();
    console.log("Pre-sale address:", presaleContract.address);

    const FarmingRewardContract = await ethers.getContractFactory('FarmingRewardContract');
    const farmingRewardContract = await FarmingRewardContract.deploy(misBlockBase.address, beneficiary.address, amount);
    await influencerContract.deployed();
    console.log("Farming rewards address:", farmingRewardContract.address);

    const DevelopmentFundContract = await ethers.getContractFactory('DevelopmentFundContract');
    const developmentFundContract = await DevelopmentFundContract.deploy(misBlockBase.address, amount);
    await influencerContract.deployed();
    console.log("Development Fund address:", developmentFundContract.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });