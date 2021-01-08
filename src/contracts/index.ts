import intooTVWhitelist from './IntooTVWhitelist.json';
import {ethers, provider, signer} from '../tools/ethers';

require('dotenv').config()

const address = process.env.WHITELIST_ADDRESS;

export const whitelistContract = () => {
  try {
    let contract = new ethers.Contract(
      address,
      intooTVWhitelist.abi,
      signer,
    );
    return contract;
  } catch (err) {
    console.log(err);
  }
};



export const addToWhitelist = async (userAddress) => {
    const whiteListContractInst = whitelistContract();
  
    whiteListContractInst.on(
      'AddedToWhitelist',
      (user) => {
        console.log('User whitelisted!');
        console.log(user);
      },
    );
    try {
      let result = await whiteListContractInst.addToWhitelist(
        userAddress
      );

      console.log(result);
      return result;
    } catch (err) {
      console.log(err);
      return;
    }
  };
