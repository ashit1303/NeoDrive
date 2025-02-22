import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { PageDto } from './dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}
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
        const skip = (page.page - 1) * page.pageSize; // Calculate the number of records to skip
        const data= await this.prisma.users.findMany({
            select: {
                id: true,       
                name: true,     
                email: true,
                username:true,
            },
            // orderBy: {
            //     createdAt: 'desc', 
            // },
            skip: skip,
            take: page.pageSize,
        });

        return data[0];
    }


    async getMyProfile(id: number){
        const myInfo= await this.prisma.users.findFirst({ where:{id:id}})
        delete myInfo.password
        return myInfo;
    }
}
