const SimpleStorage = artifacts.require("SimpleStorage") 

contract('SimpleStorage', (accounts) => {
	const [bob, alice] = accounts
	it("should verify bob and alice's favorite numbers default to 0", async () => {
		const ssContract = await SimpleStorage.deployed()
		const bobNum = await ssContract.favoriteNumbers.call(bob)
		assert.equal(bobNum, 0,
			"bob's default value was non-zero")
		
		const aliceNum = await ssContract.favoriteNumbers.call(alice)
		assert.equal(aliceNum, 0,
			"alice's default value was non-zero")
	})

	it("should set bob's favorite number to 33", async () => {
		const ssContract = await SimpleStorage.deployed()
		ssContract.setFavorite(33, {from: bob})
		const newBobNum = await ssContract.favoriteNumbers.call(bob)
		assert.equal(newBobNum, 33,
					"bob's new value was not 33")
			})
})