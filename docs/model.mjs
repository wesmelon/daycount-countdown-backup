export function today(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function validDate(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    value >= "1900-01-01" &&
    !isNaN(Date.parse(value)) &&
    new Date(value + "T12:00:00Z").toISOString().slice(0, 10) === value
  );
}
export function daysUntil(date, from = today()) {
  if (!validDate(date) || !validDate(from))
    throw Error("Enter a valid calendar date.");
  return Math.round(
    (Date.parse(date + "T12:00:00Z") - Date.parse(from + "T12:00:00Z")) /
      86400000,
  );
}
export function countdown(date, from = today()) {
  const days = daysUntil(date, from);
  return {
    days,
    label: days === 0 ? "Today" : `T${days > 0 ? "−" : "+"}${Math.abs(days)}`,
    description:
      days === 0
        ? "The day is here"
        : `${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} ${days > 0 ? "to go" : "ago"}`,
  };
}
export function validate(data) {
  if (
    !data ||
    data.version !== 1 ||
    !Array.isArray(data.events) ||
    data.events.length > 1000
  )
    throw Error("Invalid countdown backup.");
  const ids = new Set();
  return {
    version: 1,
    events: data.events.map((e) => {
      if (
        !e ||
        typeof e.id !== "string" ||
        !e.id ||
        ids.has(e.id) ||
        typeof e.name !== "string" ||
        !e.name.trim() ||
        e.name.length > 100 ||
        !validDate(e.date) ||
        typeof e.category !== "string" ||
        e.category.length > 50 ||
        typeof e.note !== "string" ||
        e.note.length > 2000
      )
        throw Error("Invalid event in backup.");
      ids.add(e.id);
      return {
        id: e.id,
        name: e.name.trim(),
        date: e.date,
        category: e.category.trim(),
        note: e.note,
      };
    }),
  };
}
