import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SonicChannel from 'sonic-channel';

@Injectable()
export class SonicService {
  constructor(private configService: ConfigService) {
  }
  private bucket = this.configService.get<string>('DOMAIN')
  private sonicConfig = {
    host: this.configService.get<string>('SONIC_HOST'),//|| 'localhost',
    auth: this.configService.get<string>('SONIC_PASSWORD'),
    port: parseInt(this.configService.get<string>('SONIC_PORT')),// || 1491,
    // port: 1491,
  }
  private sonicSearch = new SonicChannel.Search(this.sonicConfig).connect({
    connected: () => console.info('Sonic Channel connected (search).'),
    disconnected: () => console.error('Sonic Channel disconnected (search).'),
    timeout: () => console.error('Sonic Channel connection timed out (search).'),
    retrying: () => console.error('Trying to reconnect to Sonic Channel (search)...'),
    error: (error) => console.error('Sonic Channel connection failed (search).', error),
  });

  private sonicIngest = new SonicChannel.Ingest(this.sonicConfig).connect({
    connected: () => console.info('Sonic Channel connected (search).'),
    disconnected: () => console.error('Sonic Channel disconnected (search).'),
    timeout: () => console.error('Sonic Channel connection timed out (search).'),
    retrying: () => console.error('Trying to reconnect to Sonic Channel (search)...'),
    error: (error) => console.error('Sonic Channel connection failed (search).', error),
  });
  

  async search( collection: string, query: string): Promise<string[]> {
    return new Promise((resolve, reject) => {

        this.sonicSearch.query(collection,this.bucket, query, { limit: 10, offset: 0 })
        .then((results) => resolve(results))
        .catch((err) => reject(err));
    });
  }
  async push( collection: string, object:string, text: string): Promise<string[]> {
    return new Promise((resolve, reject) => {

      this.sonicIngest.push(collection,this.bucket, object, text)
        .then(() => resolve([]))
        .catch((err) => reject(err));
    });
  }

  async suggest( collection: string, query: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.sonicSearch.suggest(collection,this.bucket, query, { limit: 10  })
        .then((results) => resolve(results))
        .catch((err) => reject(err));
    });
  }
  
  async ping(): Promise<Boolean>{
    return new Promise((resolve, reject) => {
      this.sonicSearch.ping()
        .then(() => resolve(true))
        .catch((err) => reject(err));
    });
  }
  
  
  async remove( collection: string, object:string, text: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      // this.sonicIngest.push(collection,bucket,text, {lang: 'en'})
      this.sonicIngest.pop(collection,this.bucket, object, text,)
        .then((num) => resolve([]))
        .catch((err) => reject(err));
    });
  }


  async flushCollection(collection: string,): Promise<string[]> {
    return new Promise((resolve, reject) => {
      // this.sonicIngest.push(collection,bucket,text, {lang: 'en'})
      this.sonicIngest.flushc(collection)
        .then((num) => resolve([]))
        .catch((err) => reject(err));
    });
  }
  // async flushBucket(collection: string, bucket: string): Promise<string[]> {
  //   return new Promise((resolve, reject) => {
  //     // this.sonicIngest.push(collection,bucket,text, {lang: 'en'})
  //     this.sonicIngest.flushb(collection,bucket)
  //       .then((num) => resolve([]))
  //       .catch((err) => reject(err));
  //   });
  // }
}