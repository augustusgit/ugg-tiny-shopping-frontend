/** Drop empty strings so Laravel "nullable" fields stay clean. */
export function omitEmpty<T extends Record<string, unknown>>(input: T): T {
  const next = { ...input };
  Object.keys(next).forEach((key) => {
    const value = next[key];
    if (value === "" || value === undefined) {
      delete next[key];
    }
  });
  return next;
}

export function displayName(person: {
  full_name?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  username?: string | null;
  email: string;
}) {
  return (
    person.full_name ||
    [person.firstname, person.lastname].filter(Boolean).join(" ") ||
    person.username ||
    person.email
  );
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function isActiveFlag(value: boolean | number | string | null | undefined) {
  return value === true || value === 1 || value === "1";
}
