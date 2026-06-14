"use client";

import { useState, type FormEvent } from "react";
import { Heart, Send } from "lucide-react";
import { sendMessageSchema } from "@/lib/contracts";
import { ParticipantSelector } from "@/components/ParticipantSelector";
import { useParticipants } from "@/components/useParticipants";

type FormErrors = {
  recipientId?: string;
  messageText?: string;
};

export function SendMessageForm() {
  const { participants, isLoading, error: participantsError } =
    useParticipants();
  const [recipientId, setRecipientId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [feedback, setFeedback] = useState("");
  const [feedbackKind, setFeedbackKind] = useState<"success" | "error">(
    "success",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    const parsed = sendMessageSchema.safeParse({
      recipientId,
      messageText,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        recipientId: fieldErrors.recipientId?.[0],
        messageText: fieldErrors.messageText?.[0],
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(
          data.message ?? "Não foi possível enviar sua mensagem.",
        );
      }

      setRecipientId("");
      setMessageText("");
      setFeedbackKind("success");
      setFeedback(data.message ?? "Mensagem enviada com carinho!");
    } catch (submitError) {
      setFeedbackKind("error");
      setFeedback(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível enviar sua mensagem.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="devotional-card form-card" onSubmit={handleSubmit} noValidate>
      <div className="form-title-icon" aria-hidden="true">
        <Heart size={21} />
      </div>
      <h2>Escreva uma mensagem especial</h2>
      <p className="form-intro">
        Sua mensagem será entregue com carinho, sem identificar quem enviou.
      </p>

      {participantsError && (
        <p className="form-feedback error" role="alert">
          {participantsError}
        </p>
      )}

      <ParticipantSelector
        id="recipient"
        label="Para quem você quer enviar?"
        participants={participants}
        value={recipientId}
        onChange={setRecipientId}
        valueField="id"
        isLoading={isLoading}
        error={errors.recipientId}
      />

      <div className="field-group">
        <label htmlFor="message">Sua mensagem</label>
        <textarea
          id="message"
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          placeholder="Escreva aqui uma palavra de carinho, fé ou oração..."
          maxLength={2000}
          rows={7}
          aria-invalid={Boolean(errors.messageText)}
          aria-describedby={errors.messageText ? "message-error" : undefined}
        />
        <div className="textarea-meta">
          {errors.messageText ? (
            <p id="message-error" className="field-error" role="alert">
              {errors.messageText}
            </p>
          ) : (
            <span />
          )}
          <span>{messageText.length}/2000</span>
        </div>
      </div>

      {feedback && (
        <p className={`form-feedback ${feedbackKind}`} role="status">
          {feedback}
        </p>
      )}

      <button
        type="submit"
        className="primary-button"
        disabled={isSubmitting || isLoading || Boolean(participantsError)}
      >
        <Send size={19} aria-hidden="true" />
        {isSubmitting ? "Enviando..." : "Enviar anonimamente"}
      </button>
    </form>
  );
}
