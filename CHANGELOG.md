# bases-task-rows

## 1.1.0

### Minor Changes

- c1af3f3: Tick a recurring task to write the next occurrence on the line below (Pro)

## 1.0.3

### Patch Changes

- efdff8f: Correct the GitHub Sponsors payment, check and token storage text in the README.

## 1.0.2

### Patch Changes

- b09257c: After a plugin update or reload with a base open, the view now runs the new plugin code. Before, Bases kept the old view, so a Pro change did not redraw it until the tab was opened again.

## 1.0.1

### Patch Changes

- facd515: The date for today now comes from the plain JavaScript Date, not from moment. This removes the 3 type warnings that the community directory scanner reported at src/view.ts line 51. The view works as before.
