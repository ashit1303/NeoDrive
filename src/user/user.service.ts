import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { PageDto } from './user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}


    async getAllUsers(page: PageDto) {
        const skip = (page.page - 1) * page.pageSize; // Calculate the number of records to skip

        return await this.prisma.users.findMany({
            select: {
                id: true,       
                name: true,     
                email: true
            },
            // orderBy: {
            //     createdAt: 'desc', 
            // },
            skip: skip,
            take: page.pageSize,
        });
    }
}
