import * as bcrypt from 'bcrypt';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) { }

    findAll() {
        return this.usersRepository.find();
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findById(id: number): Promise<User | null> {
        // Возвращает пользователя по id. Используется например в gateway,
        // чтобы по userId найти сущность User перед сохранением сообщения.
        return this.usersRepository.findOne({ where: { id } });
    }

    async create(data: CreateUserDto) {
        const existUserEmail = await this.findByEmail(data.email);
        if (existUserEmail) throw new ConflictException('Email already in use');

        const existUserNameTag = await this.usersRepository.findOne({where:{}})
        if(existUserNameTag) throw new ConflictException('UserNameTag already in use');

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = this.usersRepository.create({
            ...data,
            password: hashedPassword,
        });
        return this.usersRepository.save(user);
    }
}