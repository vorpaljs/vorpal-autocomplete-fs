# Vorpal - File System Autocompletion

[![Build Status](https://travis-ci.org/vorpaljs/vorpal-autocomplete-fs.svg)](https://travis-ci.org/vorpaljs/vorpal-autocomplete-fs)
[![Coverage Status](https://coveralls.io/repos/vorpaljs/vorpal-autocomplete-fs/badge.svg?branch=master)](https://coveralls.io/r/vorpaljs/vorpal-autocomplete-fs?branch=master)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

An extension to [Vorpal](https://github.com/dthree/vorpal) that provides File System-based tabbed autocompletion for a given command. This is an exact match of the autocomplete functionality provided in Unix commands like `ls` or `cat`.

### Installation

```bash
npm install vorpal-autocomplete-fs
npm install vorpal
```

### Getting Started

```js
const vorpal = require('vorpal')();
const fsAutocomplete = require('vorpal-autocomplete-fs');

vorpal.delimiter('myapp$').show();

vorpal
  .command('cat [dirs...]')
  .autocomplete(fsAutocomplete());
```

```bash
$ node myapp.js
myapp$ cat [tab] [tab]
bin/  myapp.js  package.json  README.md
myapp~$ cat m [tab]
myapp~$ cat myapp.js

```

#### Only show directories

To omit files from the autocomplete and only show directories, pass in the `directory` option:

```js
vorpal
  .command('cat [dirs...]')
  .autocomplete(fsAutocomplete({directory: true}));
```

### License

MIT © [David Caccavella](https://github.com/dthree)

