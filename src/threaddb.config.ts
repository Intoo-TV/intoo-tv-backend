import { Buckets, Client, KeyInfo, ThreadID } from '@textile/hub'
import { injectable } from 'inversify';

const keyInfo: KeyInfo = {
  key: 'bqbeg4w4u6ewltnejxwmvu6ngwu',
  secret: 'bh24lv4dxie5dabwnl75y3onzphkvlqhyf56dlba'
}

@injectable()
class ThreadDBInit {
  client: Client;
  buckets: Buckets;
  bucketKey: string;

  public async getClient(): Promise<Client> {
    if (!this.client)
      await this.initialize();

    return this.client;
  }

  async getOrCreate(bucketName: string) {
    const buckets = await Buckets.withKeyInfo(keyInfo)
    // Automatically scopes future calls on `buckets` to the Thread containing the bucket
    const { root, threadID } = await buckets.getOrCreate(bucketName)
    if (!root) throw new Error('bucket not created')
    const bucketKey = root.key
    return { buckets, bucketKey }
  }
  
  
async add() {
  const buf = Buffer.from(JSON.stringify({name: 'milena', age: 25, bla: 'blabla'}))
  const path = `index.json`
  const a = await this.buckets.pushPath(this.bucketKey, path, buf)
  console.log(a);
}
  
  async initialize() {
    const res = await this.getOrCreate('intooTV');
    this.buckets = res.buckets;
    this.bucketKey = res.bucketKey;

    await this.add();
    console.log('done');
  }
}


const threadDBClient = new ThreadDBInit();
threadDBClient.getClient();
export default threadDBClient;