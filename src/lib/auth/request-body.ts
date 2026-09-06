export type JsonObject = Record<string, unknown>

export async function readJsonObject(request: Request): Promise<JsonObject | null> {
  const body: unknown = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null
  return body as JsonObject
}
