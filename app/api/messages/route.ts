import { NextResponse } from "next/server";
import { sendMessageSchema } from "@/lib/contracts";
import { sendMessageRateLimiter } from "@/lib/rate-limit";
import {
  insertAnonymousMessage,
  participantExists,
} from "@/lib/repository";
import {
  errorResponse,
  getClientIp,
  readJsonBody,
} from "@/lib/request";

export async function POST(request: Request) {
  const rateLimit = sendMessageRateLimiter.check(getClientIp(request));

  if (!rateLimit.allowed) {
    return errorResponse(
      "Muitas tentativas. Aguarde um pouco e tente novamente.",
      429,
      rateLimit.retryAfterSeconds,
    );
  }

  const input = sendMessageSchema.safeParse(await readJsonBody(request));

  if (!input.success) {
    return errorResponse(
      input.error.issues[0]?.message ?? "Confira os dados informados.",
      400,
    );
  }

  try {
    if (!(await participantExists(input.data.recipientId))) {
      return errorResponse("Escolha uma pessoa válida.", 400);
    }

    await insertAnonymousMessage(input.data);

    return NextResponse.json(
      { message: "Mensagem enviada com carinho!" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to send anonymous message", error);
    return errorResponse("Não foi possível enviar sua mensagem.", 500);
  }
}
