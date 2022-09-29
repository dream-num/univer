/**
 * An enumeration of possible special paste types.
 *
 * @remarks
 * Reference: https://developers.google.com/apps-script/reference/spreadsheet/copy-paste-type
 */
export enum CopyPasteType {
    PASTE_NORMAL, // Paste values, formulas, formats and merges.
    PASTE_NO_BORDERS, // Paste values, formulas, formats and merges but without borders.
    PASTE_FORMAT, // Paste the style
    PASTE_FORMULA, // Paste the formulas only.
    PASTE_DATA_VALIDATION, // Paste the data validation only.
    PASTE_VALUES, // Paste the values ONLY without formats, formulas or merges.
    PASTE_CONDITIONAL_FORMATTING, // Paste the color rules only.
    PASTE_COLUMN_WIDTHS, // Paste the column widths only.
}
