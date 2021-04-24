# Go to Fuzzy

<p align="center">
  <img alt="Extension in action" src="https://github.com/rbaumier/vscode-go-to-fuzzy/blob/master/assets/icon.png?raw=true" width="200">
</p>

## 👓 What

Go-to-Fuzzy is a VSCode extension making fuzzy search/go-to inside a file possible.

<p align="center">
  <img alt="Extension in action" src="https://github.com/rbaumier/vscode-go-to-fuzzy/blob/master/assets/demo.gif?raw=true">
</p>

## ✅ Requirements

- Linux/MacOS
- [The awesome fzf](https://github.com/junegunn/fzf) available

## Installation

[Install from the marketplace!](https://marketplace.visualstudio.com/items?itemName=rbaumier.go-to-fuzzy)

## 🚀 Usage

### Set a keyboard shortcut via:

1. Open **Command Palette** (⌘/Ctrl + Shift + p)
2. Choose **"Preferences: Open Keyboard Shortcuts"**
3. Search for **"go-to-fuzzy.find"**
4. Set a **keybinding**

### Or, if you just want to try

1. Open Command Palette **(⌘/Ctrl + Shift + p)**
2. Choose **"Go to Fuzzy: find"**

## 🤔 Motivations

Without an extension, there is several ways to go to a targeted pattern in the active file, but I find them to be suboptimal:

- **Built-in search**
  - 👎 only show one result at a time, making it painful to cycle through them
  - 👎 no fuzzy: you have to type an exact match (or use a regex for wildcards)
- **Symbols and references**
  - 👍 fuzzy works great
  - 👎 only fetch symbols and references (duh!)
  - 👎 heavily dependent on language integrations
- **Scroll manually:** good enough on small files but can be quite painful with big ones

## ❔ FAQ

### Why do you show the pattern at the beginning of each line? This is annoying!

Yeah, sorry about that. We show it because otherwise VSCode will rearrange the search results by _"what matches the most the provided pattern"_. We remove this behaviour by using the pattern as the result item `label`, which is the only matchable attribute by default.
