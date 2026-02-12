import { ChatMember } from 'src/chats/chat-member.entity';
import { Message } from 'src/messages/message.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Message, message => message.sender)
  messages: Message[];

  @OneToMany(() => ChatMember, (member) => member.user)
  chatMembers: ChatMember[];

}
