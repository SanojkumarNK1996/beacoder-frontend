export const descriptionToText = (value) => {
  if (value == null) return "";
  if (typeof value === "string") {
    return value
      .replace(/<(br|\/p|\/div|\/li)>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n+/g, "\n")
      .trim();
  }
  if (Array.isArray(value)) return value.map(descriptionToText).filter(Boolean).join("\n");
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${descriptionToText(item)}`)
      .filter((item) => !item.endsWith(": "))
      .join("\n");
  }
  return String(value);
};

export const normalizeAssignmentDescription = (value) => {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {
      return { task: value };
    }
    return { task: value };
  }
  return {};
};
