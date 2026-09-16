import type { Meta, StoryObj } from "@storybook/react";
import {
    Questionnaire,
    QuestionnaireActions,
    QuestionnaireChoice,
    QuestionnaireChoiceDescription,
    QuestionnaireChoices,
    QuestionnaireDescription,
    QuestionnaireItem,
    QuestionnaireNext,
    QuestionnairePrevious,
    QuestionnaireProgress,
    QuestionnaireSubmit,
    QuestionnaireTitle,
} from "./questionnaire";

const items = [
    {
        name: "terms",
        required: true,
        choices: [{ value: "receipt" }, { value: "15" }, { value: "30" }],
    },
    { name: "reminders", choices: [{ value: "yes" }, { value: "no" }] },
];
const meta = {
    title: "ui/Questionnaire",
    component: Questionnaire,
    tags: ["autodocs"],
    args: { items },
} satisfies Meta<typeof Questionnaire>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Setup: Story = {
    render: () => (
        <Questionnaire items={items} defaultItem="terms" className="w-[28rem]">
            <QuestionnaireProgress>Step 1 of 2</QuestionnaireProgress>
            <QuestionnaireItem name="terms" required>
                <QuestionnaireTitle>What are your default payment terms?</QuestionnaireTitle>
                <QuestionnaireDescription>
                    You can override this on each invoice.
                </QuestionnaireDescription>
                <QuestionnaireChoices>
                    <QuestionnaireChoice value="receipt">
                        Due on receipt
                        <QuestionnaireChoiceDescription>
                            Best for one-off work.
                        </QuestionnaireChoiceDescription>
                    </QuestionnaireChoice>
                    <QuestionnaireChoice value="15">Net 15</QuestionnaireChoice>
                    <QuestionnaireChoice value="30" defaultChecked>
                        Net 30
                    </QuestionnaireChoice>
                </QuestionnaireChoices>
            </QuestionnaireItem>
            <QuestionnaireItem name="reminders">
                <QuestionnaireTitle>Send automatic reminders?</QuestionnaireTitle>
                <QuestionnaireChoices>
                    <QuestionnaireChoice value="yes">Yes</QuestionnaireChoice>
                    <QuestionnaireChoice value="no">No</QuestionnaireChoice>
                </QuestionnaireChoices>
            </QuestionnaireItem>
            <QuestionnaireActions>
                <QuestionnairePrevious />
                <QuestionnaireNext />
                <QuestionnaireSubmit />
            </QuestionnaireActions>
        </Questionnaire>
    ),
};
