import { Worksheet } from './index';
import { SheetContext } from '../../Basics';
import { Command, CommandManager } from '../../Command';
import { ACTION_NAMES } from '../../Types/Const';
import {
    BooleanNumber,
    HorizontalAlign,
    VerticalAlign,
    WrapStrategy,
} from '../../Types/Enum';
import {
    ICellData,
    ICellV,
    IOptionData,
    IRangeData,
    IRangeType,
    IStyleData,
    ITextDecoration,
} from '../../Types/Interfaces';
import { Workbook } from './Workbook';
import { Nullable, ObjectMatrix, Tools, Tuples } from '../../Shared';
import {
    ClearRangeAction,
    IClearRangeActionData,
    ISetRangeDataActionData,
    ISetRangeFormattedValueActionData,
    ISetRangeStyleActionData,
    SetRangeDataAction,
    SetRangeStyleAction,
} from '../Action';

/**
 * A collection of one or more Range instances in the same sheet.
 *
 * @remarks
 * You can use this class to apply operations on collections of non-adjacent ranges or cells.
 *
 * Reference from: https://developers.google.com/apps-script/reference/spreadsheet/range-list
 *
 */
export class RangeList {
    private _rangeListId: string;

    private _commandManager: CommandManager;

    private _workbook: Workbook;

    private _context: SheetContext;

    private _worksheet: Worksheet;

    private _rangeList: IRangeData[];

    constructor(worksheet: Worksheet, rangeList: IRangeType[]) {
        this._context = worksheet.getContext();
        this._workbook = this._context.getWorkBook();
        this._commandManager = this._context.getCommandManager();
        this._worksheet = worksheet;
        this._rangeList = [];

        // Convert the rangeList passed in by the user into a standard format
        rangeList.forEach((range: IRangeType) => {
            // this._rangeList.push(
            //     new TransformTool(this._workbook).transformRangeType(range)
            // );
            this._rangeList.push(
                this._context.getWorkBook().transformRangeType(range).rangeData
            );
        });

        // The user entered an invalid range
        if (this._rangeList[0].startRow === -1) {
            console.error('Invalid range,default set startRow -1');
        }
    }

    getRangeList(): IRangeData[] {
        return this._rangeList;
    }

    /**
     * Selects the list of Range instances.
     *
     * @returns The list of active ranges, for chaining.
     */
    activate(): RangeList {
        const { _commandManager } = this;
        // The user entered an invalid range
        if (this._rangeList[0].startRow === -1) {
            console.error('Invalid range,default set startRow -1');
            return this;
        }

        this._worksheet.getSelection().setSelection({ selection: this._rangeList });

        return this;
    }

    /**
     * Break all horizontally- or vertically-merged cells contained within the range list into individual cells again.
     */
    // TODO
    // breakApart() {}

    /**
     * Sets the value for each Range in the range list. The value can be numeric, string, boolean or date. If it begins with '=' it is interpreted as a formula.
     *
     * @param value  The value for the range list.
     * @returns This range list, for chaining.
     */
    setValue(value: string | number | boolean): RangeList {
        let { _rangeList, _context, _commandManager, _worksheet } = this;

        // collect action list
        const setList = _rangeList.map((range) => {
            let { startRow, startColumn, endRow, endColumn } = range;
            let cellValue = new ObjectMatrix<ICellData>();
            for (let r = startRow; r <= endRow; r++) {
                for (let c = startColumn; c <= endColumn; c++) {
                    cellValue.setValue(startRow, startColumn, {
                        m: `${value}`,
                        v: value,
                    });
                }
            }

            let setValue: ISetRangeDataActionData = {
                sheetId: _worksheet.getSheetId(),
                actionName: SetRangeDataAction.NAME,
                cellValue: cellValue.getData(),
            };
            return setValue;
        });

        let command = new Command(
            {
                WorkBookUnit: this._currentUniverSheet.getCurrentUniverSheetInstance().getWorkBook(),
            },
            ...setList
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Clears the range of contents, formats, and data validation rules for each Range in the range list.
     *
     * @returns This range list, for chaining.
     */
    clear(): RangeList;

    /**
     * Clears the range of contents and format, as specified with the given options. By default all data is cleared.
     *
     * @param options 	A JavaScript object that specifies advanced parameters, as listed IOptionData.
     * @returns  This range list, for chaining.
     */
    clear(options: IOptionData): RangeList;
    clear(...argument: any): RangeList {
        const { _worksheet, _commandManager, _rangeList } = this;

        // default options
        let options = {
            formatOnly: true,
            contentsOnly: true,
        };
        if (Tuples.checkup(argument, Tuples.OBJECT_TYPE)) {
            options = argument[0];
        }

        // collect action list
        const clearList = _rangeList.map((range) => {
            let clearRange: IClearRangeActionData = {
                sheetId: _worksheet.getSheetId(),
                actionName: ClearRangeAction.NAME,
                options,
                rangeData: range,
            };
            return clearRange;
        });

        let command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            ...clearList
        );
        _commandManager.invoke(command);

        return this;
    }

    /**
     * Clears text formatting for each Range in the range list.
     *
     * This clears text formatting for each range, but does not reset any number formatting rules.
     * @returns  This range list, for chaining.
     */
    clearFormat(): RangeList {
        return this.clear({ formatOnly: true });
    }

    /**
     * Clears the content of each Range in the range list, leaving the formatting intact.
     *
     * @returns  This range list, for chaining.
     */
    clearContent(): RangeList {
        return this.clear({ contentsOnly: true });
    }

    /**
     * Sets the background color for each Range in the range list.
     *
     * @param color  The background color code in CSS notation such as '#ffffff' or 'white'; a null value resets the color.
     * @returns This range list, for chaining.
     */
    setBackground(color: Nullable<string>): RangeList {
        let { _rangeList, _context, _commandManager, _worksheet } = this;

        const setList = _rangeList.map((range) => {
            let { startRow, startColumn, endRow, endColumn } = range;

            // string converted to a two-dimensional array
            const styleObj = {
                bg: {
                    rgb: color,
                },
            };

            const stylesMatrix = Tools.fillObjectMatrix(
                endRow - startRow + 1,
                endColumn - startColumn + 1,
                styleObj
            );

            const setStyle: ISetRangeStyleActionData = {
                sheetId: _worksheet.getSheetId(),
                actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
                value: stylesMatrix,
                rangeData: range,
            };

            return setStyle;
        });

        let command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            ...setList
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Sets the background to the given RGB color.
     *
     * @param red  	The red value in RGB notation.
     * @param green  The green value in RGB notation.
     * @param blue  The blue value in RGB notation.
     * @returns This range list, for chaining.
     */
    setBackgroundRGB(red: number, green: number, blue: number): RangeList {
        const rgbString = `RGB(${red},${green},${blue})`;

        let { _rangeList, _context, _commandManager, _worksheet } = this;
        const setList = _rangeList.map((range) => {
            let { startRow, startColumn, endRow, endColumn } = range;

            // string converted to a two-dimensional array
            const styleObj = {
                bg: {
                    rgb: rgbString,
                },
            };

            const stylesMatrix = Tools.fillObjectMatrix(
                endRow - startRow + 1,
                endColumn - startColumn + 1,
                styleObj
            );

            const setStyle: ISetRangeStyleActionData = {
                sheetId: _worksheet.getSheetId(),
                actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
                value: stylesMatrix,
                rangeData: range,
            };

            return setStyle;
        });

        let command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            ...setList
        );
        _commandManager.invoke(command);
        return this;
    }

    // TODO
    // setBorder(top, left, bottom, right, vertical, horizontal) {}
    // setBorder(top, left, bottom, right, vertical, horizontal, color, style) {}

    /**
     * Sets the font color for each Range in the range list. Color is represented in in CSS notation;
     *
     * @param color  The font color in CSS notation such as '#ffffff' or 'white'; a null value resets the color.
     * @returns This range list, for chaining.
     */
    setFontColor(color: Nullable<string>): RangeList {
        let { _rangeList, _context, _commandManager, _worksheet } = this;

        const setList = _rangeList.map((range) => {
            let { startRow, startColumn, endRow, endColumn } = range;

            // string converted to a two-dimensional array
            const styleObj = {
                cl: {
                    rgb: color,
                },
            };

            const stylesMatrix = Tools.fillObjectMatrix(
                endRow - startRow + 1,
                endColumn - startColumn + 1,
                styleObj
            );

            const setStyle: ISetRangeStyleActionData = {
                sheetId: _worksheet.getSheetId(),
                actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
                value: stylesMatrix,
                rangeData: range,
            };

            return setStyle;
        });

        let command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            ...setList
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Sets the font family for each Range in the range list.
     *
     * @param fontFamily  The font family to set; a null value resets the font family.
     * @returns This range list, for chaining.
     */
    setFontFamily(fontFamily: Nullable<string>): RangeList {
        return this._setStyle(fontFamily, 'ff');
    }
    // setFontLine(fontLine) {}

    /**
     * Sets the underline for each Range in the range list.
     *
     * @param fontLine  The underline to set; a null value resets the underline.
     * @returns This range list, for chaining.
     */
    setUnderline(fontLine: Nullable<boolean | BooleanNumber>): RangeList {
        const textDecoration: ITextDecoration = {
            s: fontLine ? BooleanNumber.TRUE : BooleanNumber.FALSE,
        };
        return this._setStyle(textDecoration, 'ul');
    }

    /**
     * Sets the Overline for each Range in the range list.
     *
     * @param fontLine  The Overline to set; a null value resets the Overline.
     * @returns This range list, for chaining.
     */
    setOverline(fontLine: Nullable<boolean | BooleanNumber>): RangeList {
        const textDecoration: ITextDecoration = {
            s: fontLine ? BooleanNumber.TRUE : BooleanNumber.FALSE,
        };
        return this._setStyle(textDecoration, 'ol');
    }

    /**
     * Sets the StrikeThrough for each Range in the range list.
     *
     * @param fontLine  The StrikeThrough to set; a null value resets the StrikeThrough.
     * @returns This range list, for chaining.
     */
    setStrikeThrough(fontLine: Nullable<boolean | BooleanNumber>): RangeList {
        const textDecoration: ITextDecoration = {
            s: fontLine ? BooleanNumber.TRUE : BooleanNumber.FALSE,
        };
        return this._setStyle(textDecoration, 'st');
    }

    /**
     * Sets the font size (in points) for each Range in the range list.
     *
     * @param size A font point size.
     * @returns This range list, for chaining.
     */
    setFontSize(size: Nullable<number>): RangeList {
        return this._setStyle(size, 'fs');
    }

    /**
     * Set the font style for each Range in the range list
     *
     * @param fontStyle  The font style, either 'italic' or 'normal'; a null value resets the font style.
     * @returns This range list, for chaining.
     */
    setFontStyle(fontStyle: Nullable<boolean | BooleanNumber>): RangeList {
        const fontBoolean = fontStyle ? BooleanNumber.TRUE : BooleanNumber.FALSE;
        return this._setStyle(fontBoolean, 'it');
    }

    /**
     * Set the font style for each Range in the range list.
     *
     * @param fontWeight The font weight, either 'bold' or 'normal'; a null value resets the font weight.
     * @returns This range list, for chaining.
     */
    setFontWeight(fontWeight: Nullable<boolean | BooleanNumber>): RangeList {
        const fontBoolean = fontWeight ? BooleanNumber.TRUE : BooleanNumber.FALSE;
        return this._setStyle(fontBoolean, 'bl');
    }

    /**
     * Set the horizontal alignment for each Range in the range list.
     *
     * @param alignment The alignment, either 'left', 'center' or 'right'; a null value resets the alignment.
     * @returns This range list, for chaining.
     */
    setHorizontalAlignment(alignment: Nullable<HorizontalAlign>): RangeList {
        return this._setStyle(alignment, 'ht');
    }

    /**
     * Sets the note text for each Range in the range list.
     *
     * @param note 	The note text to set; a null value removes the note.
     * @returns This range list, for chaining.
     */
    // setNote(note: Nullable<string>): RangeList {
    //     let { _rangeList, _context, _commandManager, _worksheet } = this;

    //     const setList = _rangeList.map((range) => {
    //         let { startRow, startColumn, endRow, endColumn } = range;

    //         let cellValue = new ObjectMatrix<string>();
    //         for (let r = startRow; r <= endRow; r++) {
    //             for (let c = startColumn; c <= endColumn; c++) {
    //                 cellValue.setValue(r, c, note);
    //             }
    //         }

    //         let setValue: ISetRangeNoteActionData = {
    //             sheetId: _worksheet.getSheetId(),
    //             actionName: ACTION_NAMES.SET_RANGE_NOTE_ACTION,
    //             cellNote: cellValue.getData(),
    //             rangeData: range,
    //         };

    //         return setValue;
    //     });

    //     let command = new Command(_context.getWorkBook(), ...setList);
    //     _commandManager.invoke(command);
    //     return this;
    // }

    /**
     * Sets the note text for each Range in the range list.
     *
     * @param numberFormat A number format string.
     * @returns This range list, for chaining.
     */
    // setNumberFormat(numberFormat: string): RangeList {
    //     let { _rangeList, _context, _commandManager, _worksheet } = this;

    //     const setList = _rangeList.map((range) => {
    //         let { startRow, startColumn, endRow, endColumn } = range;

    //         let cellValue = new ObjectMatrix<string>();
    //         for (let r = 0; r <= endRow - startRow; r++) {
    //             for (let c = 0; c <= endColumn - startColumn; c++) {
    //                 const fm = {
    //                     f: numberFormat,
    //                     t: FormatType.NUMBER,
    //                 };
    //                 cellValue.setValue(r + startRow, c + startColumn, JSON.stringify(fm));
    //             }
    //         }

    //         let setValue: ISetRangeFormatActionData = {
    //             sheetId: _worksheet.getSheetId(),
    //             actionName: ACTION_NAMES.SET_RANGE_FORMAT_ACTION,
    //             cellFormat: cellValue.getData(),
    //             rangeData: range,
    //         };

    //         return setValue;
    //     });

    //     let command = new Command(_context.getWorkBook(), ...setList);
    //     _commandManager.invoke(command);
    //     return this;
    // }

    /**
     * Sets the note text for each Range in the range list.
     */
    // TODO
    // setShowHyperlink(showHyperlink) {}

    /**
     * Sets the text direction for the cells in each Range in the range list.
     *
     * @param direction The desired text direction; if null the direction is inferred before setting.
     * @returns This range list, for chaining.
     */
    setTextDirection(direction: Nullable<number>): RangeList {
        return this._setStyle(direction, 'td');
    }

    /**
     * Sets the text rotation settings for the cells in each Range in the range list.
     *
     * @param degrees The desired angle between the standard orientation and the desired orientation. For left to right text, positive angles are in the counterclockwise direction.
     * @returns This range list, for chaining.
     */
    setTextRotation(degrees: number): RangeList {
        let { _rangeList, _context, _commandManager, _worksheet } = this;

        const setList = _rangeList.map((range) => {
            let { startRow, startColumn, endRow, endColumn } = range;

            const styleObj = {
                tr: {
                    v: 0,
                    a: Number(degrees),
                },
            };

            const stylesMatrix = Tools.fillObjectMatrix(
                endRow - startRow + 1,
                endColumn - startColumn + 1,
                styleObj
            );

            const setStyle: ISetRangeStyleActionData = {
                sheetId: _worksheet.getSheetId(),
                actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
                value: stylesMatrix,
                rangeData: range,
            };

            return setStyle;
        });

        let command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            ...setList
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Set the vertical alignment for each Range in the range list.
     *
     * @param alignment The alignment, either 'top', 'middle' or 'bottom'; a null value resets the alignment.
     * @returns This range list, for chaining.
     */
    setVerticalAlignment(alignment: Nullable<VerticalAlign>): RangeList {
        this._setStyle(alignment, 'vt');
        return this;
    }

    /**
     * Sets whether or not to stack the text for the cells for each Range in the range list.
     *
     * @param isVertical  Whether or not to stack the text.
     * @returns This range list, for chaining.
     */
    setVerticalText(isVertical: BooleanNumber): RangeList {
        let { _rangeList, _context, _commandManager, _worksheet } = this;

        const setList = _rangeList.map((range) => {
            let { startRow, startColumn, endRow, endColumn } = range;

            const styleObj = {
                tr: {
                    v: isVertical,
                    a: 0,
                },
            };

            const stylesMatrix = Tools.fillObjectMatrix(
                endRow - startRow + 1,
                endColumn - startColumn + 1,
                styleObj
            );

            const setStyle: ISetRangeStyleActionData = {
                sheetId: _worksheet.getSheetId(),
                actionName: ACTION_NAMES.SET_RANGE_STYLE_ACTION,
                value: stylesMatrix,
                rangeData: range,
            };

            return setStyle;
        });

        let command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            ...setList
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * Set text wrapping for each Range in the range list.
     *
     * @param isWrapEnabled  Whether to wrap text or not.
     * @returns This range list, for chaining.
     */
    setWrap(isWrapEnabled: BooleanNumber): RangeList {
        return this._setStyle(isWrapEnabled, 'tb');
    }

    /**
     * Sets the text wrapping strategy for each Range in the range list.
     *
     * @param strategy 	The desired wrapping strategy.
     * @returns This range list, for chaining.
     */
    setWrapStrategy(strategy: WrapStrategy): RangeList {
        return this._setStyle(strategy, 'tb');
    }

    /**
     * Trims the whitespace (such as spaces, tabs, or new lines) in every cell in this range list.
     *
     * @returns This range list, for chaining.
     */
    trimWhitespace(): RangeList {
        let { _rangeList, _context, _commandManager, _worksheet } = this;

        const setList = _rangeList.map((range) => {
            let { startRow, startColumn, endRow, endColumn } = range;

            const sheetMatrix = this._worksheet.getCellMatrix();
            const regx = /\s+/g;
            let cellValue = new ObjectMatrix<ICellV>();
            for (let r = startRow; r < endRow + 1; r++) {
                for (let c = startColumn; c < endColumn + 1; c++) {
                    let m = sheetMatrix.getValue(r, c)!.m!;
                    const value = m.replace(regx, '');
                    cellValue.setValue(r, c, value || '');
                }
            }

            let setValue: ISetRangeFormattedValueActionData = {
                sheetId: _worksheet.getSheetId(),
                actionName: ACTION_NAMES.SET_RANGE_FORMATTED_VALUE_ACTION,
                cellValue: cellValue.getData(),
                rangeData: range,
            };

            return setValue;
        });

        let command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            ...setList
        );
        _commandManager.invoke(command);
        return this;
    }

    /**
     * set style
     *
     * @param value style value
     * @param type style type
     * @returns  This range list, for chaining.
     * @internal @preapproved
     */
    private _setStyle(
        value: Nullable<number | string | ITextDecoration | BooleanNumber>,
        type: string
    ) {
        let { _rangeList, _context, _commandManager, _worksheet } = this;

        const setList = _rangeList.map((range) => {
            let { startRow, startColumn, endRow, endColumn } = range;

            // string converted to a two-dimensional array
            const styleObj: IStyleData = { [type]: value };

            const stylesMatrix = Tools.fillObjectMatrix(
                endRow - startRow + 1,
                endColumn - startColumn + 1,
                styleObj
            );

            const setStyle: ISetRangeStyleActionData = {
                sheetId: _worksheet.getSheetId(),
                value: stylesMatrix,
                rangeData: range,
                actionName: SetRangeStyleAction.NAME,
            };

            return setStyle;
        });

        let command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            ...setList
        );
        _commandManager.invoke(command);
        return this;
    }
}
