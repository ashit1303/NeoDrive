
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class TypeormService extends DataSource implements OnApplicationBootstrap {
    constructor(config: ConfigService) {
        super({
        type: 'mysql',
        // url: config.get<string>('MYSQL_URL'),
        host: 'localhost',
        port: 3306, 
        username: 'admin',
        password: 'password',
        database: 'neodrive',
        extra: {
            // Maximum number of connections in the pool
            connectionLimit: 10,
            queueLimit: 0,
        },
        entities: [
            // __dirname + '/../**/*.entity{.ts,.js}',
            // __dirname + '/../**/*/.model{.ts,.js}',
            `${__dirname}/../models/*.{j,t}s`
        ],
        // entities: [], 
        synchronize: true,
        });
        
        console.log(
            // __dirname + '/../**/*.entity{.ts,.js}',
            // __dirname + '/../**/*/.model{.ts,.js}',
            `${__dirname}/../core/models/*.{j,t}s`
        )
    }
    async onApplicationBootstrap() {
      try {
          if (!this.isInitialized) {
              await this.initialize();
          }
      } catch (error) {
          console.error('TypeORM initialization failed:', error);
          throw error;
      }
  }
    // return dataSource.initialize();
    // dataSource = this.initialize();
}
// export const TypeormService = [
//   {
//     provide: 'DATA_SOURCE',
//     useFactory: async () => {
//       const configService = new ConfigService();
//       const dataSource = new DataSource({
//         type: 'mysql',
//         url: configService.get('MYSQL_URL'),
//         // host: 'localhost',
//         // port: 3306,
//         // username: 'root',
//         // password: 'root',
//         // database: 'care',
//         entities: [
//             __dirname + '/../**/*.entity{.ts,.js}',
//             __dirname + '/../**/*.model{.ts,.js}',
//         ],
//         synchronize: true,
//       });

//       return dataSource.initialize();
//     },
//   },
// ];
