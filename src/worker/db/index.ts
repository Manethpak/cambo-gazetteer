import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type Bindings = {
  cambo_gazetteer: D1Database;
};

export const getDb = (env: Bindings) => {
  return drizzle(env.cambo_gazetteer, { schema });
};

export const dbClient = (env: Bindings) => {
  return getDb(env);
};
