import { Buckets, KeyInfo } from '@textile/hub'
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
require('dotenv').config()

const keyInfo: KeyInfo = {
  key: process.env.TEXTILE_KEY,
  secret: process.env.TEXTILE_SECRET
}

const bucketName = process.env.BUCKET_NAME

export async function pushNFT(imagePath: string, json: any, jsonName: string): Promise<string> {
  const imageUrl = await pushImage(imagePath)
  json.image = imageUrl;
  const jsonLink = await pushJSONDocument(json, jsonName);
  return jsonLink;
}

async function pushImage(imagePath: string): Promise<string> {
  const buckets = await Buckets.withKeyInfo(keyInfo)
  const { root, threadID } = await buckets.getOrCreate(bucketName)
  if (!root) throw new Error('bucket not created')
  const bucketKey = root.key
  let imageBuffer = undefined;
  const file = fs.readFileSync(imagePath);
  const path = `${uuidv4()}.png`
  const links = await buckets.pushPath(root.key, path, file, { root })
  return `https://hub.textile.io${links.path.path}`;
}
async function pushJSONDocument(json: any, fileName: string): Promise<string> {
  const buckets = await Buckets.withKeyInfo(keyInfo)
  const { root, threadID } = await buckets.getOrCreate(bucketName)
  if (!root) throw new Error('bucket not created')
  const buf = Buffer.from(JSON.stringify(json))
  const links = await buckets.pushPath(root.key, fileName, buf, { root })
  return `https://hub.textile.io${links.path.path}`;
}
