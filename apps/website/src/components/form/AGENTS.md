# Forms

Forms use TanStack Form through a project-local layer that registers shared fields against form context, binds submission to API mutations, and maps machine-readable error codes to UI-owned copy. Backend error messages are never rendered directly.

## Key files

```text
apps/website/src/
├── lib/form.ts
└── components/form/
    ├── text.field.tsx
    ├── select.field.tsx
    ├── textarea.field.tsx
    ├── submit-button.tsx
    └── form-error.tsx
```

The `Field` layout primitives come from `@repo/ui/field` and have no form-state knowledge. Registered field components compose them.

## `useMutationForm` — the default

Use `useMutationForm` for forms bound to mutations. It calls `mutation.mutateAsync(value, { disableErrorToast: true })`, so the form owns error rendering for that call.

On rejection, it dispatches the machine-readable Better Auth code or tRPC `data.errorCode` through `FormErrorConfig<TValues>`:

- An entry with `field` attaches its message to that field.
- An entry without `field` sets a form-level message rendered by `<FormError />`.
- An unmapped code or non-tRPC error falls back to generic copy.

Callers may provide `onSuccess` and `onFailure`; failure runs after error dispatch.

### `toVariables` — when the fields are not the wire

A form whose fields are shaped for the UI rather than the mutation supplies `toVariables`. Its type is required exactly when `TValues` does not extend `TVariables`, so a mismatch is a type error rather than a silently stripped field. Omit it when the values already are the mutation variables.

## Validation behavior

- Schemas live in the `.form.ts` module beside the hook and validate on change.
- Field errors are touch-and-blur gated: show invalid state only when `meta.isTouched && !meta.isValid`.
- Submit buttons disable only while submitting, not merely while invalid. Submitting an invalid form reveals validation errors.

## Form structure

Each `.form.ts` module exports a `use<X>Form` hook over `useMutationForm` and a `use<X>FormContext` sibling over the same `formOptions`. Keep rendering in a kebab-case `.tsx` component module.

Wrap the form body in `<form.AppForm>` so extracted field components, `<FormError />`, and `<form.SubmitButton />` read the same context. Render exactly one `<FormError />`, normally just above the submit button.

Break out every field into a small file-local component. Each reads the typed form through its `use<X>FormContext` sibling, which keeps field names checked against the shared `formOptions` shape.

## Field components

Every registered field component:

- reads from `useFieldContext<TValue>()`;
- composes `Field`, `FieldLabel`, `FieldContent`, `FieldDescription`, and `FieldError` from `@repo/ui/field`;
- forwards value, change, and blur to the underlying primitive;
- passes `aria-invalid={showInvalid}` to that primitive;
- renders the first error only when touch-and-blur-gated invalid state is active;
- accepts content props such as label, description, placeholder, and options, never styling props.

Some primitives do not emit a real blur. For example, a select must call `field.handleBlur()` from its change handler.

Add a field component only when a real form needs one. Create `{kind}.field.tsx`, compose the matching `@repo/ui` primitive, and register it in `lib/form.ts`'s `createFormHook` call. If the primitive does not exist, add it to `@repo/ui` first.

## Anti-patterns

- Render UI copy selected by `errorConfig`, never a backend `error.message`.
- Set `disableErrorToast` per form submission, never on the shared query-layer mutation hook.
- Keep invalid submit buttons enabled so submission can surface validation.
- Put styling in `@repo/ui` primitives rather than field component props.
- Use `<FormError />` and registered fields instead of hand-rolled error paragraphs.
- Add field types for real consumers rather than speculatively.
- Keep validation in the form-level Zod schema rather than per-field validators.
