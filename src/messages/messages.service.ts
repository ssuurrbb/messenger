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
    // Создаёт и сохраняет сообщение в указанном чате.
    // Параметры:
    // - dto: { chatId, text }
    // - user: объект пользователя (откуда берётся sender)
    // Логика:
    // 1) Проверяем, что чат существует
    // 2) Проверяем, что пользователь — участник чата и не забанен
    // 3) Сохраняем сообщение и возвращаем упрощённый DTO для клиента
    async createMessage(dto: CreateMessageDto, user: User) {
        const chat = await this.chatsRepository.findOne({ where: { id: dto.chatId } });
        if (!chat) throw new NotFoundException('Chat not found');

        // Проверяем членство пользователя в чате и флаг banned
        const member = await this.chatMembersRepository.findOne({  
            where:{
                chat:{id: dto.chatId},
                user:{id: user.id},
                banned:false
            },
        });
        if (!member) throw new NotFoundException('You are not a member of this chat or you are banned');

        // Формируем сущность сообщения и сохраняем
        const message = this.messagesRepository.create({
            text: dto.text,
            chat,
            sender: user,
        });
        await this.messagesRepository.save(message);

        // Возвращаем только нужные поля клиенту
        return {
            sender:user.name,
            text: message.text,
            createdAt: message.createdAt
        };
    }

    // Возвращает список сообщений чата в хронологическом порядке
    // Выполняет те же проверки членства, что и при создании сообщения
    async getMessages(chatId: number, user:User){
        const chat = await this.chatsRepository.findOne({ where: { id: chatId } });
        if (!chat) throw new NotFoundException('Chat not found');

        // Проверка, что автор запроса — участник чата и не забанен
        const member = await this.chatMembersRepository.findOne({
            where:{
                chat:{id: chatId},
                user:{id: user.id},
                banned:false
            },
        });
        if (!member) throw new NotFoundException('You are not a member of this chat or you are banned');

        // Загружаем сообщения с информацией об отправителе
        const messages = await this.messagesRepository.find({
            where: { chat: { id: chatId } },
            relations: ['sender'],
            order: { createdAt: 'ASC' },
        });

        // Преобразуем сущности в формат, удобный клиенту
        return messages.map(m => ({
            sender: m.sender.name,
            text: m.text,
            createdAt: m.createdAt
        }));
    }
}
