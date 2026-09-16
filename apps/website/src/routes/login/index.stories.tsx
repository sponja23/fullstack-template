import type { Meta, RouterParameters, StoryObj } from "@storybook/tanstack-react";
import { storyRoute } from "@/routes/-story-route";

const base: RouterParameters<undefined, "/login/"> = {
    route: storyRoute("/login/"),
    path: "/login/",
};
const meta = {
    title: "pages/Login",
    parameters: { layout: "fullscreen", tanstack: { router: base } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = { parameters: { env: { world: "signedOut" } } };
export const Empty: Story = { parameters: { env: { world: "signedOut" } } };
export const Loading: Story = {
    parameters: {
        env: { world: "signedOut" },
        tanstack: {
            router: {
                ...base,
                routeOverrides: { "/login/": { loader: () => new Promise(() => {}) } },
            },
        },
    },
};
export const Error: Story = {
    parameters: {
        env: { world: "signedOut" },
        tanstack: {
            router: {
                ...base,
                routeOverrides: {
                    "/login/": {
                        loader: () => {
                            throw new globalThis.Error("Login unavailable");
                        },
                    },
                },
            },
        },
    },
};
