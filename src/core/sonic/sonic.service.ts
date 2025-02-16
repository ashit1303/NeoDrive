import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SonicChannel from 'sonic-channel';

@Injectable()
export class SonicService {
  constructor(private configService: ConfigService) {
  }
  private sonicConfig = {
    host: this.configService.get<string>('SONIC_HOST'),
    auth: this.configService.get<string>('SONIC_PASSWORD'),
    port: parseInt(this.configService.get<string>('SONIC_PORT')) || 1491,
    // port: 1491,
  }
  private sonicSearch = new SonicChannel.Search(
    this.sonicConfig
  ).connect({
    connected : function() {
      // Connected handler
      console.info("Sonic Channel succeeded to connect to host (search).");
    },
  
    disconnected : function() {
      // Disconnected handler
      console.error("Sonic Channel is now disconnected (search).");
    },
  
    timeout : function() {
      // Timeout handler
      console.error("Sonic Channel connection timed out (search).");
    },
  
    retrying : function() {
      // Retry handler
      console.error("Trying to reconnect to Sonic Channel (search)...");
    },
  
    error : function(error) {
      // Failure handler
      console.error("Sonic Channel failed to connect to host (search).", error);
    }
  });;

  private sonicIngest = new SonicChannel.Ingest(
    this.sonicConfig
  )
  
  private sonicControl = new SonicChannel.Control(
    this.sonicConfig
  )
  

  async search(collection: string,bucket : string, query: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      // this.sonicSearchClient.query(collection,bucket, query, { limit: 10 , offset: 0, lang: 'en' })
      this.sonicSearch.query(collection,bucket, query, { limit: 10 , offset: 0 })
        .then((results) => resolve(results))
        .catch((err) => reject(err));
    });
  }
  async push(collection: string,bucket : string, object:string, text: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      // this.sonicIngest.push(collection,bucket,text, {lang: 'en'})
      this.sonicIngest.push(collection,bucket, object, text, {lang: 'en'})
        .then(() => resolve([]))
        .catch((err) => reject(err));
    });
  }
  async pop(collection: string,bucket : string, object:string, text: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      // this.sonicIngest.push(collection,bucket,text, {lang: 'en'})
      this.sonicIngest.push(collection,bucket, object, text, {lang: 'en'})
        .then(() => resolve([]))
        .catch((err) => reject(err));
    });
  }
}