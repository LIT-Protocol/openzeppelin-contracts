const { ethers } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

const { mapValues } = require('../../helpers/iterate');
const { generators } = require('../../helpers/random');
const { TYPES } = require('../../../scripts/generate/templates/EnumerableSetViewFriendly.opts');

const { shouldBehaveLikeSet } = require('./EnumerableSetViewFriendly.behavior');

const getMethods = (mock, fnSigs) => {
  return mapValues(
    fnSigs,
    fnSig =>
      (...args) =>
        mock.getFunction(fnSig)(0, ...args),
  );
};

async function fixture() {
  const mock = await ethers.deployContract('$EnumerableSetViewFriendly');

  const env = Object.fromEntries(
    TYPES.map(({ name, type }) => [
      type,
      {
        values: Array.from({ length: 3 }, generators[type]),
        methods: getMethods(mock, {
          add: `$add(uint256,${type})`,
          remove: `$remove(uint256,${type})`,
          clear: `$clear_EnumerableSetViewFriendly_${name}(uint256)`,
          contains: `$contains(uint256,${type})`,
          length: `$length_EnumerableSetViewFriendly_${name}(uint256)`,
          at: `$at_EnumerableSetViewFriendly_${name}(uint256,uint256)`,
          values: `$values_EnumerableSetViewFriendly_${name}(uint256)`,
          limitedValuesFrom: `$limitedValuesFrom_EnumerableSetViewFriendly_${name}(uint256,uint256,uint256)`,
        }),
        events: {
          addReturn: `return$add_EnumerableSetViewFriendly_${name}_${type}`,
          removeReturn: `return$remove_EnumerableSetViewFriendly_${name}_${type}`,
        },
      },
    ]),
  );

  return { mock, env };
}

describe('EnumerableSetViewFriendly', function () {
  beforeEach(async function () {
    Object.assign(this, await loadFixture(fixture));
  });

  for (const { type } of TYPES) {
    describe(type, function () {
      beforeEach(function () {
        Object.assign(this, this.env[type]);
        [this.valueA, this.valueB, this.valueC] = this.values;
      });

      shouldBehaveLikeSet();
    });
  }
});
