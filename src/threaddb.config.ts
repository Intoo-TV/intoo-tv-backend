import { Client, createUserAuth, DBInfo, KeyInfo, MailboxEvent, Private, PrivateKey, Public, Query, QueryJSON, ThreadID, UserAuth, UserMessage, Users, Where } from '@textile/hub'
import { injectable } from 'inversify';
import { threadId } from 'worker_threads';

const keyInfo: KeyInfo = {
  key: 'bqbeg4w4u6ewltnejxwmvu6ngwu',
  secret: 'bh24lv4dxie5dabwnl75y3onzphkvlqhyf56dlba'
}

@injectable()
class ThreadDBInit {
  client: Client;

  public async getClient(): Promise<Client> {
    if (!this.client)
      await this.initialize();

    return this.client;
  }
  async initialize() {


    console.log('done');
  }
}


const threadDBClient = new ThreadDBInit();
threadDBClient.getClient();
export default threadDBClient;