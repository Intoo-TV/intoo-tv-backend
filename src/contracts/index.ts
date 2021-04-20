import intooTVWhitelist from './IntooTVWhitelist.json';
import ticketFactory from './TicketFactory.json';
import { ethers, signer } from '../tools/ethers';
import { Biconomy } from '@biconomy/mexa';
import { Experience } from '../models';
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




export const createTicket = async (address: string, url: string, template = -1, saveAsTemplate = false): Promise<number> => {
  const ticketFactoryContractInst = ticketFactoryContract();
  try {
    let overrides = {
      // The maximum units of gas for the transaction to use
      gasLimit: 2300000,
    };
    let createTx = await ticketFactoryContractInst.createTicket(
      address,
      url,
      template,
      saveAsTemplate,
      overrides
    );

    console.log(createTx);
    // Wait for transaction to finish
    const ticketTransactionResult = await createTx.wait();
    const { events } = ticketTransactionResult;
    const ticketCreatedEvent = events.find(
      e => e.event === 'TicketCreated',
    );


    if (!ticketCreatedEvent) {
      throw new Error('Something went wrong');
    }

    const tokenId = ticketCreatedEvent.args[0];
    return tokenId.toString();
  } catch (err) {
    console.log(err);
    return;
  }
}

export const createAccessToEvent = async (ticketId: number, url: string, guestAddress: string) => {
  const ticketFactoryContractInst = ticketFactoryContract();

  try {
    let createTx = await ticketFactoryContractInst.createAccessToEvent(
      ticketId,
      url,
      guestAddress
    );
    const createAccessToEventResult = await createTx.wait();
    const { events } = createAccessToEventResult;
    const accessCreatedEvent = events.find(
      e => e.event === 'ExperienceMatchingCreated',
    );


    if (!accessCreatedEvent) {
      throw new Error('Something went wrong');
    }

  } catch (err) {
    console.log(err);
    return;
  }
}


export const expireTicket = async (owner: string, ticketId: number) => {
  const ticketFactoryContractInst = ticketFactoryContract();


  ticketFactoryContractInst.on(
    'ExperienceEnded',
    (ticketId) => {
      console.log('ExperienceEnded!');
      console.log(ticketId);
    },
  );
  try {
    let result = await ticketFactoryContractInst.expireExperience(
      owner,
      ticketId
    );

    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
    return;
  }
}

export const getTokenURI = async (ticketId: number) => {
  const ticketFactoryContractInst = ticketFactoryContract();
  try {
    let result = await ticketFactoryContractInst.tokenURI(
      ticketId
    );

    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
    return;
  }
}