const VISITOR_ID_KEY = "cuanin_visitor_id";

/**
 * Mengambil atau membuat visitor ID yang disimpan di localStorage.
 * Hanya boleh dipanggil di sisi klien (client component).
 */
export const getVisitorId = (): string => {
  const existingVisitorId = window.localStorage.getItem(VISITOR_ID_KEY);
  if (existingVisitorId) return existingVisitorId;

  const visitorId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Array.from(crypto.getRandomValues(new Uint32Array(4)))
        .map((value) => value.toString(36))
        .join("-");

  window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
  return visitorId;
};
