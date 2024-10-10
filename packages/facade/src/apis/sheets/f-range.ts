/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {
    CellValue,
    DataValidationStatus,
    ICellData,
    IColorStyle,
    IDisposable,
    IDocumentBody,
    IObjectMatrixPrimitiveType,
    IRange,
    ISelectionCellWithMergeInfo,
    IStyleData,
    ITextDecoration,
    Nullable,
    Workbook,
    Worksheet,
} from '@univerjs/core';
import type {
    ISetHorizontalTextAlignCommandParams,
    ISetStyleCommandParams,
    ISetTextWrapCommandParams,
    ISetVerticalTextAlignCommandParams,
    ISheetLocation,
    IStyleTypeValue,
} from '@univerjs/sheets';
import type { IAddSheetDataValidationCommandParams, IClearRangeDataValidationCommandParams } from '@univerjs/sheets-data-validation';
import type { FilterModel } from '@univerjs/sheets-filter';
import type { ISetSheetFilterRangeCommandParams } from '@univerjs/sheets-filter-ui';
import type { IAddHyperLinkCommandParams, ICancelHyperLinkCommandParams, IUpdateHyperLinkCommandParams } from '@univerjs/sheets-hyper-link-ui';
import type { ISetNumfmtCommandParams } from '@univerjs/sheets-numfmt';
import type { ICanvasPopup, ICellAlert } from '@univerjs/sheets-ui';
import type { FHorizontalAlignment, FVerticalAlignment, IFComponentKey } from './utils';
import { BooleanNumber, CustomRangeType, Dimension, generateRandomId, ICommandService, Inject, Injector, Tools, UserManagerService, WrapStrategy } from '@univerjs/core';
import { FormulaDataModel } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    addMergeCellsUtil,
    getAddMergeMutationRangeByType,
    RemoveWorksheetMergeCommand,
    SetHorizontalTextAlignCommand,
    SetRangeValuesCommand,
    SetStyleCommand,
    SetTextWrapCommand,
    SetVerticalTextAlignCommand,
} from '@univerjs/sheets';
import { AddSheetDataValidationCommand, ClearRangeDataValidationCommand, SheetsDataValidationValidatorService } from '@univerjs/sheets-data-validation';
import { SheetsFilterService } from '@univerjs/sheets-filter';
import { SetSheetFilterRangeCommand } from '@univerjs/sheets-filter-ui';
import { AddHyperLinkCommand, CancelHyperLinkCommand, UpdateHyperLinkCommand } from '@univerjs/sheets-hyper-link-ui';
import { SetNumfmtCommand } from '@univerjs/sheets-numfmt';
import { AddCommentCommand, DeleteCommentTreeCommand, SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { CellAlertManagerService, ISheetClipboardService, SheetCanvasPopManagerService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { getDT } from '@univerjs/thread-comment-ui';
import { ComponentManager } from '@univerjs/ui';
import { FDataValidation } from './f-data-validation';
import { FFilter } from './f-filter';
import { FThreadComment } from './f-thread-comment';
import {
    covertCellValue,
    covertCellValues,
    isCellMerged,
    transformComponentKey,
    transformCoreHorizontalAlignment,
    transformCoreVerticalAlignment,
    transformFacadeHorizontalAlignment,
    transformFacadeVerticalAlignment,
} from './utils';

export type FontLine = 'none' | 'underline' | 'line-through';
export type FontStyle = 'normal' | 'italic';
export type FontWeight = 'normal' | 'bold';

export interface IFCanvasPopup extends Omit<ICanvasPopup, 'componentKey'>, IFComponentKey {

}

export interface ICellHyperLink {
    id: string;
    startIndex: number;
    endIndex: number;
    url: string;
    label: string;
}

export class FRange {
    constructor(
        private readonly _workbook: Workbook,
        private readonly _worksheet: Worksheet,
        private readonly _range: IRange,
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
    ) {
        // empty
    }

    /**
     * Get the unit ID of the current workbook
     *
     * @return The unit ID of the workbook
     */
    getUnitId(): string {
        return this._workbook.getUnitId();
    }

    /**
     * Gets the name of the worksheet
     *
     * @return The name of the worksheet
     */
    getSheetName(): string {
        return this._worksheet.getName();
    }

    /**
     * Gets the area where the statement is applied
     *
     * @return The area where the statement is applied
     */
    getRange(): IRange {
        return this._range;
    }

    /**
     * Gets the starting row number of the applied area
     *
     * @return The starting row number of the area
     */
    getRow(): number {
        return this._range.startRow;
    }

    /**
     * Gets the starting column number of the applied area
     *
     * @return The starting column number of the area
     */
    getColumn(): number {
        return this._range.startColumn;
    }

    /**
     * Gets the width of the applied area
     *
     * @return The width of the area
     */
    getWidth(): number {
        return this._range.endColumn - this._range.startColumn + 1;
    }

    /**
     * Gets the height of the applied area
     *
     * @return The height of the area
     */
    getHeight(): number {
        return this._range.endRow - this._range.startRow + 1;
    }

    /**
     * Return first cell model data in this range
     * @returns The cell model data
     */
    getCellData(): ICellData | null {
        return this._worksheet.getCell(this._range.startRow, this._range.startColumn) ?? null;
    }

    /**
     * Return this cell information, including whether it is merged and cell coordinates
     * @returns The cell information
     */
    getCell(): ISelectionCellWithMergeInfo {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const skeleton = this._renderManagerService.getRenderById(unitId)!
            .with(SheetSkeletonManagerService)
            .getWorksheetSkeleton(subUnitId)!.skeleton;
        return skeleton.getCellByIndex(this._range.startRow, this._range.startColumn);
    }

    /**
     * Return range whether this range is merged
     * @returns if true is merged
     */
    isMerged(): boolean {
        return isCellMerged(this.getCell().mergeInfo, this._range);
    }

    /**
     * Returns the coordinates of this cell,does not include units
     * @returns coordinates of the cell， top, right, bottom, left
     */
    getCellRect(): DOMRect {
        const { startX: x, startY: y, endX: x2, endY: y2 } = this.getCell();
        const data = { x, y, width: x2 - x, height: y2 - y, top: y, left: x, bottom: y2, right: x2 };
        return { ...data, toJSON: () => JSON.stringify(data) };
    }

    /**
     * Return first cell style data in this range
     * @returns The cell style data
     */
    getCellStyleData(): IStyleData | null {
        const cell = this.getCellData();
        const styles = this._workbook.getStyles();
        if (cell && styles) {
            return styles.getStyleByCell(cell) ?? null;
        }

        return null;
    }

    /**
     * Returns the value of the cell at the start of this range.
     * @returns The value of the cell.
     */
    getValue(): CellValue | null {
        return this._worksheet.getCell(this._range.startRow, this._range.startColumn)?.v ?? null;
    }

    /**
     * Returns the rectangular grid of values for this range.
     * Returns a two-dimensional array of values, indexed by row, then by column.
     * @returns A two-dimensional array of values.
     */
    getValues(): Nullable<CellValue>[][] {
        const { startRow, endRow, startColumn, endColumn } = this._range;
        const range: Array<Array<Nullable<CellValue>>> = [];

        for (let r = startRow; r <= endRow; r++) {
            const row: Array<Nullable<CellValue>> = [];

            for (let c = startColumn; c <= endColumn; c++) {
                row.push(this._worksheet.getCell(r, c)?.v ?? null);
            }

            range.push(row);
        }
        return range;
    }

    /**
     * Returns the cell data for the cells in the range.
     * @returns A two-dimensional array of cell data.
     */
    getCellDataGrid(): Nullable<ICellData>[][] {
        const { startRow, endRow, startColumn, endColumn } = this._range;
        const range: Nullable<ICellData>[][] = [];

        for (let r = startRow; r <= endRow; r++) {
            const row: Nullable<ICellData>[] = [];
            for (let c = startColumn; c <= endColumn; c++) {
                row.push(this._worksheet.getCellRaw(r, c));
            }
            range.push(row);
        }
        return range;
    }

    /**
     * Returns the formulas (A1 notation) for the cells in the range. Entries in the 2D array are empty strings for cells with no formula.
     * @returns A two-dimensional array of formulas in string format.
     */
    getFormulas(): string[][] {
        const formulas: string[][] = [];

        const { startRow, endRow, startColumn, endColumn } = this._range;
        const sheetId = this._worksheet.getSheetId();
        const unitId = this._workbook.getUnitId();

        for (let row = startRow; row <= endRow; row++) {
            const rowFormulas: string[] = [];

            for (let col = startColumn; col <= endColumn; col++) {
                const formulaString = this._formulaDataModel.getFormulaStringByCell(row, col, sheetId, unitId);
                rowFormulas.push(formulaString || '');
            }

            formulas.push(rowFormulas);
        }

        return formulas;
    }

    getWrap(): boolean {
        return this._worksheet.getRange(this._range).getWrap() === BooleanNumber.TRUE;
    }

    getWrapStrategy(): WrapStrategy {
        return this._worksheet.getRange(this._range).getWrapStrategy();
    }

    getHorizontalAlignment(): string {
        return transformCoreHorizontalAlignment(this._worksheet.getRange(this._range).getHorizontalAlignment());
    }

    getVerticalAlignment(): string {
        return transformCoreVerticalAlignment(this._worksheet.getRange(this._range).getVerticalAlignment());
    }

    // #region editing

    setBackgroundColor(color: string): Promise<boolean> {
        return this._commandService.executeCommand(SetStyleCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style: {
                type: 'bg',
                value: {
                    rgb: color,
                },
            },
        } as ISetStyleCommandParams<IColorStyle>);
    }

    /**
     * The value can be a number, string, boolean, or standard cell format. If it begins with `=`, it is interpreted as a formula. The value is tiled to all cells in the range.
     * @param value
     */
    setValue(value: CellValue | ICellData): Promise<boolean> {
        const realValue = covertCellValue(value);

        if (!realValue) {
            throw new Error('Invalid value');
        }

        return this._commandService.executeCommand(SetRangeValuesCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: realValue,
        });
    }

    /**
     * Set the cell wrap of the given range.
     * Cells with wrap enabled (the default) resize to display their full content. Cells with wrap disabled display as much as possible in the cell without resizing or running to multiple lines.
     */
    setWrap(isWrapEnabled: boolean): Promise<boolean> {
        return this._commandService.executeCommand(SetTextWrapCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: isWrapEnabled ? WrapStrategy.WRAP : WrapStrategy.UNSPECIFIED,
        } as ISetTextWrapCommandParams);
    }

    /**
     * Sets the text wrapping strategy for the cells in the range.
     */
    setWrapStrategy(strategy: WrapStrategy): Promise<boolean> {
        return this._commandService.executeCommand(SetTextWrapCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: strategy,
        } as ISetTextWrapCommandParams);
    }

    /**
     * Set the vertical (top to bottom) alignment for the given range (top/middle/bottom).
     */
    setVerticalAlignment(alignment: FVerticalAlignment): Promise<boolean> {
        return this._commandService.executeCommand(SetVerticalTextAlignCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: transformFacadeVerticalAlignment(alignment),
        } as ISetVerticalTextAlignCommandParams);
    }

    /**
     * Set the horizontal (left to right) alignment for the given range (left/center/right).
     */
    setHorizontalAlignment(alignment: FHorizontalAlignment): Promise<boolean> {
        return this._commandService.executeCommand(SetHorizontalTextAlignCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: transformFacadeHorizontalAlignment(alignment),
        } as ISetHorizontalTextAlignCommandParams);
    }

    /**
     * Set the number format of the range.
     * @param pattern number format pattern.
     * @returns Execution result.
     */
    setNumberFormat(pattern: string): Promise<boolean> {
        // TODO@Gggpound: the API should support other types of parameters
        const values: ISetNumfmtCommandParams['values'] = [];

        // Add number format info to the `values` array.
        this.forEach((row, col) => values.push({ row, col, pattern }));
        return this._commandService.executeCommand(SetNumfmtCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
        } as ISetNumfmtCommandParams);
    }

    /**
     * Sets a different value for each cell in the range. The value can be a two-dimensional array or a standard range matrix (must match the dimensions of this range), consisting of numbers, strings, Boolean values or Composed of standard cell formats. If a value begins with `=`, it is interpreted as a formula.
     * @param value
     */
    setValues(
        value:
            | CellValue[][]
            | IObjectMatrixPrimitiveType<CellValue>
            | ICellData[][]
            | IObjectMatrixPrimitiveType<ICellData>
    ): Promise<boolean> {
        const realValue = covertCellValues(value, this._range);

        return this._commandService.executeCommand(SetRangeValuesCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: realValue,
        });
    }

    /**
     * Sets the font weight for the given range (normal/bold),
     * @param fontWeight The font weight, either 'normal' or 'bold'; a null value resets the font weight.
     */
    setFontWeight(fontWeight: FontWeight | null): this {
        let value: BooleanNumber | null;
        if (fontWeight === 'bold') {
            value = BooleanNumber.TRUE;
        } else if (fontWeight === 'normal') {
            value = BooleanNumber.FALSE;
        } else if (fontWeight === null) {
            value = null;
        } else {
            throw new Error('Invalid fontWeight');
        }

        const style: IStyleTypeValue<BooleanNumber | null> = {
            type: 'bl',
            value,
        };

        const setStyleParams: ISetStyleCommandParams<BooleanNumber | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    /**
     * Sets the font style for the given range ('italic' or 'normal').
     * @param fontStyle The font style, either 'italic' or 'normal'; a null value resets the font style.
     */
    setFontStyle(fontStyle: FontStyle | null): this {
        let value: BooleanNumber | null;
        if (fontStyle === 'italic') {
            value = BooleanNumber.TRUE;
        } else if (fontStyle === 'normal') {
            value = BooleanNumber.FALSE;
        } else if (fontStyle === null) {
            value = null;
        } else {
            throw new Error('Invalid fontStyle');
        }

        const style: IStyleTypeValue<BooleanNumber | null> = {
            type: 'it',
            value,
        };

        const setStyleParams: ISetStyleCommandParams<BooleanNumber | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    /**
     * Sets the font line style of the given range ('underline', 'line-through', or 'none').
     * @param fontLine The font line style, either 'underline', 'line-through', or 'none'; a null value resets the font line style.
     */
    setFontLine(fontLine: FontLine | null): this {
        if (fontLine === 'underline') {
            this._setFontUnderline({
                s: BooleanNumber.TRUE,
            });
        } else if (fontLine === 'line-through') {
            this._setFontStrikethrough({
                s: BooleanNumber.TRUE,
            });
        } else if (fontLine === 'none') {
            this._setFontUnderline({
                s: BooleanNumber.FALSE,
            });
            this._setFontStrikethrough({
                s: BooleanNumber.FALSE,
            });
        } else if (fontLine === null) {
            this._setFontUnderline(null);
            this._setFontStrikethrough(null);
        } else {
            throw new Error('Invalid fontLine');
        }
        return this;
    }

    /**
     * Sets the font underline style of the given ITextDecoration
     */
    private _setFontUnderline(value: ITextDecoration | null): void {
        const style: IStyleTypeValue<ITextDecoration | null> = {
            type: 'ul',
            value,
        };
        const setStyleParams: ISetStyleCommandParams<ITextDecoration | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    }

    /**
     * Sets the font strikethrough style of the given ITextDecoration
     */
    private _setFontStrikethrough(value: ITextDecoration | null): void {
        const style: IStyleTypeValue<ITextDecoration | null> = {
            type: 'st',
            value,
        };
        const setStyleParams: ISetStyleCommandParams<ITextDecoration | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    }

    /**
     * Sets the font family, such as "Arial" or "Helvetica".
     * @param fontFamily The font family to set; a null value resets the font family.
     */
    setFontFamily(fontFamily: string | null): this {
        const style: IStyleTypeValue<string | null> = {
            type: 'ff',
            value: fontFamily,
        };
        const setStyleParams: ISetStyleCommandParams<string | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    /**
     * Sets the font size, with the size being the point size to use.
     * @param size A font size in point size. A null value resets the font size.
     */
    setFontSize(size: number | null): this {
        const style: IStyleTypeValue<number | null> = {
            type: 'fs',
            value: size,
        };
        const setStyleParams: ISetStyleCommandParams<number | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    /**
     * Sets the font color in CSS notation (such as '#ffffff' or 'white').
     * @param color The font color in CSS notation (such as '#ffffff' or 'white'); a null value resets the color.
     */
    setFontColor(color: string | null): this {
        const value: IColorStyle | null = color === null ? null : { rgb: color };
        const style: IStyleTypeValue<IColorStyle | null> = {
            type: 'cl',
            value,
        };

        const setStyleParams: ISetStyleCommandParams<IColorStyle | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    // #endregion editing

    /**
     * Iterate cells in this range. Merged cells will be respected.
     * @param callback
     */
    forEach(callback: (row: number, col: number, cell: ICellData) => void): void {
        // Iterate each cell in this range.
        const { startColumn, startRow, endColumn, endRow } = this._range;
        this._worksheet
            .getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn)
            .forValue((row, col, value) => {
                callback(row, col, value);
            });
    }

    /**
     * Generate HTML content for the range.
     */
    generateHTML(): string {
        const copyContent = this._injector.get(ISheetClipboardService).generateCopyContent(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId(),
            this._range
        );

        return copyContent?.html ?? '';
    }

    // #region DataValidation

    /**
     * set a data validation rule to current range
     * @param rule data validation rule, build by `FUniver.newDataValidation`
     * @returns current range
     */
    async setDataValidation(rule: Nullable<FDataValidation>): Promise<this> {
        if (!rule) {
            this._commandService.executeCommand(ClearRangeDataValidationCommand.id, {
                unitId: this._workbook.getUnitId(),
                subUnitId: this._worksheet.getSheetId(),
                ranges: [this._range],
            } as IClearRangeDataValidationCommandParams);
            return this;
        }

        const params: IAddSheetDataValidationCommandParams = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            rule: {
                ...rule.rule,
                ranges: [this._range],
            },
        };

        await this._commandService.executeCommand(AddSheetDataValidationCommand.id, params);
        return this;
    }

    /**
     * get first data validation rule in current range
     * @returns data validation rule
     */
    getDataValidation(): Nullable<FDataValidation> {
        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        const rule = validatorService.getDataValidation(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId(),
            [this._range]
        );

        if (rule) {
            return new FDataValidation(rule);
        }

        return rule;
    }

    /**
     * get all data validation rules in current range
     * @returns all data validation rules
     */
    getDataValidations(): FDataValidation[] {
        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        return validatorService.getDataValidations(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId(),
            [this._range]
        ).map((rule) => new FDataValidation(rule));
    }

    /**
     * get data validation validator status for current range
     * @returns matrix of validator status
     */
    async getValidatorStatus(): Promise<Promise<DataValidationStatus>[][]> {
        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        return validatorService.validatorRanges(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId(),
            [this._range]
        );
    }

    // #endregion

    // #region Filter

    /**
     * Create a filter for the current range. If the worksheet already has a filter, this method would return `null`.
     *
     * @async
     *
     * @return The interface class to handle the filter. If the worksheet already has a filter,
     * this method would return `null`.
     */
    async createFilter(): Promise<FFilter | null> {
        if (this._getFilterModel()) return null;

        const success = await this._commandService.executeCommand(SetSheetFilterRangeCommand.id, <ISetSheetFilterRangeCommandParams>{
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
        });

        if (!success) return null;

        return this.getFilter();
    }

    /**
     * Get the filter for the current range's worksheet.
     *
     * @return {FFilter | null} The interface class to handle the filter. If the worksheet does not have a filter,
     * this method would return `null`.
     */
    getFilter(): FFilter | null {
        const filterModel = this._getFilterModel();
        if (!filterModel) return null;

        return this._injector.createInstance(FFilter, this._workbook, this._worksheet, filterModel);
    }

    private _getFilterModel(): Nullable<FilterModel> {
        return this._injector.get(SheetsFilterService).getFilterModel(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId()
        );
    }

    // #endregion

    /**
     * Attach a popup to the start cell of current range.
     * If current worksheet is not active, the popup will not be shown.
     * Be careful to manager the detach disposable object, if not dispose correctly, it might memory leaks.
     * @param popup The popup to attach
     * @returns The disposable object to detach the popup, if the popup is not attached, return `null`.
     */
    attachPopup(popup: IFCanvasPopup): Nullable<IDisposable> {
        const { key, disposableCollection } = transformComponentKey(popup, this._injector.get(ComponentManager));
        const sheetsPopupService = this._injector.get(SheetCanvasPopManagerService);
        const disposePopup = sheetsPopupService.attachPopupToCell(
            this._range.startRow,
            this._range.startColumn,
            { ...popup, componentKey: key },
            this.getUnitId(),
            this._worksheet.getSheetId()
        );
        if (disposePopup) {
            disposableCollection.add(disposePopup);
            return disposableCollection;
        }

        disposableCollection.dispose();
        return null;
    }

    /**
     * Attach an alert popup to the start cell of current range.
     * @param alert The alert to attach
     * @returns The disposable object to detach the alert.
     */
    attachAlertPopup(alert: Omit<ICellAlert, 'location'>): IDisposable {
        const cellAlertService = this._injector.get(CellAlertManagerService);
        const location: ISheetLocation = {
            workbook: this._workbook,
            worksheet: this._worksheet,
            row: this._range.startRow,
            col: this._range.startColumn,
            unitId: this.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
        };
        cellAlertService.showAlert({
            ...alert,
            location,
        });

        return {
            dispose: (): void => {
                cellAlertService.removeAlert(alert.key);
            },
        };
    }

    /**
     * Get the comment of the start cell in the current range.
     * @returns The comment of the start cell in the current range. If the cell does not have a comment, return `null`.
     */
    getComment(): Nullable<FThreadComment> {
        const injector = this._injector;
        const sheetsTheadCommentModel = injector.get(SheetsThreadCommentModel);
        const unitId = this._workbook.getUnitId();
        const sheetId = this._worksheet.getSheetId();
        const commentId = sheetsTheadCommentModel.getByLocation(unitId, sheetId, this._range.startRow, this._range.startColumn);
        if (!commentId) {
            return null;
        }

        const comment = sheetsTheadCommentModel.getComment(unitId, sheetId, commentId);
        if (comment) {
            return this._injector.createInstance(FThreadComment, comment);
        }

        return null;
    }

    /**
     * Add a comment to the start cell in the current range.
     * @param content The content of the comment.
     * @returns Whether the comment is added successfully.
     */
    addComment(content: IDocumentBody): Promise<boolean> {
        const injector = this._injector;
        const currentComment = this.getComment()?.getCommentData();
        const commentService = injector.get(ICommandService);
        const userService = injector.get(UserManagerService);
        const unitId = this._workbook.getUnitId();
        const sheetId = this._worksheet.getSheetId();
        const refStr = `${Tools.chatAtABC(this._range.startColumn)}${this._range.startRow + 1}`;
        const currentUser = userService.getCurrentUser();

        return commentService.executeCommand(AddCommentCommand.id, {
            unitId,
            subUnitId: sheetId,
            comment: {
                text: content,
                attachments: [],
                dT: getDT(),
                id: Tools.generateRandomId(),
                ref: refStr!,
                personId: currentUser.userID,
                parentId: currentComment?.id,
                unitId,
                subUnitId: sheetId,
                threadId: currentComment?.threadId,
            },
        });
    }

    /**
     * Clear the comment of the start cell in the current range.
     * @returns Whether the comment is cleared successfully.
     */
    clearComment(): Promise<boolean> {
        const injector = this._injector;
        const currentComment = this.getComment()?.getCommentData();
        const commentService = injector.get(ICommandService);
        const unitId = this._workbook.getUnitId();
        const sheetId = this._worksheet.getSheetId();

        if (currentComment) {
            return commentService.executeCommand(DeleteCommentTreeCommand.id, {
                unitId,
                subUnitId: sheetId,
                threadId: currentComment.threadId,
                commentId: currentComment.id,
            });
        }

        return Promise.resolve(true);
    }

    //#region Merge cell

    /**
     * Merge cells in a range into one merged cell
     * @returns This range, for chaining
     */
    async merge(): Promise<FRange> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();

        await addMergeCellsUtil(this._injector, unitId, subUnitId, [this._range]);

        return this;
    }

    /**
     * Merges cells in a range horizontally.
     * @returns This range, for chaining
     */
    async mergeAcross(): Promise<FRange> {
        const ranges = getAddMergeMutationRangeByType([this._range], Dimension.ROWS);
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();

        await addMergeCellsUtil(this._injector, unitId, subUnitId, ranges);

        return this;
    }

    /**
     * Merges cells in a range vertically.
     * @returns This range, for chaining
     */
    async mergeVertically(): Promise<FRange> {
        const ranges = getAddMergeMutationRangeByType([this._range], Dimension.COLUMNS);
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();

        await addMergeCellsUtil(this._injector, unitId, subUnitId, ranges);

        return this;
    }

    /**
     * Returns true if cells in the current range overlap a merged cell.
     * @returns {boolean} is overlap with a merged cell
     */
    isPartOfMerge(): boolean {
        const { startRow, startColumn, endRow, endColumn } = this._range;
        return this._worksheet.getMergedCellRange(startRow, startColumn, endRow, endColumn).length > 0;
    }

    /**
     * Unmerge cells in the range
     * @returns This range, for chaining
     */
    breakApart(): FRange {
        this._commandService.executeCommand(RemoveWorksheetMergeCommand.id, { ranges: [this._range] });
        return this;
    }
    //#endregion

    // #region hyperlink
    /**
     * Set a hyperlink to the cell in the range.
     * @param url url
     * @param label optional, label of the url
     * @returns success or not
     */
    setHyperLink(url: string, label?: string): Promise<boolean> {
        const params: IAddHyperLinkCommandParams = {
            unitId: this.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            link: {
                row: this._range.startRow,
                column: this._range.startColumn,
                payload: url,
                display: label,
                id: generateRandomId(),
            },
        };

        return this._commandService.executeCommand(AddHyperLinkCommand.id, params);
    }

    /**
     * Get all hyperlinks in the cell in the range.
     * @returns hyperlinks
     */
    getHyperLinks(): ICellHyperLink[] {
        const cellValue = this._worksheet.getCellRaw(this._range.startRow, this._range.startColumn);
        if (!cellValue?.p) {
            return [];
        }

        return cellValue.p.body?.customRanges
            ?.filter((range) => range.rangeType === CustomRangeType.HYPERLINK)
            .map((range) => ({
                id: range.rangeId,
                startIndex: range.startIndex,
                endIndex: range.endIndex,
                url: range.properties?.url ?? '',
                label: cellValue.p?.body?.dataStream.slice(range.startIndex + 1, range.endIndex) ?? '',
            })) ?? [];
    }

    /**
     * Update hyperlink in the cell in the range.
     * @param id id of the hyperlink
     * @param url url
     * @param label optional, label of the url
     * @returns success or not
     */
    updateHyperLink(id: string, url: string, label?: string): Promise<boolean> {
        const params: IUpdateHyperLinkCommandParams = {
            unitId: this.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            row: this._range.startRow,
            column: this._range.startColumn,
            id,
            payload: {
                payload: url,
                display: label,
            },
        };

        return this._commandService.executeCommand(UpdateHyperLinkCommand.id, params);
    }

    /**
     * Cancel hyperlink in the cell in the range.
     * @param id id of the hyperlink
     * @returns success or not
     */
    cancelHyperLink(id: string): Promise<boolean> {
        const params: ICancelHyperLinkCommandParams = {
            unitId: this.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            row: this._range.startRow,
            column: this._range.startColumn,
            id,
        };

        return this._commandService.executeCommand(CancelHyperLinkCommand.id, params);
    }
    // #endregion
}
