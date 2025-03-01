import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Typesense from 'typesense';
import { ZincLogger } from '../logger/zinc.service';
@Injectable()
export class TypesenseService {
  constructor(
    private configService: ConfigService,
    private readonly logger: ZincLogger,
  ) {
  }
  private typesenseConfig = {

    nodes: [{
    host: this.configService.get<string>('TYPESENSE_HOST'),
      protocol: 'http',
      port: parseInt(this.configService.get<string>('TYPESENSE_PORT')),
    }],
    numRetries: 3,
    connectionTimeoutSeconds: 10,
    apiKey: this.configService.get<string>('TYPESENSE_KEY'),
    // port: 1491,
  }
  private typesenseSearch = new Typesense.Client(this.typesenseConfig)

  async createCollection(schemaToUse): Promise<Typesense.Client['individualCollections']> {
    return this.typesenseSearch.collections().create(schemaToUse);
  }
  async search(collectionName: string, searchParameters: Typesense.SearchClient['apiCall']): Promise<Typesense.SearchClient['apiCall']> {
    return this.typesenseSearch.collections(collectionName).documents().search(searchParameters);
  }
  async push(collectionName: string, document: any): Promise<any> {
    return this.typesenseSearch.collections(collectionName).documents().create(document);
  }



  async ping(): Promise<boolean> {
    try {
      await this.typesenseSearch.health.retrieve();
      return true;
    } catch (error) {
      this.logger.error("Typesense ping failed:", error);
      return false;
    }
  }

  async retrieveDocument(collectionName: string, documentId: string): Promise<any> {
    return this.typesenseSearch.collections(collectionName).documents(documentId).retrieve();
  }

  async remove(collectionName: string, documentId: string): Promise<any> {
    return this.typesenseSearch.collections(collectionName).documents(documentId).delete();
  }

  async flushCollection(collectionName: string): Promise<any> {
    return this.typesenseSearch.collections(collectionName).delete();
  }
  async importCollection(documentsArray: any[], collectionName: string): Promise<any> {
    const importResults = await this.typesenseSearch
      .collections(collectionName)
      .documents()
      .import(documentsArray, { action: 'create' });
    return importResults;
  }
 // List all documents of collection
  async getCollection( name: string) {
    return this.typesenseSearch.collections(name).retrieve();
  }

  // create curation
  // async createCuration( collectionName: string, curationSchema: any,
  // ) {
  //   return this.typesenseSearch
  //     .collections(collectionName)
  //     .curations('')
  //     .upsert(curationSchema.id, curationSchema);
  // }


  async createSynonym(
    collectionName: string,
    synonymSchema: any,
  ) {
    return this.typesenseSearch
      .collections(collectionName)
      .synonyms()
      .upsert(synonymSchema.id, synonymSchema);
  }
  async searchInDepth(q:string, query_by:string, filter_by:string, sort_by:string, facet_by:string ) {
    return this.typesenseSearch
      .collections('products')
      .documents()
      .search({ q, query_by, filter_by, sort_by, facet_by});
  }
  //create key schema
  async createKey( keySchema) {
    return this.typesenseSearch.keys().create(keySchema);
  }
}