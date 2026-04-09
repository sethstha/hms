/**
 * normalizeSlug — convert any string into a valid slug.
 *
 * A valid slug (per slugSchema in @hms/schemas/organizations):
 *   - Lowercase only
 *   - Alphanumeric characters and hyphens — no spaces or special chars
 *   - Cannot start or end with a hyphen
 *   - Maximum 63 characters
 *
 * TODO: Implement this function (~5 lines).
 *
 * Hint — chain these transformations in order:
 *   1. .toLowerCase()
 *   2. .replace() to turn non-[a-z0-9] chars into hyphens
 *   3. .replace() to collapse consecutive hyphens into one
 *   4. .slice(0, 63) to enforce the 63-char max
 *   5. .replace() to strip any leading or trailing hyphens that remain
 *
 * Examples:
 *   normalizeSlug("Sunrise Health Group")  → "sunrise-health-group"
 *   normalizeSlug("  Apollo  Hospitals  ") → "apollo-hospitals"
 *   normalizeSlug("City--Care & Wellness") → "city-care-wellness"
 */
export function normalizeSlug(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 63)
    .replace(/^-|-$/g, "");
  return slug;
}

/**
 * buildSlug — generate a slug from an organization name and optional city.
 *
 * Combines the two into a single string before normalizing so that
 * "Sunrise Health" + "Kathmandu" → "sunrise-health-kathmandu".
 * When city is blank the slug is derived from name alone.
 */
export function buildSlug(name: string, city: string = ""): string {
  const combined = city.trim() ? `${name} ${city}` : name;
  return normalizeSlug(combined);
}
