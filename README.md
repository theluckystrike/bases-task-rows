# Bases Task Rows

Bases Task Rows adds a "Task rows" view to Bases. It shows each checklist task in the notes that a base selects as its own row. A row has the done box, the task text, the due and scheduled dates, the priority, the tags, the source note and the heading above the task. Tick a box in the view and the plugin writes the change to that line of the note.

Core Bases reads note properties, not the lines inside a note. It understands the date format of the Tasks plugin (`📅 2026-10-12`) and Dataview fields (`[due:: 2026-10-12]`), so it works with the notes you already have.

The view, the done box, sorting, filtering and up to 200 tasks per view are free. Pro adds every task past 200, groups, due date editing in the row, and bulk actions. Pro costs $5 a month, or $15 once, through GitHub Sponsors. A total payment of $15 meets the payment requirement for Pro without further payment. Sign-in and the checks below still apply.

## Features

### One row per task

<img src="https://raw.githubusercontent.com/theluckystrike/bases-task-rows/HEAD/docs/task-rows.png" alt="A base with 150 tasks from 30 notes, one row per task, with due date, scheduled date, priority, tags, note and heading" width="720">

The base decides which notes count, with its normal filters, for example "in the folder Projects" or "has the tag #client". The view then lists every `- [ ]` and `- [x]` line in those notes. A task-like line inside a code block does not count, because the app does not treat it as a task.

Select the task text or the note name to open the note at that line.

### Tick a task from the view

<img src="https://raw.githubusercontent.com/theluckystrike/bases-task-rows/HEAD/docs/bases-task-rows.gif" alt="Ticking two tasks in the Task rows view, and the source note shows the x and the done date" width="720">

Tick the box and the plugin changes `[ ]` to `[x]` in the source line. If the line already has a date, it also adds a done date (`✅ 2026-10-10`, or `[completion:: 2026-10-10]` on a Dataview line), the same way the Tasks plugin does. Untick and it goes away.

Before it writes, the plugin checks that the line in the note is still exactly the line it read. If that line changed in the meantime, nothing is written. A notice tells you, and the view reads the note again. All other lines of the note keep every character, including Windows line ends.

### Sort and filter

<img src="https://raw.githubusercontent.com/theluckystrike/bases-task-rows/HEAD/docs/filter.png" alt="The filter box with the word budget, which leaves only the matching tasks" width="720">

The toolbar has a filter box, a Show menu (open tasks, done tasks or all tasks), a Sort menu and a button that reverses the sort. Sort by due date, scheduled date, priority, task text, note name or the order in the notes. Tasks without a date always come last.

The filter box matches words in the task text, tags, note name and heading. The view saves the Show and Sort choices in the base file, one set for each view.

### Tasks emoji and Dataview fields

<img src="https://raw.githubusercontent.com/theluckystrike/bases-task-rows/HEAD/docs/dataview-dates.png" alt="Tasks from meeting notes written with Dataview fields, with their due dates and priorities in the columns" width="720">

The plugin reads these parts of a task line:

- Dates in Tasks format: `📅` due, `⏳` scheduled, `🛫` start, `✅` done, `➕` created, `❌` cancelled.
- The same dates as Dataview fields in square or round brackets: `due`, `scheduled`, `start`, `completion`, `created`, `cancelled`.
- Priority: `🔺 ⏫ 🔼 🔽 ⏬`, or `[priority:: high]`.
- Tags, but not `#123` and not tags in code.

The Task column shows the text without these parts. A new date uses the format the line already has. For a line without dates, the setting "Format of new dates" decides.

### Groups by date, note, heading or tag (Pro)

<img src="https://raw.githubusercontent.com/theluckystrike/bases-task-rows/HEAD/docs/date-groups.png" alt="Open tasks grouped under Overdue, Today, Next 7 days, Later and No date" width="720">

Group by date puts each open task under Overdue, Today, Next 7 days, Later or No date, by its due date, or by its scheduled date when there is no due date. Done tasks go under Done. You can also group by note, by heading, or by tag. A task with two tags shows under both tags.

### Edit due dates, move to today, complete many (Pro)

<img src="https://raw.githubusercontent.com/theluckystrike/bases-task-rows/HEAD/docs/bulk-actions.png" alt="Three selected rows, the Complete selected and Move selected to today buttons, and a date picker open in a due cell" width="720">

With Pro you can:

- Select a due date to change it. Press Enter to save, Escape to cancel. An empty date removes the due date.
- Select the calendar button of a row to move the task to today. This changes the due date, or the scheduled date when the task has no due date. A task with no date gets a due date of today.
- Select rows with the boxes on the left, then select "Complete selected" or "Move selected to today".

## Install

When Bases Task Rows is listed in the community directory, open Settings, then Community plugins, then Browse, and search for "Bases Task Rows". Select Install, then Enable.

To install by hand, download `main.js`, `manifest.json` and `styles.css` from the latest release. Put the three files in `<vault>/.obsidian/plugins/bases-task-rows/`. Reload the list of community plugins, then turn on Bases Task Rows.

The plugin needs Obsidian 1.13.4 or newer with the Bases core plugin on. It was tested on desktop with Obsidian 1.13.4 and 1.14.4.

## Usage

1. Open a folder of notes with tasks and run the command "Create a task base for the current folder". The plugin creates `Tasks.base` in that folder with a Task rows view and opens it.
2. Or open any base, select the view menu, add a view, and choose the layout "Task rows".
3. Change the base filters to choose the notes. Change Show, Sort and the columns in the toolbar or in the view options.
4. For Pro, sponsor on GitHub, then open the settings and select "Sign in with GitHub".

The view updates by itself when a note changes.

## Pro

<img src="https://raw.githubusercontent.com/theluckystrike/bases-task-rows/HEAD/docs/pro-settings.png" alt="The Pro section of the settings after sign in, with the GitHub account and the Pro status" width="720">

To get Pro:

1. Sponsor [theluckystrike on GitHub Sponsors](https://github.com/sponsors/theluckystrike) with $5 a month, or $15 once. A total payment of $15 meets the payment requirement for Pro without further payment. Sign-in and the checks below still apply.
2. In Obsidian, open the settings of Bases Task Rows and select "Sign in with GitHub".
3. The plugin copies a code and opens github.com/login/device. Paste the code there and approve.

If you sponsor after you sign in, select Refresh. A negative sponsorship answer turns Pro off.

## Settings

<img src="https://raw.githubusercontent.com/theluckystrike/bases-task-rows/HEAD/docs/settings.png" alt="Settings with the Pro section, the done date choice and the format of new dates" width="720">

| Setting | Default | Allowed values |
| --- | --- | --- |
| Done date when you tick a task | Auto | Auto, Always, Never |
| Format of new dates | Tasks emoji | Tasks emoji or Dataview field |

Auto adds a done date only to lines that already have a date. Each view also has options in the view menu of the base: Show, Sort by, reverse sort, Group by (Pro), and the Scheduled, Priority, Tags and Heading columns.

## FAQ

### Does it change my notes?

Only when you tick a box or use a Pro action. Then it changes that one line, and in that line only the box or one date. Nothing else in the note changes.

### What about recurring tasks?

The plugin ticks a recurring task like any other task. It does not create the next one. If you use the Tasks plugin for repeats, tick those tasks in the note or in a Tasks query.

### Why does a base with many notes take a moment?

The plugin reads each note with tasks once and keeps the result until the note changes. In our test, 2,000 tasks from 100 notes take less than 300 ms.

### Which statuses count as done?

`x`, `X` and `-` (cancelled). Any other symbol in the box counts as open.

## Payment, account and network

The core features are free. Pro features need a GitHub Sponsors sponsorship of theluckystrike: $5 a month or more, or $15 once. A total payment of $15 meets the payment requirement for Pro without further payment. Sign-in and the checks below still apply. Your notes stay readable and editable with or without Pro.

GitHub handles the payment. Sponsor at https://github.com/sponsors/theluckystrike. You need no account for the free features. Pro needs the GitHub account that sponsors.

Until you select "Sign in with GitHub" in the settings, Bases Task Rows makes no network requests. Sign in uses the GitHub device flow. Bases Task Rows sends its public client ID and the scope `read:user` to `https://github.com/login/device/code` and shows you a code. While you enter the code at https://github.com/login/device, it asks `https://github.com/login/oauth/access_token` every few seconds to check the sign-in status. The scope permits profile reads only. GitHub needs this access to show the sponsorship tier. It grants no repository scope and no write access.

After sign in, Bases Task Rows sends one query to `https://api.github.com/graphql`. It checks if the signed-in account sponsors theluckystrike. It asks for the tier and the total payment to theluckystrike. The plugin reuses a successful check for 7 days. Failed checks can retry after 6 hours. Select Refresh to request an earlier check. It sends no note content, file names or other vault data, and it has no telemetry.

After a successful check, Pro can work offline for up to 14 days. Sign out or a negative sponsorship answer turns Pro off. The plugin stores the GitHub token through the secret storage API of Obsidian. It does not put the token in its saved settings or its local sponsorship data. The local storage of this device keeps your GitHub login, the tier and the time of the last check. Sign out clears the token. You can also revoke the access in your GitHub settings, under Applications.

## Support

Report bugs and feature requests in this repository's issue tracker. Please include your Obsidian version and a sample task line that shows the problem.

To build from source:

```
npm ci
npm run build
npm test
```

The tests check golden cases for reading and changing task lines in both formats. An end-to-end test ticks rows in a real Obsidian and compares the notes byte for byte.

## License

MIT
