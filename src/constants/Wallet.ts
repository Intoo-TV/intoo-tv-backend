require('dotenv').config()

export default {
  address: process.env.MATIC_ADMIN_ADDRESS,
  mnemonic: process.env.MATIC_ADMIN_MNEMONIC
};