import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Chat } from "./chat.entity";
import { User } from "src/users/user.entity";

@Entity()
export class ChatMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, chat => chat.members, { onDelete: 'CASCADE' })
  chat: Chat;

  @ManyToOne(() => User, user => user.chatMembers, { onDelete: 'CASCADE' })
  user: User;

  @Column({ default: 'member' })
  role: string;

  @Column({ default: false })
  banned: boolean;
}
