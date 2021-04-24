const vscode = require("vscode");
const search = require("./search");

const INPUT_PLACEHOLDER = "Please input your search pattern.";
const EMPTY_PATTERN = "";
const COMMANDS = {
  FIND: "go-to-fuzzy.find",
};

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const disposable = vscode.commands.registerCommand(COMMANDS.FIND, () => {
    return search(EMPTY_PATTERN).then((items) => {
      let quickPick = vscode.window.createQuickPick();

      Object.assign(quickPick, {
        value: EMPTY_PATTERN,
        placeholder: INPUT_PLACEHOLDER,
        items,
      });

      // when the user type into the search input
      // -> launch a new search each time
      quickPick.onDidChangeValue((newPattern) => {
        if (newPattern.length === 0) {
          return;
        }
        search(newPattern).then((items) => {
          quickPick.items = items;
        });
      });

      // when we cycle between the search results,
      // go to the targeted line and select the matching pattern
      quickPick.onDidChangeActive(([item]) => {
        if (!item) {
          return;
        }
        const selection = item.line.matching.selection;
        vscode.window.activeTextEditor.selections = [selection];
        vscode.window.activeTextEditor.revealRange(selection, 2);
      });

      // do nothing when pressing enter on a search result,
      // as we already have selected the line
      quickPick.onDidAccept((e) => quickPick.hide());

      quickPick.show();
    });
  });

  context.subscriptions.push(disposable);
}

function deactivate() {
  // do nothing as we have no cleanup to do
}

module.exports = {
  activate,
  deactivate,
};
