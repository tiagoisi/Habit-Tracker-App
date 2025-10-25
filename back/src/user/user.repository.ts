import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersRepository {
    constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}
    
    async createUser(userData: CreateUserDto) {
        const user = this.usersRepository.create(userData);
        return await this.usersRepository.save(user);
    }
}