import { Injectable } from '@nestjs/common';
import { PageDto } from './dto';
import { Users } from 'src/core/models/Users';
import { TypeormService } from 'src/core/typeorm/typeorm.service';
import { HelperAndFormatter as Helper } from 'src/core/helper';

@Injectable()
export class UserService {
    constructor( private readonly typeorm:TypeormService) {}
    // async getAllUsers(page: number,pageSize:   number) {
    //     const skip = (page - 1) * pageSize; // Calculate the number of records to skip
    //     const data= await this.prisma.users.findMany({
    //         select: {
    //             id: true,       
    //             name: true,     
    //             email: true,
    //             username:true,
    //         },
    //         // orderBy: {
    //         //     createdAt: 'desc', 
    //         // },
    //         skip: skip,
    //         take: pageSize,
    //     });
    //     return data[0];
    // }
    async getAllUsers(page:PageDto) {
        const {skip,take } = Helper.getPaginate(page);
         // Calculate the number of records to skip
        const data= await this.typeorm.getRepository(Users).find({
            select: {
                id: true,       
                name: true,     
                email: true,
                username:true,
            },
            // orderBy: {
            //     createdAt: 'desc', 
            // },
            skip,take
        });

        return data;
    }


    async getMyProfile(id: string){
        const myInfo= await this.typeorm.getRepository(Users).findOne({ where: { id } });
        delete myInfo.password
        return myInfo;
    }
}
