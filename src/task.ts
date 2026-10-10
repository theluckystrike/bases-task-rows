// Pure task line logic: parse one Markdown checklist line and edit it without touching any other byte.
// A line is kept as head + status + "]" + tail. Every edit changes only the status character or one date
// token, so serialize(parse(line)) === line for any line, with Tasks emoji dates or Dataview fields.

export type DateField = 'due' | 'scheduled' | 'start' | 'done' | 'created' | 'cancelled';
export type DateStyle = 'emoji' | 'dataview';
/** When a tick adds a done date: never, always, or only when the line already carries a date. */
export type DoneDateMode = 'never' | 'always' | 'auto';

export const DATE_FIELDS: readonly DateField[] = ['due', 'scheduled', 'start', 'done', 'created', 'cancelled'];

export interface TaskLine {
	/** Everything before the status character: indent, quote marks, list marker, space and "[". */
	head: string;
	/** The character inside the brackets. */
	status: string;
	/** Everything after "]". */
	tail: string;
}

export interface TaskInfo {
	status: string;
	done: boolean;
	text: string;
	dates: Partial<Record<DateField, string>>;
	priority: number;
	tags: string[];
	recurrence: string | null;
}

/** Priority values, high to low. 2 is a task with no priority, like the Tasks plugin orders them. */
export const PRIORITY_NONE = 2;
const PRIORITY_EMOJI: Record<string, number> = { '🔺': 5, '⏫': 4, '🔼': 3, '🔽': 1, '⏬': 0 };
const PRIORITY_WORD: Record<string, number> = { highest: 5, high: 4, medium: 3, normal: 2, none: 2, low: 1, lowest: 0 };
export const PRIORITY_LABEL: Record<number, string> = { 5: 'Highest', 4: 'High', 3: 'Medium', 2: '', 1: 'Low', 0: 'Lowest' };

const LINE = /^((?:[ \t]*>)*[ \t]*(?:[-*+]|\d{1,9}[.)])[ \t]+\[)([^\]\r\n])\]([^\n]*)$/;
const DATE = String.raw`(\d{4}-\d{2}-\d{2})`;
const VS = '\\uFE0F?';
const EMOJI: Record<DateField, string> = {
	due: '(?:📅|📆|🗓)',
	scheduled: '(?:⏳|⌛)',
	start: '🛫',
	done: '✅',
	created: '➕',
	cancelled: '❌',
};
/** The emoji a new date of each field gets. */
const EMOJI_OUT: Record<DateField, string> = { due: '📅', scheduled: '⏳', start: '🛫', done: '✅', created: '➕', cancelled: '❌' };
/** Dataview field names per date field. The first name is used for new fields. */
const DV_KEYS: Record<DateField, string[]> = {
	due: ['due'],
	scheduled: ['scheduled'],
	start: ['start'],
	done: ['completion', 'done'],
	created: ['created'],
	cancelled: ['cancelled'],
};

const emojiDate = (f: DateField) => new RegExp(`(^|[ \\t])${EMOJI[f]}${VS}[ \\t]*${DATE}`, 'u');
const dvDate = (f: DateField) => new RegExp(`(^|[ \\t])([[(])[ \\t]*(?:${DV_KEYS[f].join('|')})[ \\t]*::[ \\t]*${DATE}[^\\])\\r\\n]*[\\])]`, 'iu');
const EMOJI_RE = Object.fromEntries(DATE_FIELDS.map((f) => [f, emojiDate(f)])) as Record<DateField, RegExp>;
const DV_RE = Object.fromEntries(DATE_FIELDS.map((f) => [f, dvDate(f)])) as Record<DateField, RegExp>;
const ANY_EMOJI_DATE = /(?:📅|📆|🗓|⏳|⌛|🛫|✅|➕|❌)️?[ \t]*\d{4}-\d{2}-\d{2}/u;
const ANY_DV_FIELD = /[[(][ \t]*[\p{L}\p{N}_-]+[ \t]*::/u;
const DV_FIELD_ALL = /(^|[ \t])[[(][ \t]*([\p{L}\p{N}_ -]+?)[ \t]*::[ \t]*([^\])\r\n]*)[\])]/gu;
const PRIORITY_RE = /(^|[ \t])(🔺|⏫|🔼|🔽|⏬)️?(?=[ \t]|$)/u;
const SIGNS = '📅📆🗓⏳⌛🛫✅➕❌🔺⏫🔼🔽⏬🆔⛔🏁🔁';
const RECUR_RE = new RegExp(`(^|[ \\t])🔁${VS}[ \\t]*([^${SIGNS}[(^]*?)(?=[ \\t]+[${SIGNS}[(^#]|[ \\t]*$)`, 'u');
const ID_RE = new RegExp(`(^|[ \\t])(?:🆔|⛔|🏁)${VS}[ \\t]*[^ \\t${SIGNS}]+`, 'gu');
const TAG_RE = /(^|[ \t])#([^\s#,.;:!?()[\]{}"'`|\\^=<>]+)/gu;
const BLOCK_ID = /([ \t]+\^[A-Za-z0-9-]+)[ \t]*$/;
const CODE_SPAN = /`[^`]*`/g;

/** Splits a checklist line. Null when the line is not a task. A trailing "\r" stays in tail. */
export function splitTaskLine(line: string): TaskLine | null {
	const m = LINE.exec(line);
	if (!m) return null;
	return { head: m[1]!, status: m[2]!, tail: m[3]! };
}

export function joinTaskLine(t: TaskLine): string {
	return `${t.head}${t.status}]${t.tail}`;
}

/** x and X are done. "-" (cancelled) counts as closed too, so it never shows as overdue. */
export function isDoneStatus(status: string): boolean {
	return status === 'x' || status === 'X' || status === '-';
}

function findDate(body: string, f: DateField): { value: string; style: DateStyle } | null {
	const e = EMOJI_RE[f].exec(body);
	if (e) return { value: e[2]!, style: 'emoji' };
	const d = DV_RE[f].exec(body);
	if (d) return { value: d[3]!, style: 'dataview' };
	return null;
}

function findPriority(body: string): number {
	const e = PRIORITY_RE.exec(body);
	if (e) return PRIORITY_EMOJI[e[2]!] ?? PRIORITY_NONE;
	for (const m of body.matchAll(DV_FIELD_ALL)) {
		if (m[2]!.trim().toLowerCase() !== 'priority') continue;
		return PRIORITY_WORD[m[3]!.trim().toLowerCase()] ?? PRIORITY_NONE;
	}
	return PRIORITY_NONE;
}

/** Tags in the body, without the "#", in order, no repeats. Pure numbers are not tags (same rule as the app). */
export function findTags(body: string): string[] {
	const out: string[] = [];
	for (const m of body.replace(CODE_SPAN, ' ').matchAll(TAG_RE)) {
		const tag = m[2]!.replace(/\/+$/, '');
		if (!tag || /^\d+$/.test(tag) || out.includes(tag)) continue;
		out.push(tag);
	}
	return out;
}

/** Task text for display: the body without dates, priority, fields, recurrence, ids, tags and block id. */
function displayText(body: string): string {
	let s = body.replace(/\r$/, '').replace(BLOCK_ID, '');
	for (const f of DATE_FIELDS) s = s.replace(new RegExp(EMOJI_RE[f].source, 'gu'), '$1');
	s = s.replace(DV_FIELD_ALL, '$1').replace(new RegExp(PRIORITY_RE.source, 'gu'), '$1').replace(ID_RE, '$1').replace(RECUR_RE, '$1');
	s = s.replace(TAG_RE, (all: string, pre: string, tag: string) => (/^\d+$/.test(tag) ? all : pre));
	return s.replace(/[ \t]+/g, ' ').trim();
}

/** Reads the parts of a task line that the view shows. Null when the line is not a task. */
export function parseTaskLine(line: string): TaskInfo | null {
	const t = splitTaskLine(line);
	if (!t) return null;
	const body = t.tail;
	const dates: Partial<Record<DateField, string>> = {};
	for (const f of DATE_FIELDS) {
		const d = findDate(body, f);
		if (d) dates[f] = d.value;
	}
	const r = RECUR_RE.exec(body);
	return {
		status: t.status,
		done: isDoneStatus(t.status),
		text: displayText(body),
		dates,
		priority: findPriority(body),
		tags: findTags(body),
		recurrence: r ? r[2]!.trim() || null : null,
	};
}

/** The style a new date on this line gets: the line's own style first, then the setting. */
export function styleFor(tail: string, fallback: DateStyle): DateStyle {
	if (ANY_EMOJI_DATE.test(tail)) return 'emoji';
	if (ANY_DV_FIELD.test(tail)) return 'dataview';
	return fallback;
}

/** Sets, changes or removes one date in the text after "]". Only that token changes. */
export function setDateInTail(tail: string, f: DateField, value: string | null, fallback: DateStyle): string {
	if (value !== null && !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`not a YYYY-MM-DD date: ${value}`);
	const e = EMOJI_RE[f].exec(tail);
	const d = e ? null : DV_RE[f].exec(tail);
	const hit = e ?? d;
	if (hit) {
		const start = hit.index + hit[1]!.length;
		const end = hit.index + hit[0].length;
		if (value === null) return tail.slice(0, hit.index) + tail.slice(end);
		const token = tail.slice(start, end);
		const old = e ? e[2]! : d![3]!;
		const at = token.indexOf(old);
		return tail.slice(0, start) + token.slice(0, at) + value + token.slice(at + old.length) + tail.slice(end);
	}
	if (value === null) return tail;
	const style = styleFor(tail, fallback);
	const token = style === 'emoji' ? `${EMOJI_OUT[f]} ${value}` : `[${DV_KEYS[f][0]!}:: ${value}]`;
	const cr = tail.endsWith('\r') ? '\r' : '';
	const body = cr ? tail.slice(0, -1) : tail;
	const block = BLOCK_ID.exec(body);
	const main = block ? body.slice(0, block.index) : body;
	const rest = block ? body.slice(block.index) : '';
	const trimmed = main.replace(/[ \t]+$/, '');
	return `${trimmed} ${token}${main.slice(trimmed.length)}${rest}${cr}`;
}

export type TaskEdit =
	| { type: 'none' }
	| { type: 'done'; today: string; doneDate?: DoneDateMode; style?: DateStyle }
	| { type: 'open'; doneDate?: DoneDateMode }
	| { type: 'date'; field: DateField; value: string | null; style?: DateStyle }
	| { type: 'today'; today: string; style?: DateStyle };

/** The date that puts a task in its date group: due first, then scheduled. */
export function bucketField(info: Pick<TaskInfo, 'dates'>): DateField | null {
	if (info.dates.due) return 'due';
	if (info.dates.scheduled) return 'scheduled';
	return null;
}

/** Applies one edit to one task line. Returns null when the line is not a task. The rest of the line keeps every byte. */
export function editTaskLine(line: string, edit: TaskEdit): string | null {
	const t = splitTaskLine(line);
	if (!t) return null;
	switch (edit.type) {
		case 'none':
			return joinTaskLine(t);
		case 'done': {
			const mode = edit.doneDate ?? 'auto';
			const hadDate = ANY_EMOJI_DATE.test(t.tail) || DV_RE.due.test(t.tail) || DV_RE.scheduled.test(t.tail);
			const add = mode === 'always' || (mode === 'auto' && hadDate);
			const tail = add && !findDate(t.tail, 'done') ? setDateInTail(t.tail, 'done', edit.today, edit.style ?? 'emoji') : t.tail;
			return joinTaskLine({ head: t.head, status: 'x', tail });
		}
		case 'open': {
			const mode = edit.doneDate ?? 'auto';
			const tail = mode === 'never' ? t.tail : setDateInTail(t.tail, 'done', null, 'emoji');
			return joinTaskLine({ head: t.head, status: ' ', tail });
		}
		case 'date':
			return joinTaskLine({ ...t, tail: setDateInTail(t.tail, edit.field, edit.value, edit.style ?? 'emoji') });
		case 'today': {
			const info = parseTaskLine(line);
			const field = (info && bucketField(info)) ?? 'due';
			return joinTaskLine({ ...t, tail: setDateInTail(t.tail, field, edit.today, edit.style ?? 'emoji') });
		}
	}
}

/** One golden-vector step: edit a line, then read it back. */
export function editAndParse(line: string, edit: TaskEdit): { line: string | null; task: TaskInfo | null } {
	const next = editTaskLine(line, edit);
	return { line: next, task: next === null ? null : parseTaskLine(next) };
}
