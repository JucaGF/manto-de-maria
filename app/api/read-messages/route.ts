import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth";
import { readMessagesSchema } from "@/lib/contracts";
import { readMessagesRateLimiter } from "@/lib/rate-limit";
import {
  findParticipantForLogin,
  listMessagesForParticipant,
} from "@/lib/repository";
import {
  errorResponse,
  getClientIp,
  readJsonBody,
} from "@/lib/request";

export async function POST(request: Request) {
  const rateLimit = readMessagesRateLimiter.check(getClientIp(request));

  if (!rateLimit.allowed) {
    return errorResponse(
      "Muitas tentativas. Aguarde um pouco e tente novamente.",
      429,
      rateLimit.retryAfterSeconds,
    );
  }

  const input = readMessagesSchema.safeParse(await readJsonBody(request));

  if (!input.success) {
    return errorResponse(
      input.error.issues[0]?.message ?? "Confira os dados informados.",
      400,
    );
  }

  try {
    const participant = await findParticipantForLogin(
      input.data.participantSlug,
    );

    if (
      !participant ||
      !(await verifyPassword(input.data.password, participant.passwordHash))
    ) {
      return errorResponse("Senha incorreta.", 401);
    }

    const messages = await listMessagesForParticipant(participant.id);

    return NextResponse.json({
      participant: {
        name: participant.name,
      },
      messages,
    });
  } catch (error) {
    console.error("Failed to read participant messages", error);
    return errorResponse("Não foi possível carregar suas mensagens.", 500);
  }
}
