import type { ErrorRequestHandler } from "express";
import { MulterError } from "multer";

function messageForError(err: unknown): { status: number; message: string } {
  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return { status: 413, message: "Image is too large. Maximum size is 5MB." };
    }
    return { status: 400, message: `Upload error: ${err.message}` };
  }

  if (
    err &&
    typeof err === "object" &&
    "type" in err &&
    (err as { type?: string }).type === "entity.parse.failed"
  ) {
    return { status: 400, message: "Request body is not valid JSON." };
  }

  const status =
    err && typeof err === "object" && "status" in err && typeof (err as { status?: unknown }).status === "number"
      ? (err as { status: number }).status
      : 500;

  return { status, message: status >= 500 ? "Internal server error" : "Request failed" };
}

export const jsonErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const { status, message } = messageForError(err);
  req.log.error({ err }, "Unhandled request error");
  res.status(status).json({ error: message });
};
