import { today, countdown, daysUntil, validate } from "./model.mjs";
const $ = (s) => document.querySelector(s),
  KEY = "daycount.countdowns.v1";
let data = { version: 1, events: [] },
  editing = null,
  blocked = false,
  timer;
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};
function notify(text) {
  $("#status").textContent = text;
  $("#status").style.display = "block";
  clearTimeout(timer);
  timer = setTimeout(() => ($("#status").style.display = "none"), 4000);
}
try {
  const raw = localStorage.getItem(KEY);
  if (raw) data = validate(JSON.parse(raw));
} catch {
  blocked = true;
  setTimeout(
    () =>
      notify(
        "Saved data could not be loaded. Export it before restoring a backup.",
      ),
    100,
  );
}
function save(next) {
  if (blocked)
    throw Error(
      "Saved data is unreadable. Export it and restore a valid backup first.",
    );
  next = validate(next);
  localStorage.setItem(KEY, JSON.stringify(next));
  data = next;
  render();
}
function format(date) {
  return new Date(date + "T12:00:00").toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
function edit(event) {
  editing = event?.id || null;
  $("#title").textContent = event
    ? "Edit event"
    : "Something to look forward to";
  $("#name").value = event?.name || "";
  $("#date").value = event?.date || today();
  $("#group").value = event?.category || "";
  $("#note").value = event?.note || "";
  $("#error").textContent = "";
  $("#remove").hidden = !event;
  $("#editor").showModal();
}
function editButton(event, text = "Edit event") {
  const b = el("button", "", text);
  b.type = "button";
  b.onclick = () => edit(event);
  return b;
}
function render() {
  const date = today();
  $("#today").textContent = new Date()
    .toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();
  $("#count").textContent = data.events.length;
  const category = $("#category").value,
    groups = [
      ...new Set(data.events.map((e) => e.category).filter(Boolean)),
    ].sort();
  $("#category").replaceChildren(
    new Option("All categories", ""),
    ...groups.map((g) => new Option(g, g)),
  );
  $("#category").value = groups.includes(category) ? category : "";
  $("#groups").replaceChildren(...groups.map((g) => new Option(g, g)));
  const next = data.events
    .filter((e) => daysUntil(e.date, date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const feature = $("#featured");
  feature.replaceChildren();
  if (next) {
    const c = countdown(next.date, date),
      box = el("article", "hero"),
      text = el("div");
    text.append(
      el("p", "eyebrow", "NEXT UP"),
      el("h2", "", next.name),
      el("p", "", format(next.date)),
    );
    const count = el("div");
    count.append(el("div", "digits", c.label), el("p", "", c.description));
    box.append(text, count, editButton(next, "View event ↗"));
    feature.append(box);
  }
  const query = $("#search").value.toLocaleLowerCase(),
    show = $("#show").value;
  let events = data.events.filter(
    (e) =>
      (!$("#category").value || e.category === $("#category").value) &&
      `${e.name} ${e.note}`.toLocaleLowerCase().includes(query) &&
      (show === "all" ||
        (show === "upcoming"
          ? daysUntil(e.date, date) >= 0
          : daysUntil(e.date, date) < 0)),
  );
  events.sort(
    $("#sort").value === "name"
      ? (a, b) => a.name.localeCompare(b.name)
      : (a, b) =>
          show === "past"
            ? b.date.localeCompare(a.date)
            : a.date.localeCompare(b.date),
  );
  const list = $("#events");
  list.replaceChildren();
  if (!events.length) {
    const empty = el("div", "empty");
    empty.append(
      el(
        "h3",
        "",
        data.events.length
          ? "No matching dates."
          : "Your next chapter starts with a date.",
      ),
      el(
        "p",
        "",
        data.events.length
          ? "Try another filter or add a new event."
          : "A wedding, a trip, a birthday — keep the days in sight.",
      ),
    );
    list.append(empty);
  }
  for (const event of events) {
    const c = countdown(event.date, date),
      card = el("article", "card");
    card.append(
      el("p", "eyebrow", event.category || "PERSONAL"),
      el("h3", "", event.name),
      el("p", "date", format(event.date)),
      el("div", "digits", c.label),
      el("p", "caption", c.description),
    );
    if (event.note) card.append(el("p", "note", event.note));
    card.append(editButton(event));
    list.append(card);
  }
}
$("#form").onsubmit = (e) => {
  e.preventDefault();
  try {
    const event = {
      id: editing || crypto.randomUUID(),
      name: $("#name").value.trim(),
      date: $("#date").value,
      category: $("#group").value.trim(),
      note: $("#note").value,
    };
    const events = editing
      ? data.events.map((x) => (x.id === editing ? event : x))
      : [...data.events, event];
    save({ version: 1, events });
    $("#editor").close();
    notify("Event saved.");
  } catch (err) {
    $("#error").textContent = err.message;
  }
};
$("#remove").onclick = () => {
  if (!confirm("Delete this event?")) return;
  try {
    save({ version: 1, events: data.events.filter((e) => e.id !== editing) });
    $("#editor").close();
    notify("Event deleted.");
  } catch (e) {
    $("#error").textContent = e.message;
  }
};
$("#add").onclick = () => edit();
$("#close").onclick = () => $("#editor").close();
for (const id of ["search", "category", "show", "sort"])
  $("#" + id).addEventListener(id === "search" ? "input" : "change", render);
$("#backup").onclick = () => {
  $("#importError").textContent = "";
  $("#import").value = "";
  $("#backups").showModal();
};
$("#closeBackup").onclick = () => $("#backups").close();
$("#export").onclick = () => {
  try {
    const raw = localStorage.getItem(KEY) || JSON.stringify(data, null, 2),
      url = URL.createObjectURL(new Blob([raw], { type: "application/json" })),
      a = el("a");
    a.href = url;
    a.download = `daycount-countdowns-${today()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    $("#importError").textContent = e.message;
  }
};
$("#import").onchange = async () => {
  try {
    const file = $("#import").files[0];
    if (!file) return;
    if (file.size > 5000000) throw Error("Choose a backup smaller than 5 MB.");
    const next = validate(JSON.parse(await file.text()));
    if (
      !confirm(
        `Replace all events with ${next.events.length} events from this backup?`,
      )
    )
      return;
    localStorage.setItem(KEY, JSON.stringify(next));
    blocked = false;
    data = next;
    render();
    $("#backups").close();
    notify("Backup restored.");
  } catch (e) {
    $("#importError").textContent = e.message;
  }
};
window.addEventListener("storage", (e) => {
  if (e.key !== KEY) return;
  try {
    data = e.newValue
      ? validate(JSON.parse(e.newValue))
      : { version: 1, events: [] };
    blocked = false;
    render();
  } catch {
    blocked = true;
    notify("Saved data could not be read.");
  }
});
let previous = today();
setInterval(() => {
  if (today() !== previous) {
    previous = today();
    render();
  }
}, 30000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) render();
});
render();
