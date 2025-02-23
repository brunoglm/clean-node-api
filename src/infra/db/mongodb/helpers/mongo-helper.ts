import { Collection, InsertOneResult, MongoClient } from 'mongodb';

export const MongoHelper = {
  client: null as MongoClient | null,

  async connect(uri: string): Promise<void> {
    this.client = await MongoClient.connect(uri);
  },

  async disconnect(): Promise<void> {
    await this.client.close();
  },

  getCollection(name: string): Collection {
    return this.client.db().collection(name);
  },

  map(obj: any, insertOneResult: InsertOneResult): any {
    return {
      id: insertOneResult?.insertedId?.toString(),
      ...obj
    };
  }
};
