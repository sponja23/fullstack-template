import type { Meta, RouterParameters, StoryObj } from "@storybook/tanstack-react";
import { storyRoute } from "@/routes/-story-route";

const base: RouterParameters<undefined, "/signup/"> = {
    route: storyRoute("/signup/"),
    path: "/signup/",
};
const meta = {
    title: "pages/Signup",
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
                routeOverrides: { "/signup/": { loader: () => new Promise(() => {}) } },
            } as typeof base,
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
                    "/signup/": {
                        loader: () => {
                            throw new globalThis.Error("Signup unavailable");
                        },
                    },
                },
            } as typeof base,
        },
    },
};
