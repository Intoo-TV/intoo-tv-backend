import { Buckets, Client, KeyInfo, ThreadID } from '@textile/hub'
import { injectable } from 'inversify';
import { generateQRCode } from './services';
import { v4 as uuidv4 } from 'uuid';
import uuid = require('uuid');
import * as fs from 'fs';

const keyInfo: KeyInfo = {
  key: 'bqbeg4w4u6ewltnejxwmvu6ngwu',
  secret: 'bh24lv4dxie5dabwnl75y3onzphkvlqhyf56dlba'
}

const bucketName = 'intooTV';

export async function pushNFT(imagePath: string, json: any, jsonName: string) {
  const buckets = await Buckets.withKeyInfo(keyInfo)
  const { root, threadID } = await buckets.getOrCreate(bucketName)
  if (!root) throw new Error('bucket not created')
  const bucketKey = root.key
  let imageBuffer = undefined;
  fs.readFile(imagePath, async (err, data) => {
    if (err) throw err; 
    let str = data.toString('base64')
    imageBuffer = Buffer.from(str, 'base64');
    const path = `${uuidv4()}.png`
    await buckets.pushPath(root.key, path, imageBuffer, { root })
    const imageUrl =`https://hub.textile.io/thread/bafkwfcy3l745x57c7vy3z2ss6ndokatjllz5iftciq4kpr4ez2pqg3i/buckets/bafzbeiaorr5jomvdpeqnqwfbmn72kdu7vgigxvseenjgwshoij22vopice/${path}`;
    json.properties.image = imageUrl;
    pushJSONDocument(json, jsonName);
  });
}
async function pushJSONDocument(json: any, fileName: string) {
  const buckets = await Buckets.withKeyInfo(keyInfo)
  const { root, threadID } = await buckets.getOrCreate(bucketName)
  if (!root) throw new Error('bucket not created')
  const buf = Buffer.from(JSON.stringify(json))
  await buckets.pushPath(root.key, fileName, buf, { root })
}
