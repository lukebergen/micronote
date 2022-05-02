#!/usr/bin/env node

const fs = require('fs');
const homedir = require('os').homedir();
const args = process.argv;
const help = () => {
  console.log("usage: micronote tag1 tag2 ... tagn - message/note");
  console.log("Alternatively, if you just run `mn` without arguments will bring up your editor");
  console.log("where you can space seperated tags on the first line and arbitrarily long text from the second linese on");
};
const mnDir = `${homedir}/.config/micronote`;
const ensureInit = () => {
  if (!fs.existsSync(mnDir)) {
    fs.mkdirSync(mnDir, { recursive: true });
    fs.writefileFileSync(`${mnDir}/notes.json`, '[]');
    fs.writefileFileSync(`${mnDir}/config.json`, '{}');
  }
};
const readNotes = () => {
  const json = fs.readFileSync(`${mnDir}/notes.json`);
  const notes = JSON.parse(json);
  return notes;
};
const filter = (tags, notes) => {
}
const show = (tags) => {
  ensureInit();
  console.log("searching with tags: ", tags);
};
const newNote = (tags, note) => {
  ensureInit();
  console.log("taking new note with tags/note: ", tags, note);
};
if (args[2] === '--help') {
  help();
  process.exit(0);
} else if (args[2] === 'show') {
  const tags = args.slice(3, args.length);
  show(tags);
} else {
  const tagEndIndex = args.indexOf("-");
  if (tagEndIndex === -1) {
    help();
    process.exit(1);
  }
  const tags = args.slice(2, tagEndIndex);
  const noteBits = args.slice(tagEndIndex + 1, args.length);
  const note = noteBits.join(" ");
  newNote(tags, note);
};
