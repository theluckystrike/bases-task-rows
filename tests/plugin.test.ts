import { describe, expect, it } from 'vitest';
import { App } from 'obsidian-test-mocks/obsidian';
import BasesTaskRowsPlugin, { taskBaseText } from '../src/main';
import { isPro } from '../src/pro';
import { collectTasks } from '../src/rows';
import { DEFAULT_SETTINGS, normalizeSettings } from '../src/settings';
import manifest from '../manifest.json';

const NOTE = '# Plan\n- [ ] Pay rent 📅 2026-10-12 #home\n- [ ] Call Ana\n';

async function makePlugin(files: Record<string, string> = { 'Plan.md': NOTE }) {
	const app = App.createConfigured__({ files });
	const plugin = new BasesTaskRowsPlugin(app as never, manifest as never);
	await plugin.onload();
	return { app, plugin };
}

const rowsOf = (content: string) => collectTasks('Plan.md', 'Plan', content, [{ line: 1, task: ' ' }, { line: 2, task: ' ' }], []);

describe('BasesTaskRowsPlugin', () => {
	it('loads default settings and registers the Task rows view', async () => {
		const { plugin } = await makePlugin();
		expect(plugin.settings).toEqual(DEFAULT_SETTINGS);
		expect([...(plugin as unknown as { basesViewRegistrations__: Map<string, { name: string }> }).basesViewRegistrations__.keys()]).toEqual(['task-rows']);
		expect(plugin.isPro()).toBe(false);
		expect(isPro()).toBe(false);
	});

	it('repairs bad saved settings', () => {
		expect(normalizeSettings({ dateStyle: 5, doneDate: 'sometimes' })).toEqual(DEFAULT_SETTINGS);
		expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
		expect(normalizeSettings({ dateStyle: 'dataview', doneDate: 'never' })).toEqual({ dateStyle: 'dataview', doneDate: 'never' });
	});

	it('ticks a task in the file and adds the done date to a dated line', async () => {
		const { app, plugin } = await makePlugin();
		const out = await plugin.editRows(rowsOf(NOTE).slice(0, 1), { type: 'done', today: '2026-10-10' });
		expect(out).toEqual({ written: 1, conflicts: 0 });
		const file = app.vault.getFileByPath('Plan.md')!;
		expect(await app.vault.read(file)).toBe('# Plan\n- [x] Pay rent 📅 2026-10-12 #home ✅ 2026-10-10\n- [ ] Call Ana\n');
	});

	it('writes nothing when the line changed after the view read it', async () => {
		const { app, plugin } = await makePlugin();
		const stale = rowsOf(NOTE);
		const file = app.vault.getFileByPath('Plan.md')!;
		await app.vault.modify(file, NOTE.replace('Call Ana', 'Call Ana today'));
		const out = await plugin.editRows(stale, { type: 'done', today: '2026-10-10' });
		expect(out).toEqual({ written: 1, conflicts: 1 });
		expect(await app.vault.read(file)).toBe('# Plan\n- [x] Pay rent 📅 2026-10-12 #home ✅ 2026-10-10\n- [ ] Call Ana today\n');
	});

	it('uses the Dataview style for a new date when the setting says so', async () => {
		const { app, plugin } = await makePlugin();
		plugin.settings = { ...plugin.settings, dateStyle: 'dataview' };
		await plugin.editRows(rowsOf(NOTE).slice(1), { type: 'today', today: '2026-10-10' });
		expect(await app.vault.read(app.vault.getFileByPath('Plan.md')!)).toBe('# Plan\n- [ ] Pay rent 📅 2026-10-12 #home\n- [ ] Call Ana [due:: 2026-10-10]\n');
	});

	it('writes a base file text with a folder filter and the task view', () => {
		expect(taskBaseText('Projects')).toBe('filters:\n  and:\n    - file.inFolder("Projects")\nviews:\n  - type: task-rows\n    name: Tasks\n    status: open\n    sort: due\n');
		expect(taskBaseText('/')).not.toContain('filters');
	});
});
