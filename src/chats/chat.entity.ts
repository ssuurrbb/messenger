import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatMember } from "./chat-member.entity";
import { Message } from "src/messages/message.entity";

@Entity()
export class Chat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ default: true })
    isPrivate: boolean;

    @OneToMany(() => ChatMember, member => member.chat)
    members: ChatMember[];

    @OneToMany(() => Message, message => message.chat)
    messages: Message[];
}
