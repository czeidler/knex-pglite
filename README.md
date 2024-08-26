# knex-pglite

[PGlite](https://pglite.dev/) Dialect for [knex.js](http://knexjs.org)

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
  useNullAsDefault: true,
  dialect: "postgres",
  // Empty objected to use an in memory db
  connection: {},
  // OR use the filesystem:
  // connection: { filename: 'path/to/my-pgdata' },
  // OR use indexdb:
  // connection: { connectionString: 'idb://my-pgdata' },
});
```

## Acknowledgements

Mostly based on the build knex Postgres dialect.

## License

[MIT License](LICENSE)
