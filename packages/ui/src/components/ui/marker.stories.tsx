import { Clock3Icon } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import { Marker, MarkerContent, MarkerIcon } from "./marker";

const meta = { title: "ui/Marker", component: Marker, tags: ["autodocs"] } satisfies Meta<
    typeof Marker
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
    render: () => (
        <div className="grid w-96 gap-3">
            {(["default", "separator", "border"] as const).map((variant) => (
                <Marker key={variant} variant={variant}>
                    <MarkerIcon>
                        <Clock3Icon />
                    </MarkerIcon>
                    <MarkerContent>Updated 5 minutes ago</MarkerContent>
                </Marker>
            ))}
        </div>
    ),
};
