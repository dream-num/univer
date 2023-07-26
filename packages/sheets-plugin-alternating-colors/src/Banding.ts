import { Command, CommandManager, SheetContext, Plugin, Worksheet } from '@univerjs/core';

import { IAddBandingActionData, IDeleteBandingActionData, ISetBandingActionData } from './Command';
import { ACTION_NAMES } from './Command/ACTION_NAMES';
import { IBandedRange } from './IBandedRange';

/**
 * Access and modify bandings
 *
 * @remarks
 * The color patterns applied to rows or columns of a range. Each banding consists of a range and a set of colors for rows, columns, headers, and footers.
 *
 * Reference: {@link https://developers.google.com/apps-script/reference/spreadsheet/banding | Google Sheets Banding}
 */
export class Banding {
    protected readonly _bandedRange: IBandedRange;

    protected readonly _plugin: Plugin;

    private _worksheet: Worksheet;

    private _commandManager: CommandManager;

    private _context: SheetContext;

    // private _range: Range;

    constructor(plugin: Plugin, bandedRange: IBandedRange) {
        this._plugin = plugin;
        this._bandedRange = bandedRange;
        this._context = this.getPlugin().getContext();
        this._commandManager = this._context.getCommandManager();
        this._worksheet = this._context.getWorkBook().getActiveSheet()!;
    }

    getPlugin(): Plugin {
        return this._plugin;
    }

    // private _getRowBandingProperties(): IBandingProperties {
    //     const { rowProperties } = this._bandedRange;
    //     return typeof rowProperties.bandingTheme === 'string'
    //         ? BANDING_THEME_COLOR_MAP[rowProperties.bandingTheme]
    //         : rowProperties.bandingTheme;
    // }

    // private _setRowProperties(property: string, color: string): Banding {
    //     const { _context, _commandManager, _bandedRange } = this;
    //     const { bandedRangeId, rangeData } = this._bandedRange;

    //     const rowProperties: IBanding = {
    //         bandingTheme: Object.assign({}, this._getRowBandingProperties(), {
    //             [property]: color,
    //         }),
    //         showHeader: _bandedRange.rowProperties.showHeader,
    //         showFooter: _bandedRange.rowProperties.showFooter,
    //     };

    //     // Organize action data
    //     const actionData: ISetBandingActionData = {
    //         actionName: SHEET_ACTION_NAMES.SET_BANDING_ACTION,
    //         bandedRange: {
    //             bandedRangeId,
    //             rangeData,
    //             rowProperties,
    //         },
    //         sheetId: this._worksheet.getSheetId(),
    //     };

    //     // Execute action
    //     const command = new Command(_context.getWorkBook(), actionData);
    //     _commandManager.invoke(command);

    //     return this;
    // }

    /**
     * get bandedRange
     */
    // getBandedRange(): IBandedRange {
    //     return this._bandedRange;
    // }
    // /**
    //  * set bandedRange
    //  */
    // setBandedRange(bandedRange: IBandedRange): Banding {
    //     this._bandedRange = bandedRange;
    //     return this;
    // }

    /**
     * add banding by setting
     */
    addRowBanding(): Banding {
        const { _context, _commandManager, _bandedRange } = this;

        // Organize action data
        const actionData: IAddBandingActionData = {
            actionName: ACTION_NAMES.ADD_BANDING_ACTION,
            bandedRange: _bandedRange,
            sheetId: this._worksheet.getSheetId(),
        };

        // Execute action
        const command = new Command(_context.getWorkBook(), actionData);
        _commandManager.invoke(command);
        return this;
    }

    /**
     * edit banding by setting
     */
    setRowBanding(bandedRange: IBandedRange): Banding {
        const { _context, _commandManager } = this;

        // Organize action data
        const actionData: ISetBandingActionData = {
            actionName: ACTION_NAMES.SET_BANDING_ACTION,
            bandedRange,
            sheetId: this._worksheet.getSheetId(),
        };

        // Execute action
        const command = new Command(_context.getWorkBook(), actionData);
        _commandManager.invoke(command);

        return this;
    }

    /**
     * Copies this banding to another range.
     * @param range 	The range to copy this banding to.
     * @returns Banding — The new banding.
     */
    // copyTo(range: Range): Nullable<Banding> {
    //     const { bandingTheme, showHeader, showFooter } =
    //         this._bandedRange.rowProperties;

    //     return range.applyRowBanding(bandingTheme, showHeader, showFooter);
    // }

    /**
     * Removes this banding.
     */
    remove(): void {
        const { _context, _commandManager, _bandedRange } = this;
        // Organize action data
        const actionData: IDeleteBandingActionData = {
            sheetId: this._worksheet.getSheetId(),
            actionName: ACTION_NAMES.DELETE_BANDING_ACTION,
            bandedRangeId: _bandedRange.bandedRangeId,
        };

        // Execute action
        const command = new Command(_context.getWorkBook(), actionData);
        _commandManager.invoke(command);
    }

    /**
     * get range instance
     * @returns
     */
    // getRange(): Range {
    //     return this._range;
    // }

    /**
     * 	Sets the range for this banding.
     * @param range The new range for this banding.
     * @returns Banding — This banding, for chaining.
     */
    // setRange(range: Range): Banding {
    //     const { _context, _commandManager } = this;
    //     const { bandedRangeId, rowProperties } = this._bandedRange;

    //     // Organize action data
    //     const actionData: ISetBandingActionData = {
    //         actionName: SHEET_ACTION_NAMES.SET_BANDING_ACTION,
    //         bandedRange: {
    //             bandedRangeId,
    //             rangeData: range.getRangeData(),
    //             rowProperties,
    //         },
    //         sheetId: this._worksheet.getSheetId(),
    //     };

    //     // Execute action
    //     const command = new Command(_context.getWorkBook(), actionData);
    //     _commandManager.invoke(command);

    //     return this;
    // }

    /**
     * Returns the first row color that is alternating or null if no color is set.
     *
     * @returns  String — The color code in CSS notation (such as '#ffffff' or 'white'), or null if no color is set.
     */
    // getFirstRowColor(): string {
    //     return this._getRowBandingProperties().firstBandColor;
    // }

    /**
     * Returns the second row color that is alternating or null if no color is set.
     *
     * @returns  String — The color code in CSS notation (such as '#ffffff' or 'white'), or null if no color is set.
     */
    // getSecondRowColor(): string {
    //     return this._getRowBandingProperties().secondBandColor;
    // }

    /**
     * Returns the color of the header row or null if no color is set.
     *
     * @returns  String — The color code in CSS notation (such as '#ffffff' or 'white'), or null if no color is set.
     */
    // getHeaderRowColor(): string {
    //     return this._getRowBandingProperties().headerColor;
    // }

    /**
     * Returns the color of the last row, or null if no color is set.
     *
     * @returns  String — The color code in CSS notation (such as '#ffffff' or 'white'), or null if no color is set.
     */
    // getFooterRowColor(): string {
    //     return this._getRowBandingProperties().footerColor;
    // }

    /**
     * Sets the first row color that is alternating.
     *
     * @param color The color code in CSS notation (such as '#ffffff' or 'white'), or null to clear the color.
     *
     * @returns Banding — This banding, for chaining.
     */
    // setFirstRowColor(color: string): Banding {
    //     return this._setRowProperties('firstBandColor', color);
    // }

    /**
     * Sets the second row color that is alternating.
     *
     * @param color The color code in CSS notation (such as '#ffffff' or 'white'), or null to clear the color.
     *
     * @returns Banding — This banding, for chaining.
     */
    // setSecondRowColor(color: string): Banding {
    //     return this._setRowProperties('secondBandColor', color);
    // }

    /**
     * Sets the color of the header row.
     *
     * @param color The color code in CSS notation (such as '#ffffff' or 'white'), or null to clear the color.
     *
     * @returns Banding — This banding, for chaining.
     */
    // setHeaderRowColor(color: string): Banding {
    //     return this._setRowProperties('headerColor', color);
    // }

    /**
     * Sets the color of the last row.
     *
     * @param color The color code in CSS notation (such as '#ffffff' or 'white'), or null to clear the color.
     *
     * @returns Banding — This banding, for chaining.
     */
    // setFooterRowColor(color: string): Banding {
    //     return this._setRowProperties('footerColor', color);
    // }
}
