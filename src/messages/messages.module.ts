import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMember } from 'src/chats/chat-member.entity';
import { Message } from './message.entity';
import { Chat } from 'src/chats/chat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Chat, ChatMember])
  ],
  providers: [MessagesService],
  controllers: [MessagesController]
})
export class MessagesModule {}
