// Generated from contracts/out/FlywheelPilot.sol/FlywheelPilot.json. Do not edit.
export const pilotAbi = [
 {
  "type": "constructor",
  "inputs": [
   {
    "name": "_veBTC",
    "type": "address",
    "internalType": "contract IVeBTC"
   },
   {
    "name": "_poolsVoter",
    "type": "address",
    "internalType": "contract IPoolsVoter"
   },
   {
    "name": "_boostVoter",
    "type": "address",
    "internalType": "contract IBoostVoter"
   },
   {
    "name": "_savings",
    "type": "address",
    "internalType": "contract IMUSDSavingsRate"
   },
   {
    "name": "_musd",
    "type": "address",
    "internalType": "contract IERC20"
   },
   {
    "name": "_boostGaugeFactory",
    "type": "address",
    "internalType": "address"
   },
   {
    "name": "_keeper",
    "type": "address",
    "internalType": "address"
   },
   {
    "name": "_treasury",
    "type": "address",
    "internalType": "address"
   },
   {
    "name": "_feeBps",
    "type": "uint16",
    "internalType": "uint16"
   }
  ],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "BPS",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "MAX_FEE_BPS",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "acceptOwnership",
  "inputs": [],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "boostGaugeFactory",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "address",
    "internalType": "address"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "boostVoter",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "address",
    "internalType": "contract IBoostVoter"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "compound",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "internalType": "uint256"
   },
   {
    "name": "amount",
    "type": "uint256",
    "internalType": "uint256"
   },
   {
    "name": "boostBps",
    "type": "uint16",
    "internalType": "uint16"
   },
   {
    "name": "planHash",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "enroll",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "internalType": "uint256"
   },
   {
    "name": "policy",
    "type": "tuple",
    "internalType": "struct FlywheelPilot.Policy",
    "components": [
     {
      "name": "maxPoolShareBps",
      "type": "uint16",
      "internalType": "uint16"
     },
     {
      "name": "boostShareBps",
      "type": "uint16",
      "internalType": "uint16"
     },
     {
      "name": "minPools",
      "type": "uint8",
      "internalType": "uint8"
     },
     {
      "name": "autoSave",
      "type": "bool",
      "internalType": "bool"
     },
     {
      "name": "epochPullCap",
      "type": "uint128",
      "internalType": "uint128"
     }
    ]
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "enrolledIds",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "uint256[]",
    "internalType": "uint256[]"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "enrollment",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "outputs": [
   {
    "name": "",
    "type": "tuple",
    "internalType": "struct FlywheelPilot.Enrollment",
    "components": [
     {
      "name": "owner",
      "type": "address",
      "internalType": "address"
     },
     {
      "name": "enrolledAt",
      "type": "uint64",
      "internalType": "uint64"
     },
     {
      "name": "active",
      "type": "bool",
      "internalType": "bool"
     },
     {
      "name": "policy",
      "type": "tuple",
      "internalType": "struct FlywheelPilot.Policy",
      "components": [
       {
        "name": "maxPoolShareBps",
        "type": "uint16",
        "internalType": "uint16"
       },
       {
        "name": "boostShareBps",
        "type": "uint16",
        "internalType": "uint16"
       },
       {
        "name": "minPools",
        "type": "uint8",
        "internalType": "uint8"
       },
       {
        "name": "autoSave",
        "type": "bool",
        "internalType": "bool"
       },
       {
        "name": "epochPullCap",
        "type": "uint128",
        "internalType": "uint128"
       }
      ]
     }
    ]
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "epochStart",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "exit",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "feeBps",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "uint16",
    "internalType": "uint16"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "harvest",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "internalType": "uint256"
   },
   {
    "name": "bribes",
    "type": "address[]",
    "internalType": "address[]"
   },
   {
    "name": "bribeTokens",
    "type": "address[][]",
    "internalType": "address[][]"
   },
   {
    "name": "fees",
    "type": "address[]",
    "internalType": "address[]"
   },
   {
    "name": "feeTokens",
    "type": "address[][]",
    "internalType": "address[][]"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "isLive",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "outputs": [
   {
    "name": "",
    "type": "bool",
    "internalType": "bool"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "keeper",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "address",
    "internalType": "address"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "lastPlanHash",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "outputs": [
   {
    "name": "",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "musd",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "address",
    "internalType": "contract IERC20"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "owner",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "address",
    "internalType": "address"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "pendingOwner",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "address",
    "internalType": "address"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "poolBlocked",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "internalType": "uint256"
   },
   {
    "name": "pool",
    "type": "address",
    "internalType": "address"
   }
  ],
  "outputs": [
   {
    "name": "",
    "type": "bool",
    "internalType": "bool"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "poolsVoter",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "address",
    "internalType": "contract IPoolsVoter"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "pulledInEpoch",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "internalType": "uint256"
   },
   {
    "name": "epoch",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "outputs": [
   {
    "name": "",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "remainingPull",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "outputs": [
   {
    "name": "",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "renounceOwnership",
  "inputs": [],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "savings",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "address",
    "internalType": "contract IMUSDSavingsRate"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "setFee",
  "inputs": [
   {
    "name": "_feeBps",
    "type": "uint16",
    "internalType": "uint16"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "setKeeper",
  "inputs": [
   {
    "name": "_keeper",
    "type": "address",
    "internalType": "address"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "setPoolBlocked",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "internalType": "uint256"
   },
   {
    "name": "pools",
    "type": "address[]",
    "internalType": "address[]"
   },
   {
    "name": "blocked",
    "type": "bool",
    "internalType": "bool"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "setTreasury",
  "inputs": [
   {
    "name": "_treasury",
    "type": "address",
    "internalType": "address"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "transferOwnership",
  "inputs": [
   {
    "name": "newOwner",
    "type": "address",
    "internalType": "address"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "treasury",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "address",
    "internalType": "address"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "updatePolicy",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "internalType": "uint256"
   },
   {
    "name": "policy",
    "type": "tuple",
    "internalType": "struct FlywheelPilot.Policy",
    "components": [
     {
      "name": "maxPoolShareBps",
      "type": "uint16",
      "internalType": "uint16"
     },
     {
      "name": "boostShareBps",
      "type": "uint16",
      "internalType": "uint16"
     },
     {
      "name": "minPools",
      "type": "uint8",
      "internalType": "uint8"
     },
     {
      "name": "autoSave",
      "type": "bool",
      "internalType": "bool"
     },
     {
      "name": "epochPullCap",
      "type": "uint128",
      "internalType": "uint128"
     }
    ]
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "veBTC",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "address",
    "internalType": "contract IVeBTC"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "vote",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "internalType": "uint256"
   },
   {
    "name": "pools",
    "type": "address[]",
    "internalType": "address[]"
   },
   {
    "name": "weights",
    "type": "uint256[]",
    "internalType": "uint256[]"
   },
   {
    "name": "plan",
    "type": "bytes",
    "internalType": "bytes"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "event",
  "name": "Compounded",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "indexed": true,
    "internalType": "uint256"
   },
   {
    "name": "epoch",
    "type": "uint256",
    "indexed": true,
    "internalType": "uint256"
   },
   {
    "name": "planHash",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   },
   {
    "name": "owner",
    "type": "address",
    "indexed": false,
    "internalType": "address"
   },
   {
    "name": "pulled",
    "type": "uint256",
    "indexed": false,
    "internalType": "uint256"
   },
   {
    "name": "fee",
    "type": "uint256",
    "indexed": false,
    "internalType": "uint256"
   },
   {
    "name": "saved",
    "type": "uint256",
    "indexed": false,
    "internalType": "uint256"
   },
   {
    "name": "boosted",
    "type": "uint256",
    "indexed": false,
    "internalType": "uint256"
   },
   {
    "name": "boostGauge",
    "type": "address",
    "indexed": false,
    "internalType": "address"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "Enrolled",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "indexed": true,
    "internalType": "uint256"
   },
   {
    "name": "owner",
    "type": "address",
    "indexed": true,
    "internalType": "address"
   },
   {
    "name": "policy",
    "type": "tuple",
    "indexed": false,
    "internalType": "struct FlywheelPilot.Policy",
    "components": [
     {
      "name": "maxPoolShareBps",
      "type": "uint16",
      "internalType": "uint16"
     },
     {
      "name": "boostShareBps",
      "type": "uint16",
      "internalType": "uint16"
     },
     {
      "name": "minPools",
      "type": "uint8",
      "internalType": "uint8"
     },
     {
      "name": "autoSave",
      "type": "bool",
      "internalType": "bool"
     },
     {
      "name": "epochPullCap",
      "type": "uint128",
      "internalType": "uint128"
     }
    ]
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "Exited",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "indexed": true,
    "internalType": "uint256"
   },
   {
    "name": "owner",
    "type": "address",
    "indexed": true,
    "internalType": "address"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "FeeSet",
  "inputs": [
   {
    "name": "feeBps",
    "type": "uint16",
    "indexed": false,
    "internalType": "uint16"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "Harvested",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "indexed": true,
    "internalType": "uint256"
   },
   {
    "name": "owner",
    "type": "address",
    "indexed": true,
    "internalType": "address"
   },
   {
    "name": "bribeContracts",
    "type": "uint256",
    "indexed": false,
    "internalType": "uint256"
   },
   {
    "name": "feeContracts",
    "type": "uint256",
    "indexed": false,
    "internalType": "uint256"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "KeeperSet",
  "inputs": [
   {
    "name": "keeper",
    "type": "address",
    "indexed": false,
    "internalType": "address"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "OwnershipTransferStarted",
  "inputs": [
   {
    "name": "previousOwner",
    "type": "address",
    "indexed": true,
    "internalType": "address"
   },
   {
    "name": "newOwner",
    "type": "address",
    "indexed": true,
    "internalType": "address"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "OwnershipTransferred",
  "inputs": [
   {
    "name": "previousOwner",
    "type": "address",
    "indexed": true,
    "internalType": "address"
   },
   {
    "name": "newOwner",
    "type": "address",
    "indexed": true,
    "internalType": "address"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "PlanPublished",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "indexed": true,
    "internalType": "uint256"
   },
   {
    "name": "epoch",
    "type": "uint256",
    "indexed": true,
    "internalType": "uint256"
   },
   {
    "name": "planHash",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   },
   {
    "name": "plan",
    "type": "bytes",
    "indexed": false,
    "internalType": "bytes"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "PlanVoted",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "indexed": true,
    "internalType": "uint256"
   },
   {
    "name": "epoch",
    "type": "uint256",
    "indexed": true,
    "internalType": "uint256"
   },
   {
    "name": "planHash",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   },
   {
    "name": "pools",
    "type": "address[]",
    "indexed": false,
    "internalType": "address[]"
   },
   {
    "name": "weights",
    "type": "uint256[]",
    "indexed": false,
    "internalType": "uint256[]"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "PolicyUpdated",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "indexed": true,
    "internalType": "uint256"
   },
   {
    "name": "policy",
    "type": "tuple",
    "indexed": false,
    "internalType": "struct FlywheelPilot.Policy",
    "components": [
     {
      "name": "maxPoolShareBps",
      "type": "uint16",
      "internalType": "uint16"
     },
     {
      "name": "boostShareBps",
      "type": "uint16",
      "internalType": "uint16"
     },
     {
      "name": "minPools",
      "type": "uint8",
      "internalType": "uint8"
     },
     {
      "name": "autoSave",
      "type": "bool",
      "internalType": "bool"
     },
     {
      "name": "epochPullCap",
      "type": "uint128",
      "internalType": "uint128"
     }
    ]
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "PoolBlockSet",
  "inputs": [
   {
    "name": "tokenId",
    "type": "uint256",
    "indexed": true,
    "internalType": "uint256"
   },
   {
    "name": "pool",
    "type": "address",
    "indexed": true,
    "internalType": "address"
   },
   {
    "name": "blocked",
    "type": "bool",
    "indexed": false,
    "internalType": "bool"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "TreasurySet",
  "inputs": [
   {
    "name": "treasury",
    "type": "address",
    "indexed": false,
    "internalType": "address"
   }
  ],
  "anonymous": false
 },
 {
  "type": "error",
  "name": "BadPlan",
  "inputs": []
 },
 {
  "type": "error",
  "name": "BadPolicy",
  "inputs": []
 },
 {
  "type": "error",
  "name": "BoostShareTooHigh",
  "inputs": []
 },
 {
  "type": "error",
  "name": "FeeTooHigh",
  "inputs": []
 },
 {
  "type": "error",
  "name": "NotApproved",
  "inputs": []
 },
 {
  "type": "error",
  "name": "NotEnrolled",
  "inputs": []
 },
 {
  "type": "error",
  "name": "NotKeeper",
  "inputs": []
 },
 {
  "type": "error",
  "name": "NotNftOwner",
  "inputs": []
 },
 {
  "type": "error",
  "name": "OverEpochCap",
  "inputs": []
 },
 {
  "type": "error",
  "name": "OwnableInvalidOwner",
  "inputs": [
   {
    "name": "owner",
    "type": "address",
    "internalType": "address"
   }
  ]
 },
 {
  "type": "error",
  "name": "OwnableUnauthorizedAccount",
  "inputs": [
   {
    "name": "account",
    "type": "address",
    "internalType": "address"
   }
  ]
 },
 {
  "type": "error",
  "name": "OwnerChanged",
  "inputs": []
 },
 {
  "type": "error",
  "name": "PoolNotAllowed",
  "inputs": [
   {
    "name": "pool",
    "type": "address",
    "internalType": "address"
   }
  ]
 },
 {
  "type": "error",
  "name": "PoolShareTooHigh",
  "inputs": [
   {
    "name": "pool",
    "type": "address",
    "internalType": "address"
   }
  ]
 },
 {
  "type": "error",
  "name": "ReentrancyGuardReentrantCall",
  "inputs": []
 },
 {
  "type": "error",
  "name": "SafeERC20FailedOperation",
  "inputs": [
   {
    "name": "token",
    "type": "address",
    "internalType": "address"
   }
  ]
 },
 {
  "type": "error",
  "name": "SavingDisabled",
  "inputs": []
 },
 {
  "type": "error",
  "name": "TooFewPools",
  "inputs": []
 },
 {
  "type": "error",
  "name": "ZeroAddress",
  "inputs": []
 }
] as const;
