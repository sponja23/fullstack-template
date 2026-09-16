import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "./table";

const meta = { title: "ui/Table", component: Table, tags: ["autodocs"] } satisfies Meta<
    typeof Table
>;
export default meta;
type Story = StoryObj<typeof meta>;

const invoices = [
    { number: "INV-1042", client: "Acme Inc.", total: "$4,280", status: "Issued" },
    { number: "INV-1041", client: "Globex", total: "$1,950", status: "Paid" },
];
export const InvoiceList: Story = {
    render: () => (
        <div className="w-[36rem]">
            <Table>
                <TableCaption>Recent invoices</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice.number}>
                            <TableCell className="font-medium">{invoice.number}</TableCell>
                            <TableCell>{invoice.client}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{invoice.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">{invoice.total}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">$6,230</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    ),
};
