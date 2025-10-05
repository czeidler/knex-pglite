import Knex from "knex";
import ClientPgLite from "../src/index";
import { describe, it, expect, beforeAll } from "vitest";
import { PGlite } from "@electric-sql/pglite";

describe("Basic tests", () => {
  let db: Knex.Knex;

  beforeAll(() => {
    db = Knex({
      client: ClientPgLite,
      connection: {
        // filename: './test-pg-data'
      },
    });
  });

  it("should run sql operations in the engine", async () => {
    const result = await db.raw("select 1 + 1 as math");
    expect(result).toBeTruthy();
    expect(2).toEqual(result?.rows[0]?.math);
  });

  it("should be able to use schema builder", async () => {
    await db.schema.createTable("todos", (tb) => {
      tb.increments();
      tb.string("description").notNullable();
      tb.boolean("done").notNullable().defaultTo(false);
      tb.timestamps(true, true);
    });

    const [result] = await db("todos")
      .insert({ description: "do the dishes" })
      .returning("*");

    expect(result).toBeTruthy();
    expect(result.id).toBeTruthy();
    expect(result.created_at).toBeTruthy();
    expect(result.updated_at).toBeTruthy();
  });

  it("should be able to use PostgreSQL specific dialect operations", async () => {
    await db.schema.createTable("contacts", (tb) => {
      tb.increments();
      tb.string("name").notNullable();
    });

    await db("contacts").insert([
      { name: "Alice" },
      { name: "Bob" },
      { name: "Caesar" },
      { name: "David" },
      { name: "Edward" },
    ]);

    const result = await db("contacts").whereILike("name", `%c%`);
    expect(result).toBeTruthy();
    expect(2).toEqual(result.length);
    expect(result.map((r) => r.name)).toContain("Caesar");
  });

  it("should be able to pluck() columns", async () => {
    const result = await db("contacts").pluck("id").whereILike("name", `%c%`);
    expect(result).toBeTruthy();
    expect(2).toEqual(result.length);
    expect(result.every((r) => r.name === undefined)).toBe(true);
  });

  it("should be able to call first()", async () => {
    const result = await db("contacts").first().orderBy("name");
    expect(result).toBeTruthy();
    expect(result.name).toBe("Alice");
  });
});

describe("Provide external PGlite instance", () => {
  const pglite = new PGlite();

  beforeAll(async () => {
    const db = Knex({
      client: ClientPgLite,
      connection: () => ({ pglite } as object),
    });
    await db.schema.createTable("contacts", (tb) => {
      tb.increments();
      tb.string("name").notNullable();
    });
    await db("contacts").insert([{ name: "Alice" }]);

    const result = await db("contacts").where("name", "Alice");
    expect(result[0]?.name).toBe("Alice");
  });

  it("should be able to use a provide pglite instance", async () => {
    // reuse same db
    const db = Knex({
      client: ClientPgLite,
      connection: () => ({ pglite } as object),
    });
    const result2 = await db("contacts").where("name", "Alice");
    expect(result2[0]?.name).toBe("Alice");
  });
});
