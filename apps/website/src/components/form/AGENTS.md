# Forms

Website forms use TanStack Form through the project-local bindings in `lib/form.ts`.

`useMutationForm` is the default. It binds submission to a `useAPIMutation`-style mutation, disables that call's toast, and maps machine-readable Better Auth or backend codes through a typed `FormErrorConfig<TValues>`. A mapping may target a field or the form. Unmapped failures use generic copy; never render the backend's `.message`.

If form values differ from mutation variables, supply `toVariables`. Its type is required exactly when the value type does not extend the mutation variable type.

Schemas live beside the form and validate on change. Field errors are displayed only after touch and blur. Submit buttons remain enabled for invalid forms so submitting reveals validation, and disable only while a submission is pending.

Each field component composes the matching `@repo/ui` field and input primitives, registers through `createFormHook`, forwards value/change/blur, sets `aria-invalid`, and accepts content props rather than styling props. Add a field component only for a real form.

Build forms with `formOptions({ defaultValues })`, reuse that value through `useTypedAppFormContext` in small file-local field components, wrap the form in `<form.AppForm>`, render one `<FormError />`, and use `<form.SubmitButton />`.

Do not hand-roll backend error paragraphs, disable submission merely because a form is invalid, or configure `disableErrorToast` on the shared mutation hook.
