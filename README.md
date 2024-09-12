# knex-pglite

![NPM Version](https://img.shields.io/npm/v/knex-pglite)

[PGlite](https://pglite.dev/) Dialect for [knex.js](http://knexjs.org)

Since PGlite is single user and only supports a single connection, this library doesn't allow users to configure
the connection pool in the `Knex.Config`.
Internally, the pool is set to `{ min: 1, max: 1 }`, i.e. there is exactly one connection at a time.

## Install

```bash
npm install knex-pglite
```

## Usage

```ts
import { knex } from "knex";
import ClientPgLite from "knex-pglite";

const instance = knex({
  client: ClientPgLite,
  dialect: "postgres",
  // Use an empty object to use an in memory db
  connection: {},
  // OR provide own PGLite instance
  // connection: { pglite: new PGLite() },
  // OR use the filesystem:
  // connection: { filename: 'path/to/my-pgdata' },
  // OR use indexdb:
  // connection: { connectionString: 'idb://my-pgdata' },
});
```

## Acknowledgements

Mostly based on the build-in knex Postgres/Sqlite dialects.

## License

[MIT License](LICENSE)
