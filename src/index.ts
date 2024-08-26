/* eslint-disable @typescript-eslint/no-explicit-any */
import { PGlite } from '@electric-sql/pglite';
import { Knex } from 'knex';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Client_PG = require('knex/lib/dialects/postgres/index.js');
class ClientPGLiteImpl extends Client_PG {
    private pglite;

    constructor(config: Knex.Config) {
        super(config);
        this.pglite = new PGlite(this.config.filename ?? this.config.connectionString);
    }

    _driver() { }

    async _acquireOnlyConnection() {
        const connection = this.pglite;
        await connection.waitReady;
        return connection;
    }

    async setSchemaSearchPath(connection: PGlite, searchPath: string): Promise<boolean> {
        let path = searchPath || this.searchPath;

        if (!path) {
            return true;
        }

        if (!Array.isArray(path) && typeof path !== 'string') {
            throw new TypeError(
                `knex: Expected searchPath to be Array/String, got: ${typeof path}`
            );
        }

        if (typeof path === 'string') {
            if (path.includes(',')) {
                const parts = path.split(',');
                const arraySyntax = `[${parts
                    .map((searchPath) => `'${searchPath}'`)
                    .join(', ')}]`;
                this.logger.warn(
                    `Detected comma in searchPath "${path}".` +
                    `If you are trying to specify multiple schemas, use Array syntax: ${arraySyntax}`
                );
            }
            path = [path];
        }

        path = path.map((schemaName: string) => `"${schemaName}"`).join(',');

        await connection.query(`set search_path to ${path}`);
        return true
    }

    async checkVersion(connection: PGlite) {
        const resp = await connection.query('select version();');
        return this._parseVersion((resp.rows[0] as any).version);
    }

    async _query(connection: PGlite, obj: any) {
        if (!obj.sql) throw new Error('The query is empty');

        const response = await connection.query(obj.sql, obj.bindings, obj.options);
        obj.response = response;
        return obj;
    }

    processResponse(obj: any, runner: any) {
        const response = {
            ...obj.response,
            rowCount: obj.response.affectedRows,
            command: (obj.method as string)?.toUpperCase() ?? '',
        };
        return super.processResponse({ ...obj, response }, runner);
    }

    _stream(connection: PGlite, obj: any, stream: any) {
        return new Promise((resolver, rejecter) => {
            stream.on('error', rejecter);
            stream.on('end', resolver);

            return this
                ._query(connection, obj)
                .then((obj) => obj.response.rows)
                .then((rows) => rows.forEach((row: any) => stream.write(row)))
                .catch((err) => {
                    stream.emit('error', err);
                })
                .then(() => {
                    stream.end();
                });
        });
    }
}

const ClientPGLite = ClientPGLiteImpl as unknown as typeof Knex.Client;
export default ClientPGLite;