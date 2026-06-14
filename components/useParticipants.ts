"use client";

import { useEffect, useState } from "react";
import type {
  ParticipantsResponse,
  PublicParticipant,
} from "@/lib/contracts";

export function useParticipants() {
  const [participants, setParticipants] = useState<PublicParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadParticipants() {
      try {
        const response = await fetch("/api/participants");
        const data = (await response.json()) as Partial<ParticipantsResponse> & {
          message?: string;
        };

        if (!response.ok || !data.participants) {
          throw new Error(
            data.message ?? "Não foi possível carregar os participantes.",
          );
        }

        if (active) {
          setParticipants(data.participants);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar os participantes.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadParticipants();

    return () => {
      active = false;
    };
  }, []);

  return {
    participants,
    isLoading,
    error,
  };
}
