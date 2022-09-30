/**
 * Auto-fill series
 *
 * @remarks
 * An enumeration of the types of series used to calculate auto-filled values. The manner in which these series affect calculated values differs depending on the type and amount of source data.
 *
 * Reference: {@link https://developers.google.com/apps-script/reference/spreadsheet/auto-fill-series | Google Sheets Enum AutoFillSeries}
 */
export enum AutoFillSeries {
    /**
     * Default. Auto-filling with this setting results in the empty cells in the expanded range being filled with increments of the existing values.
     */
    DEFAULT_SERIES,
    /**
     * Auto-filling with this setting results in the empty cells in the expanded range being filled with copies of the existing values.
     */
    ALTERNATE_SERIES,
}

// TODO 同类型整合
