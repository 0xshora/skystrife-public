// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { BEFORE_CALL_SYSTEM } from "@latticexyz/world/src/systemHookTypes.sol";

import { StandardDelegationsModule } from "@latticexyz/world-modules/src/modules/std-delegations/StandardDelegationsModule.sol";

import { PuppetModule } from "@latticexyz/world-modules/src/modules/puppet/PuppetModule.sol";
import { IERC20Mintable } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20Mintable.sol";
import { registerERC20 } from "@latticexyz/world-modules/src/modules/erc20-puppet/registerERC20.sol";
import { ERC20MetadataData } from "@latticexyz/world-modules/src/modules/erc20-puppet/tables/ERC20Metadata.sol";
import { IERC721Mintable } from "@latticexyz/world-modules/src/modules/erc721-puppet/IERC721Mintable.sol";
import { registerERC721 } from "@latticexyz/world-modules/src/modules/erc721-puppet/registerERC721.sol";
import { ERC721MetadataData } from "@latticexyz/world-modules/src/modules/erc721-puppet/tables/ERC721Metadata.sol";
import { _erc721SystemId } from "@latticexyz/world-modules/src/modules/erc721-puppet/utils.sol";

import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { ResourceId, WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { createTemplates } from "../src/codegen/scripts/CreateTemplates.sol";
import { SeasonTimes, Admin, SeasonPassConfig, SeasonPassLastSaleAt, SkyPoolConfig, VirtualLevelTemplates, LevelInStandardRotation, LevelInSeasonPassRotation, HeroInRotation, HeroInSeasonPassRotation, MatchRewardPercentages } from "../src/codegen/index.sol";
import { GrassTemplateId, ForestTemplateId, MountainTemplateId, LavaGroundTemplateId, GolemTemplateId, DragonTemplateId, WizardTemplateId } from "../src/codegen/Templates.sol";

import { SeasonPassOnlySystem } from "../src/systems/SeasonPassOnlySystem.sol";
import { addressToEntity } from "../src/libraries/LibUtils.sol";
import { NoTransferHook } from "../src/NoTransferHook.sol";

uint256 constant SEASON_PASS_STARTING_PRICE = 0.005 ether;
uint256 constant SEASON_PASS_MIN_PRICE = 0.001 ether;
uint256 constant SEASON_PASS_PRICE_DECREASE_PER_SECOND = 277_779; // loses roughly 240% value a day
uint256 constant SEASON_PASS_PRICE_DECREASE_DENOMINATOR = 10_000_000_000;
uint256 constant SEASON_PASS_PURCHASE_MULTIPLIER_PERCENT = 110;
uint256 constant SEASON_PASS_MINT_DURATION = 3 days;
uint256 constant SEASON_DURATION = 30 days;

uint256 constant COST_CREATE_MATCH = 100 ether;

uint256 constant WINDOW = 604800; // number of seconds in a week
uint256 constant SKYPOOL_SUPPLY = 1_000_000 ether; // tokens in Sky Pool

uint256 constant SKY_KEY_TOKEN_ID = 0;

contract PostDeploy is Script {
  function run(address worldAddress) external {
    IWorld world = IWorld(worldAddress);

    StoreSwitch.setStoreAddress(worldAddress);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    // Start broadcasting transactions from the deployer account
    vm.startBroadcast(deployerPrivateKey);

    address admin = vm.addr(deployerPrivateKey);
    bytes32 adminEntity = addressToEntity(admin);

    Admin.set(adminEntity, true);

    // Set SkyPool values

    uint256[] memory fourPlayerPercentages = new uint256[](4);
    fourPlayerPercentages[0] = 60;
    fourPlayerPercentages[1] = 30;
    fourPlayerPercentages[2] = 10;
    fourPlayerPercentages[3] = 0;
    MatchRewardPercentages.set(4, fourPlayerPercentages);

    uint256[] memory threePlayerPercentages = new uint256[](3);
    threePlayerPercentages[0] = 70;
    threePlayerPercentages[1] = 30;
    threePlayerPercentages[2] = 0;
    MatchRewardPercentages.set(3, threePlayerPercentages);

    uint256[] memory twoPlayerPercentages = new uint256[](2);
    twoPlayerPercentages[0] = 100;
    twoPlayerPercentages[1] = 0;
    MatchRewardPercentages.set(2, twoPlayerPercentages);

    // ______________ TEMPLATES + LEVELS __________________

    createTemplates();

    // Terrain templates are virtual, meaning they are not instantiated in individual matches
    // Instead, terrain-related values are inferred from the static Level data.
    VirtualLevelTemplates.set(GrassTemplateId, true);
    VirtualLevelTemplates.set(ForestTemplateId, true);
    VirtualLevelTemplates.set(MountainTemplateId, true);
    VirtualLevelTemplates.set(LavaGroundTemplateId, true);

    LevelInStandardRotation.set("Cauldron", true);

    LevelInSeasonPassRotation.set("Aviary", true);
    LevelInSeasonPassRotation.set("KnifeFight", true);
    LevelInSeasonPassRotation.set("Antelope", true);

    HeroInRotation.set(GolemTemplateId, true);
    HeroInSeasonPassRotation.set(DragonTemplateId, true);
    HeroInSeasonPassRotation.set(WizardTemplateId, true);

    // ______________ SKYPOOL __________________

    world.installRootModule(new StandardDelegationsModule(), new bytes(0));

    world.installModule(new PuppetModule(), new bytes(0));

    {
      // Initialise tokens
      IERC20Mintable orbToken = registerERC20(
        world,
        "Orb",
        ERC20MetadataData({ decimals: 18, name: "Orb", symbol: unicode"🔮" })
      );
      IERC721Mintable seasonPass = registerERC721(
        world,
        "szn0.2",
        ERC721MetadataData({ name: "Season Pass", symbol: unicode"🎫", baseURI: "" })
      );
      IERC721Mintable skyKey = registerERC721(
        world,
        "SkyKey",
        ERC721MetadataData({ name: "Sky Key", symbol: unicode"🔑", baseURI: "" })
      );

      // Set SkyPool values
      SkyPoolConfig.set(COST_CREATE_MATCH, WINDOW, address(orbToken), address(seasonPass), address(skyKey));
      SeasonPassConfig.set(
        SEASON_PASS_MIN_PRICE,
        SEASON_PASS_STARTING_PRICE,
        SEASON_PASS_PRICE_DECREASE_PER_SECOND,
        SEASON_PASS_PURCHASE_MULTIPLIER_PERCENT,
        block.timestamp + SEASON_PASS_MINT_DURATION
      );
      SeasonTimes.set(block.timestamp, block.timestamp + SEASON_DURATION);
      SeasonPassLastSaleAt.set(block.timestamp);

      // Mint tokens
      orbToken.mint(worldAddress, SKYPOOL_SUPPLY);
      // orbToken.mint(admin, 10_000 ether);

      skyKey.mint(admin, SKY_KEY_TOKEN_ID);
    }

    // Deploy SeasonPassOnly Match access system in the MatchAccess namespace
    ResourceId systemId = WorldResourceIdLib.encode({
      typeId: RESOURCE_SYSTEM,
      namespace: "MatchAccess",
      name: "SeasonPassOnly"
    });
    System systemContract = new SeasonPassOnlySystem();

    world.registerSystem(systemId, systemContract, true);

    NoTransferHook subscriber = new NoTransferHook();

    // Register the non-transferability hook
    world.registerSystemHook(_erc721SystemId("szn0.2"), subscriber, BEFORE_CALL_SYSTEM);

    // Transfer season pass namespace to World
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace("szn0.2");
    world.transferOwnership(namespaceId, worldAddress);

    vm.stopBroadcast();
  }
}
