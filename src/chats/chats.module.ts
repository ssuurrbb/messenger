import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './chat.entity';
import { User } from 'src/users/user.entity';
import { ChatMember } from './chat-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, User, ChatMember])],
  providers: [ChatsService],
  controllers: [ChatsController]
})
export class ChatsModule {}
