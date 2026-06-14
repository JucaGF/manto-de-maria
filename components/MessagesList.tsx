import { Heart, MessageCircleHeart } from "lucide-react";
import type { PublicMessage } from "@/lib/contracts";

export function MessagesList({ messages }: { messages: PublicMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="empty-state">
        <MessageCircleHeart size={31} aria-hidden="true" />
        <p>Ainda não há mensagens para você.</p>
        <small>Quando alguém escrever, a mensagem aparecerá aqui.</small>
      </div>
    );
  }

  return (
    <div className="messages-list">
      {messages.map((message) => (
        <article className="message-card" key={message.id}>
          <Heart size={17} aria-hidden="true" />
          <p>{message.messageText}</p>
        </article>
      ))}
    </div>
  );
}
