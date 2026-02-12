import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Chat } from "./chat.entity";
import { Repository } from "typeorm";
import { ChatMember } from "./chat-member.entity";
import { User } from "src/users/user.entity";

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,

    @InjectRepository(ChatMember)
    private chatMemberRepository: Repository<ChatMember>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createPrivateChat(secondUserId: number, currentUser: User) {
    if (secondUserId === currentUser.id) {
      throw new BadRequestException('You cannot create chat with yourself');
    }

    // 1. Проверяем есть ли уже чат
    const existingChat = await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin('chat.members', 'm1')
      .innerJoin('chat.members', 'm2')
      .where('chat.isPrivate = true')
      .andWhere('m1.userId = :user1', { user1: currentUser.id })
      .andWhere('m2.userId = :user2', { user2: secondUserId })
      .getOne();

    if (existingChat) {
      return existingChat;
    }

    // 2. Проверяем существует ли второй пользователь
    const secondUser = await this.userRepository.findOne({
      where: { id: secondUserId },
    });

    if (!secondUser) {
      throw new NotFoundException('User not found');
    }

    // 3. Создаём чат
    const chat = await this.chatRepository.save({
      title: 'Private chat',
      isPrivate: true,
    });

    // 4. Добавляем обоих пользователей
    await this.chatMemberRepository.save([
      {
        chat,
        user: currentUser,
        role: 'admin',
      },
      {
        chat,
        user: secondUser,
        role: 'member',
      },
    ]);

    return chat;
  }
}
