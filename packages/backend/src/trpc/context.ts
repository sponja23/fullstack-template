import type { Auth } from "../auth/factory.ts";

export interface CreateContextInput {
    headers: Headers;
}

export type AppContext = {
    auth: Auth;
    headers: Headers;
};
