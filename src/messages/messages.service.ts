import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { ChatMember } from 'src/chats/chat-member.entity';
import { Chat } from 'src/chats/chat.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message)
        private messagesRepository: Repository<Message>,
        @InjectRepository(Chat)
        private chatsRepository: Repository<Chat>,
        @InjectRepository(ChatMember)
        private chatMembersRepository: Repository<ChatMember>,
    ) { }

    async createMessage(dto: CreateMessageDto, user: User) {
        const chat = await this.chatsRepository.findOne({ where: { id: dto.chatId } });
        if (!chat) throw new NotFoundException('Chat not found');

        const member = await this.chatMembersRepository.findOne({  
            where:{
                chat:{id: dto.chatId},
                user:{id: user.id},
                banned:false
            },
        });
        if (!member) throw new NotFoundException('You are not a member of this chat or you are banned');

        const message = this.messagesRepository.create({
            text: dto.text,
            chat,
            sender: user,
        });
        await this.messagesRepository.save(message);

        return {
            sender:user.name,
            text: message.text,
            createdAt: message.createdAt
        };
    }

    async getMessages(chatId: number, user:User){
        const chat = await this.chatsRepository.findOne({ where: { id: chatId } });
        if (!chat) throw new NotFoundException('Chat not found');

        const member = await this.chatMembersRepository.findOne({
            where:{
                chat:{id: chatId},
                user:{id: user.id},
                banned:false
            },
        });
        if (!member) throw new NotFoundException('You are not a member of this chat or you are banned');

        const messages = await this.messagesRepository.find({
            where: { chat: { id: chatId } },
            relations: ['sender'],
            order: { createdAt: 'ASC' },
        });

        return messages.map(m => ({
            sender: m.sender.name,
            text: m.text,
            createdAt: m.createdAt
        }));
    }
}
