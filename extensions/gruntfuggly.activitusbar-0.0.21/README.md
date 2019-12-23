# Activitus Bar

One of my work colleagues was complaining about the activity bar wasting too much space, so this simply puts icons on the status bar that open the views of the activity bar. You can then hide the activity bar from the View menu...

## Configuration

The buttons are configurable, using `activitusbar.views`. This is a array containing objects with names, their associated icons and an optional tooltip. By default, all standard views are enabled, i.e. Explorer, Search, SCM, Debug and Extensions. (*See Default Configuration below*).

This extension also rebinds the view selection keys. If you have modified the default key bindings, this may be an issue.

The colour of the active and inactive buttons can also be specified using `activitusbar.activeColour` and `activitusbar.inactiveColour`.

If required, the position of the icons can be adjusted by changing the value of `activitusbar.priority` and `activitusbar.alignment`. The defaults are `99999` and `Left` which should place them at the far left or the status bar. Depending on what other extensions are installed, you may need to experiment to find a value which suits. For example, to move everything to the far right, try `Right` and `-99999`.

Now that custom view containers are available, the configuration has been extended to support this. To add a button for a custom view, you'll need to find the name of the view's container. One way to find it is to inspect the package.json file of the extension that provides the view. Alternatively, go to *Preferences -> Keyboard Shortcuts*, then click the **keybindings.json** link near the top. If you then scroll to the bottom of the opened file, you should find commands for opening views, e.g. `workbench.view.extension.test`. The portion after the last dot is the name of the view. Note: If the command is not shown, it may already be assigned to a key definition, in which case search the file for `workbench.view.extension` to try to locate it.

Once you have the name of the view, choose an icon (see known issues below) from the list of [octicons](https://octicons.github.com/) and add an entry to `activitusbar.views` with the format **"{ "name": "extension.*&lt;view name&gt;*", "octicon": "*&lt;icon-name&gt;*"}**, e.g.

```
{
    "name": "extension.test",
    "octicon": "beaker",
}
```

By default, clicking a button again will toggle the sidebar so that it is not visible. If you want to disable this behaviour, set `activitusbar.toggleSidebar` to false.

One last option is `activitusbar.searchViewInPanel`. If you move the search view to the panel (using the context menu) then set this to true to allow the panel to be toggled instead of the sidebar. *Note: Don't set this to true with the search view in the normal position!*

### Task Buttons

Buttons can also be configured to start tasks. Just use "task.*task-label*". For example, this:
```
{
    "name": "task.build",
    "octicon": "tools",
    "tooltip": "Build project"
}
```
will create a button with the tools icons which starts the "build" task when the button is clicked.

### Settings Button

You can also add a button which opens the settings GUI using
```
{
    "name": "settings",
    "octicon": "gear"
}
```

### Default Configuration

```
"activitusbar.views": [
    {
      "name": "explorer",
      "octicon": "file-text"
    },
    {
      "name": "search",
      "octicon": "search"
    },
    {
      "name": "scm",
      "octicon": "repo-forked"
    },
    {
      "name": "debug",
      "octicon": "bug"
    },
    {
      "name": "extensions",
      "octicon": "package"
    }
  ]
```

## Known Issues

Because there is no way to know when a view has been selected, the currently active view will not stay in sync if the normal activity bar is used.

If **Find in Files** is selected from the Edit Menu, again, the currently active view will become out of sync.

## Installing

You can install the latest version of the extension via the Visual Studio Marketplace [here](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.activitusbar).

Alternatively, open Visual Studio code, press `Ctrl+P` or `Cmd+P` and type:

    > ext install activitusbar

### Source Code

The source code is available on GitHub [here](https://github.com/Gruntfuggly/activitusbar).
