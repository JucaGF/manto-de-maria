"use client";

import { useState, type FormEvent } from "react";
import { Inbox, KeyRound, LogIn } from "lucide-react";
import {
  readMessagesSchema,
  type PublicMessage,
  type ReadMessagesResponse,
} from "@/lib/contracts";
import { MessagesList } from "@/components/MessagesList";
import { ParticipantSelector } from "@/components/ParticipantSelector";
import { useParticipants } from "@/components/useParticipants";

type FormErrors = {
  participantSlug?: string;
  password?: string;
};

export function ReadMessagesForm() {
  const { participants, isLoading, error: participantsError } =
    useParticipants();
  const [participantSlug, setParticipantSlug] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inbox, setInbox] = useState<{
    participantName: string;
    messages: PublicMessage[];
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    const parsed = readMessagesSchema.safeParse({
      participantSlug,
      password,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        participantSlug: fieldErrors.participantSlug?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/read-messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as Partial<ReadMessagesResponse> & {
        message?: string;
      };

      if (!response.ok || !data.participant || !data.messages) {
        throw new Error(data.message ?? "Não foi possível entrar.");
      }

      setInbox({
        participantName: data.participant.name,
        messages: data.messages,
      });
      setPassword("");
    } catch (submitError) {
      setFeedback(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível entrar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (inbox) {
    return (
      <section className="devotional-card inbox-card">
        <div className="form-title-icon" aria-hidden="true">
          <Inbox size={22} />
        </div>
        <p className="eyebrow">Para {inbox.participantName}</p>
        <h2>Minhas mensagens</h2>
        <MessagesList messages={inbox.messages} />
      </section>
    );
  }

  return (
    <form className="devotional-card form-card" onSubmit={handleSubmit} noValidate>
      <div className="form-title-icon" aria-hidden="true">
        <KeyRound size={21} />
      </div>
      <h2>Entre no seu espaço</h2>
      <p className="form-intro">
        Escolha seu nome e digite sua senha para ler suas mensagens.
      </p>

      {participantsError && (
        <p className="form-feedback error" role="alert">
          {participantsError}
        </p>
      )}

      <ParticipantSelector
        id="participant"
        label="Escolha seu nome"
        participants={participants}
        value={participantSlug}
        onChange={setParticipantSlug}
        valueField="slug"
        isLoading={isLoading}
        error={errors.participantSlug}
      />

      <div className="field-group">
        <label htmlFor="password">Digite sua senha</label>
        <input
          id="password"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          maxLength={2}
          value={password}
          onChange={(event) =>
            setPassword(event.target.value.replace(/\D/g, "").slice(0, 2))
          }
          placeholder="••"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && (
          <p id="password-error" className="field-error" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      {feedback && (
        <p className="form-feedback error" role="alert">
          {feedback}
        </p>
      )}

      <button
        type="submit"
        className="primary-button"
        disabled={isSubmitting || isLoading || Boolean(participantsError)}
      >
        <LogIn size={19} aria-hidden="true" />
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
