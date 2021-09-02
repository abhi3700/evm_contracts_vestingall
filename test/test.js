const { ethers, upgrades } = require('hardhat');

let erc20Contract;
let vestingContract;

beforeEach(async function () {
	const timelockReceiver = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
	const ERC20 = await ethers.getContractFactory('MisBlockBase');
	const VestingContract = await ethers.getContractFactory('VestingContract');
	erc20Contract = await ERC20.deploy();
	vestingContract = await VestingContract.deploy(timelockReceiver, erc20Contract.address);

	await erc20Contract.transfer(vestingContract.address, ethers.utils.parseEther('100000000000'));
})

describe("Vesting", function () {
	it("Vesting Contract Test", async function () {
		await vestingContract.calcTotalAmount();
		await vestingContract.release().then(function (event) {
			console.log(event);
		})
	});
});
