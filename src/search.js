const quote = require("shell-quote").quote;
const exec = require("util").promisify(require("child_process").exec);
const vscode = require("vscode");

/**
 * Find the best matching word against a pattern.
 * To find it, we extract each word of the `content`,
 * and the best matching is the one having the most
 * characters from the pattern
 * @param {String} content
 * @param {String} pattern
 * @returns {String}
 */
function findBestMatchingWord(content, pattern) {
  const patternSet = new Set(pattern.toLowerCase().split(""));
  const lineSplitted = content.toLowerCase().split(/[^A-Za-z0-9_]/);
  const lengthOfMatches = (str) => {
    return str.split("").filter((c) => patternSet.has(c)).length;
  };
  return lineSplitted.sort(
    (a, b) => lengthOfMatches(b) - lengthOfMatches(a)
  )[0];
}

/**
 * Parse the results from our command (stdout),
 * For each line we extract the best matching word
 * and get its selection range
 * @param {String} output
 * @param {String} pattern
 * @returns {Array<Object>}
 */
function parseSearchOutput(output, pattern) {
  const lines = output.trim().split("\n");
  return lines.map((line) => {
    const [lineNumber, lineContent] = line.split("\t");
    const bestMatchingWord = findBestMatchingWord(lineContent, pattern);
    const start = lineContent.toLowerCase().indexOf(bestMatchingWord);
    const end = start + bestMatchingWord.length;
    return {
      number: lineNumber,
      content: lineContent,
      matching: {
        start,
        end,
        selection: new vscode.Selection(
          new vscode.Position(lineNumber - 1, start),
          new vscode.Position(lineNumber - 1, end)
        ),
      },
    };
  });
}

/**
 * Build the command we'll run to get our search results.
 * @param {vscode.TextDocument} activeDocument
 * @param {String} pattern
 * @returns {String} the command to run
 */
function buildCommand(activeDocument, pattern) {
  const isDirty = activeDocument.isDirty;
  const isLocalFile = activeDocument.uri.scheme === "file";
  // if the file was modified or is a not a local file, get the content from vscode
  if (isDirty || !isLocalFile) {
    const editorContent = activeDocument.getText();
    // we need to manually escape the line breaks,
    // otherwise it'll mess with our line numbers in the results
    const c = quote([editorContent]).replaceAll("\\\\n", "\\\\\\n");
    const p = quote([pattern]);
    return `echo ${c} | nl -ba | fzf -f ${p} | head -100`;
  }
  // otherwise, use the file path directly (more performant)
  const path = quote([activeDocument.uri.path]);
  const p = quote([pattern]);
  return `cat ${path} | nl -ba | fzf -f ${p} | head -100`;
}

/**
 * Get the active (focused) vscode document,
 * pattern search it and extract the matches
 * @param {String} pattern
 * @returns {Array<Object>}
 */
function findInDocument(pattern) {
  if (pattern.length === 0) {
    return Promise.resolve([]);
  }
  const activeDocument = vscode.window.activeTextEditor.document;
  const command = buildCommand(activeDocument, pattern);
  return exec(command).then(({ stdout, stderr }) => {
    if (stderr) {
      vscode.window.showErrorMessage(stderr);
      return Promise.resolve();
    }
    if (!stdout) {
      return Promise.resolve();
    }
    return parseSearchOutput(stdout, pattern);
  });
}

/**
 * Perform a search against a document
 * and return the matching lines as vscode quickPick items
 * @param {String} pattern
 * @returns {Array<Object>}
 */
module.exports = function search(pattern) {
  return findInDocument(pattern).then((matchingLines) => {
    return matchingLines.map((line, i) => {
      return {
        // we have to use the pattern as the label,
        // otherwise the vscode quick filter will mess with our search result order
        label: pattern,
        description: `- ${line.number}: ${line.content}`,
        picked: i === 0,
        line,
      };
    });
  });
};
