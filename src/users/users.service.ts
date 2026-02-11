import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm/browser/repository/Repository.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) {}

    findAll() {
        return this.usersRepository.find();
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    } 

    async create(data: Partial<User>) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = this.usersRepository.create({
            ...data,
            password: hashedPassword,
        });
        return this.usersRepository.save(user);
    }
}