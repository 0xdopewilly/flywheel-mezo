// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Mezo testnet (matsnet, chain 31611). Proxies, not implementations. Checked on-chain 2026-11-13:
/// veBTC.voter() == POOLS_VOTER and veBTC.booster() == BOOST_VOTER.
library MezoTestnet {
    uint256 internal constant CHAIN_ID = 31611;
    address internal constant VE_BTC = 0x38E35d92E6Bfc6787272A62345856B13eA12130a;
    address internal constant VE_MEZO = 0xaCE816CA2bcc9b12C59799dcC5A959Fb9b98111b;
    address internal constant POOLS_VOTER = 0x263F1Fd5fB7F866881e1B6cD7d5d6c40Fd985F0D;
    address internal constant BOOST_VOTER = 0x21d7bDF5a5929AD179F8cA0c9014A0B62ae6Bfd1;
    address internal constant BOOST_GAUGE_FACTORY = 0x2c015840D034fE74BEA8C62Dd00A11e3aa338aD5;
    address internal constant MUSD = 0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503;
    address internal constant SMUSD = 0x6f461c68B2c5492C0F5CCEc5a264d692aA7A8e16;
    address internal constant MEZO = 0x7B7c000000000000000000000000000000000001;
    address internal constant BTC = 0x7b7C000000000000000000000000000000000000;
    address internal constant ROUTER = 0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9;
    address internal constant POOL_MUSD_BTC = 0xd16A5Df82120ED8D626a1a15232bFcE2366d6AA9;
    address internal constant POOL_MUSD_MUSDC = 0x525F049A4494dA0a6c87E3C4df55f9929765Dc3e;
}
