# Post API

Impossibly easy node api framework

## Usage

> npm install @mcrowe/post-api --save

```js
import api from 'post-api'

const controller = {
  hello() {
    return 'ok'
  }
}

api(3000, controller)
```

## Development

Install npm modules:

> npm install

Run tests:

> npm test

## Release

Release a new version:

> bin/release.sh

This will publish a new version to npm, as well as push a new tag up to github.
