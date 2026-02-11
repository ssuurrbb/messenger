import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './chat.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(Chat)
        private chatsRepository: Repository<Chat>,

        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) {}

    async createChat(dto: CreateChatDto) {
        const users = await this.usersRepository.find({
            where: {
                id: In(dto.userIds),
            },
        });

        const chat = this.chatsRepository.create({
            title: dto.title,
            participants: users
        })

        return this.chatsRepository.save(chat);
    }
}
