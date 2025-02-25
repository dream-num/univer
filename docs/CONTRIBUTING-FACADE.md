# How to Contribute to Facade API

Facade API is an API layer of all other packages of Univer and it helps users to use Univer easily. For a detailed introduction of Facade API, please visit [Facade API](https://docs.univer.ai/en-US/guides/sheets/getting-started/facade).

Facade API is consists of multi classes such as `FUniver`, `FWorkbook` and `FRange` etc. You can refer to Google's [AppScripts](https://developers.google.com/apps-script/reference/spreadsheet) to design Facade API.

Please use JSDoc to document your code. For example:

```typescript
export class FWorkbook {
    /**
     * Get the active sheet of the workbook.
     * @returns The active sheet of the workbook
     */
    getActiveSheet(): FWorksheet | null {
        // ...
    }

    /**
     * Create a new worksheet and returns a handle to it.
     * @param name Name of the new sheet
     * @param rows How may rows would the new sheet have
     * @param column How many columns would the new sheet have
     * @returns The new created sheet
     */
    create(name: string, rows: number, column: number): FWorksheet {
        // ...
    }
}
```

## Synchronous API Priority

- For asynchronous APIs, consider the following: Can a synchronous sub-API be extracted, separating logic such as secondary confirmation.
- For APIs that must be asynchronous, indicate this in the method name, such as `addCommentAsync`.

## Chaining Principle

APIs must adhere to the chaining principle:

- APIs with `modify` semantics should return `this`.
- APIs with `create` semantics should return the created instance.
- APIs with `delete` semantics should return `true/false`.

## Easy to Get

All APIs/constants/enums should be accessible from the `univerAPI` variable.

## Documentation

It is strongly suggested to add documentation for your code [here](https://github.com/dream-num/univer.ai/tree/dev/packages/community/src/content/docs/guides/sheet/facade). Please refer to our [documentation repo](https://github.com/dream-num/docs) for more guidance.

