import { z } from "zod";

export const sendMessageSchema = z.object({
  recipientId: z
    .string()
    .uuid("Escolha uma pessoa."),
  messageText: z
    .string()
    .trim()
    .min(1, "Escreva uma mensagem.")
    .max(2000, "A mensagem pode ter no máximo 2.000 caracteres."),
});

export const readMessagesSchema = z.object({
  participantSlug: z.string().trim().min(1, "Escolha seu nome."),
  password: z
    .string()
    .trim()
    .regex(/^\d{2}$/, "Digite sua senha de dois dígitos."),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ReadMessagesInput = z.infer<typeof readMessagesSchema>;

export type PublicParticipant = {
  id: string;
  name: string;
  slug: string;
};

export type PublicMessage = {
  id: string;
  messageText: string;
};

export type ParticipantsResponse = {
  participants: PublicParticipant[];
};

export type ReadMessagesResponse = {
  participant: {
    name: string;
  };
  messages: PublicMessage[];
};

export type ApiMessageResponse = {
  message: string;
};
