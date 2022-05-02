#!/usr/bin/env node

const fs = require('fs');
const { randomUUID } = require('crypto')
const homedir = require('os').homedir();

const args = process.argv;

const fgCyan = "\x1b[36m";
const fgWhite = "\x1b[37m";
const fgBlack = "\x1b[30m";
const bgMatch = "\x1b[106m";
const bgBlack = "\x1b[40m";

const help = () => {
  console.log("usage: micronote tag1 tag2 ... tagn - message/note");
  console.log("Alternatively, if you just run `mn` without arguments will bring up your editor");
  console.log("where you can space seperated tags on the first line and arbitrarily long text from the second linese on");
};

const mnDir = `${homedir}/.config/micronote`;
const defaultConfig = {};
const ensureInit = () => {
  if (!fs.existsSync(mnDir)) {
    fs.mkdirSync(mnDir, { recursive: true });
    fs.writeFileSync(`${mnDir}/notes.json`, '[]');
    fs.writeFileSync(`${mnDir}/config.json`, JSON.stringify(defaultConfig));
  }
};

const readNotes = () => {
  const json = fs.readFileSync(`${mnDir}/notes.json`);
  const notes = JSON.parse(json);
  return notes;
};

const writeNotes = (notes) => {
  fs.writeFileSync(`${mnDir}/notes.json`, JSON.stringify(notes));
};

const tagMatch = (tags, note) => {
  for (const requiredTag of tags) {
    if (!note.tags.includes(requiredTag)) {
      return false;
    }
  }

  return true;
}

const commands = {};

commands.show = commands.s = (tags) => {
  ensureInit();

  const notes = readNotes();
  notes.forEach((note) => {
    if (tagMatch(tags, note)) {
      const noteTags = [];
      note.tags.forEach((noteTag) => {
        if (tags.includes(noteTag)) {
          noteTags.push(`${fgBlack}${bgMatch}${noteTag}${bgBlack}${fgWhite}`);
        } else {
          noteTags.push(`${fgCyan}${noteTag}${fgWhite}`);
        }
      });
      const id = note.id.split("-")[0];
      console.log(`${id} | ${noteTags.join(' ')}: ${note.note}`);
    }
  });
};

commands.remove = commands.rm = (ids) => {
  const notes = readNotes();
  const newNotes = [];
  for (let note of notes) {
    for (let id of ids) {
      if (note.id.match(new RegExp(`^${id}`))) {
        console.log(`deleting note: ${note.id} | ${note.tags.join(' ')}: ${note.note}`);
      } else {
        newNotes.push(note);
      }
    }
  }

  writeNotes(newNotes);
}

commands.nuke = (args) => {
  if (args[0] === '--confirm') {
    writeNotes([]);
  } else {
    console.log("Are you sure you want to delete all existing notes? If so, run with `micronote nuke --confirm`");
  }
};

const newNote = (tags, note) => {
  ensureInit();
  const notes = readNotes();
  notes.push({id: randomUUID(), tags, note});
  writeNotes(notes);
};

if (args[2] === '--help') {
  help();
  process.exit(0);
} else if (commands[args[2]]) {
  commands[args[2]](args.slice(3, args.length));
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
