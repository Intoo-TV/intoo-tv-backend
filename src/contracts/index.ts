import intooTVWhitelist from './IntooTVWhitelist.json';
import ticketFactory from './TicketFactory.json';
import { ethers, signer } from '../tools/ethers';
import { Biconomy } from '@biconomy/mexa';
const userAddress = '0xd5548b2af98f4ac01e0c6702f3422cdc40801d98';

require('dotenv').config()
let contract = undefined;
let biconomy = undefined;

export const initialize = async () => {
  let jsonRpcProvider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
  biconomy = new Biconomy(jsonRpcProvider, { apiKey: "Xjp64ENEb.876fcf5b-ff18-4b96-bade-6a549c226d02", debug: true });

  biconomy.onEvent(biconomy.READY, () => {
    contract = new ethers.Contract(
      process.env.TICKET_FACTORY_ADDRESS,
      ticketFactory.abi,
      biconomy.getSignerByAddress(userAddress)
    );
  });
}
export const biconomyCall = async (address: string, uri: string, templateId: number = -1, saveAsTemplate: boolean = false) => {
  try {
    let { data } = await contract.populateTransaction.createTicket(address, uri, templateId, saveAsTemplate);
    let provider = biconomy.getEthersProvider();
    let gasLimit = await provider.estimateGas({
      to: process.env.TICKET_FACTORY_ADDRESS,
      from: userAddress,
      data: data
    });
    console.log("Gas limit : ", gasLimit);
    let txParams = {
      data: data,
      to: process.env.TICKET_FACTORY_ADDRESS,
      from: userAddress,
      gasLimit: gasLimit,
      signatureType: "EIP712_SIGN"
    };
    let tx = await provider.send("eth_sendTransaction", [txParams])

    console.log("Transaction hash : ", tx);

    //event emitter methods
    provider.once(tx, (transaction) => {
      // Emitted when the transaction has been mined
      console.log(transaction);
    })

  } catch (error) {
    console.log(error);
  }
}

export const whitelistContract = () => {
  try {
    let contract = new ethers.Contract(
      process.env.WHITELIST_ADDRESS,
      intooTVWhitelist.abi,
      signer,
    );
    return contract;
  } catch (err) {
    console.log(err);
  }
};

export const ticketFactoryContract = () => {
  try {
    let contract = new ethers.Contract(
      process.env.TICKET_FACTORY_ADDRESS,
      ticketFactory.abi,
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

export const createTicket = async (address: string, url: string, template = -1, saveAsTemplate = false) => {
  const ticketFactoryContractInst = ticketFactoryContract();
  ticketFactoryContractInst.on(
    'TicketCreated',
    (ticketId, _ticketCreator, _props, _templateIndex) => {
      console.log('TicketCreated!');
      console.log(ticketId);
      console.log(_ticketCreator);
      console.log(_props);
      console.log(_templateIndex);
    },
  );
  try {
    let result = await ticketFactoryContractInst.createTicket(
      address,
      url,
      template,
      saveAsTemplate
    );

    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
    return;
  }
}