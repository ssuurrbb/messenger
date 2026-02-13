import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMember } from 'src/chats/chat-member.entity';
import { Message } from './message.entity';
import { Chat } from 'src/chats/chat.entity';
import { MessagesGateway } from './messages.gateway';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    // Регистрируем сущности TypeORM, которые используются в сервисе сообщений
    TypeOrmModule.forFeature([Message, Chat, ChatMember]),
    // Импортируем UsersModule, чтобы gateway мог использовать UsersService
    UsersModule,
  ],
  // providers: регистрируем сервис сообщений и gateway (WebSocket)
  providers: [MessagesService, MessagesGateway],
  controllers: [MessagesController]
})
export class MessagesModule {}
