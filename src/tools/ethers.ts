
// Import the the ethers shims (**BEFORE** ethers)
import '@ethersproject/shims';

// Import the ethers library
import { ethers } from 'ethers';

import Wallet from '../constants/Wallet';
require('dotenv').config()


const provider = new ethers.providers.JsonRpcProvider(
  process.env.MATIC_RPC_PROVIDER
);

// Wallet connected to a provider
const senderWalletMnemonic = ethers.Wallet.fromMnemonic(
  Wallet.mnemonic,
  "m/44'/60'/0'/0/0"
);

let signer = senderWalletMnemonic.connect(provider);

export { provider, ethers, signer };
