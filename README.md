# VS Code - Restyaboard Viewer

Welcome to Restyaboard Viewer for VS Code! This extension provides the following features:

- Browse Restyaboard boards, lists and cards in the side bar.
- View selected card using the markdown previewer and open to the side.
- See formatted checklists and cover image for the card.
- Saves credentials to use between sessions.

## Authenication

- Activate extension by clicking on the icon in the left Activity Bar.
- Set credentials by clicking the key icon in the left Side Bar or running command "Restyaboard Viewer: Authenticate".
- After entering API key, a new page should open in browser to get an API token.
- Alternatively, use the command "Restyaboard Viewer: Set Credentials" and follow instructions from Restyaboard to manually generate a token.

## Tree View



## Usage

- Restyaboard boards, lists, and cards appears in left Side Bar.
- Clicking a board or list expands or collapses object.
- Clicking a card opens the markdown file as well as the previewer, opening this to the right side (editor column 2 by default).
- Clicking on the 'star' icon to the right of a list assigns this as your "favourite list", shown in the lower part of the side bar.
- Clicking on the icons in the side bar runs various commands, such as setting credentials, removing credentials, showing saved info, and refreshing views.
- Click the 'plus' icon to add a card to the selected list.
- Right click on a card to see options for card, such as assigning a user, editing the title or description, and archive card.

## Restyaboard Card Markdown Preview



## Useful Commands

Main functionality is provided using the VS code interface in the left Side Bar. Running commands to use this extension is optional.

Command | Description
--- | ---
```Restyaboard Viewer: Set Credentials``` | Set user Restyaboard API key and token manually.
```Restyaboard Viewer: Refresh``` | Refresh the main Restyaboard tree view.
```Restyaboard Viewer: Reset Credentials``` | Resets saved credentials.

## Extension Settings

Name of Setting | Default | Description
--- | --- | ---
```restyaboardViewer.starredBoardsOnly``` | ```false``` | Controls whether to display starred boards only or all boards.
```restyaboardViewer.viewColumn``` | ```2``` | Specifies which editor column markdown previewer opens at.

## Advanced

- This extension creates a temporary file named `~vscodeRestyaboard.md` in the user's [VS Code Settings folder](https://code.visualstudio.com/docs/getstarted/settings#_settings-file-locations).
- The markdown file contains parsed content of the Restyaboard card and can be saved locally.
- Hover over any board, list or card to see the Restyaboard ID.
- The setting "markdown.preview.breaks" is automatically set to true to see new lines correctly formatted.
