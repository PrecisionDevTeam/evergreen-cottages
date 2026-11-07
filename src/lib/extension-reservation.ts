/** Validate the source reservation before creating an extension checkout. */
export function extensionSourceError(
  source: { guest_id: number | null; property_id: number | null; check_out: Date | null; status: string | null } | null,
  guestId: number, checkIn: unknown,
): string | null {
  if (!source?.property_id || !source.check_out) return "Original stay is unavailable";
  if (source.guest_id !== guestId) return "Guest mismatch";
  if (!["confirmed", "checked_in"].includes(source.status || "")) return "Original stay is inactive";
  if (checkIn !== source.check_out.toISOString().slice(0, 10)) return "Extension must start on your current checkout date. Please reload your link.";
  return null;
}
