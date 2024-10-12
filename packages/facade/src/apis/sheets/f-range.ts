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
    DataValidationStatus,
    IDisposable,
    IDocumentBody,
    ISelectionCellWithMergeInfo,
    Nullable,
} from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import type { IAddSheetDataValidationCommandParams, IClearRangeDataValidationCommandParams } from '@univerjs/sheets-data-validation';
import type { FilterModel } from '@univerjs/sheets-filter';
import type { ISetSheetFilterRangeCommandParams } from '@univerjs/sheets-filter-ui';
import type { IAddHyperLinkCommandParams, ICancelHyperLinkCommandParams, IUpdateHyperLinkCommandParams } from '@univerjs/sheets-hyper-link-ui';
import type { ISetNumfmtCommandParams } from '@univerjs/sheets-numfmt';
import type { ICanvasPopup, ICellAlert } from '@univerjs/sheets-ui';
import type { IFComponentKey } from './utils';
import { CustomRangeType, generateRandomId, ICommandService, Tools, UserManagerService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { FRange } from '@univerjs/sheets/facade';
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
import { transformComponentKey } from './utils';

export type FontLine = 'none' | 'underline' | 'line-through';
export type FontStyle = 'normal' | 'italic';
export type FontWeight = 'normal' | 'bold';

export interface IFCanvasPopup extends Omit<ICanvasPopup, 'componentKey'>, IFComponentKey { }

export interface ICellHyperLink {
    id: string;
    startIndex: number;
    endIndex: number;
    url: string;
    label: string;
}

interface IFRangeLegacy {
    /**
     * Set the number format of the range.
     * @param pattern number format pattern.
     * @returns Execution result.
     */
    setNumberFormat(pattern: string): Promise<boolean>;
    /**
     * Return this cell information, including whether it is merged and cell coordinates
     * @returns The cell information
     */
    getCell(): ISelectionCellWithMergeInfo;
    /**
     * Returns the coordinates of this cell,does not include units
     * @returns coordinates of the cell， top, right, bottom, left
     */
    getCellRect(): DOMRect;
    /**
     * Generate HTML content for the range.
     */
    generateHTML(this: FRange): string;
    /**
     * set a data validation rule to current range
     * @param rule data validation rule, build by `FUniver.newDataValidation`
     * @returns current range
     */
    setDataValidation(this: FRange, rule: Nullable<FDataValidation>): Promise<FRange>;
    /**
     * get first data validation rule in current range
     * @returns data validation rule
     */
    getDataValidation(this: FRange): Nullable<FDataValidation>;

    /**
     * get all data validation rules in current range
     * @returns all data validation rules
     */
    getDataValidations(this: FRange): FDataValidation[];
    getValidatorStatus(): Promise<Promise<DataValidationStatus>[][]>;
    /**
     * Create a filter for the current range. If the worksheet already has a filter, this method would return `null`.
     *
     * @async
     *
     * @return The interface class to handle the filter. If the worksheet already has a filter,
     * this method would return `null`.
     */
    createFilter(this: FRange): Promise<FFilter | null>;
    /**
     * Get the filter for the current range's worksheet.
     *
     * @return {FFilter | null} The interface class to handle the filter. If the worksheet does not have a filter,
     * this method would return `null`.
     */
    getFilter(): FFilter | null;
    /**
     * Attach a popup to the start cell of current range.
     * If current worksheet is not active, the popup will not be shown.
     * Be careful to manager the detach disposable object, if not dispose correctly, it might memory leaks.
     * @param popup The popup to attach
     * @returns The disposable object to detach the popup, if the popup is not attached, return `null`.
     */
    attachPopup(popup: IFCanvasPopup): Nullable<IDisposable>;

    /**
     * Attach an alert popup to the start cell of current range.
     * @param alert The alert to attach
     * @returns The disposable object to detach the alert.
     */
    attachAlertPopup(alert: Omit<ICellAlert, 'location'>): IDisposable;

    /**
     * Get the comment of the start cell in the current range.
     * @returns The comment of the start cell in the current range. If the cell does not have a comment, return `null`.
     */
    getComment(): Nullable<FThreadComment>;
    /**
     * Add a comment to the start cell in the current range.
     * @param content The content of the comment.
     * @returns Whether the comment is added successfully.
     */
    addComment(this: FRange, content: IDocumentBody): Promise<boolean>;
    /**
     * Clear the comment of the start cell in the current range.
     * @returns Whether the comment is cleared successfully.
     */
    clearComment(): Promise<boolean>;
    /**
     * Get all hyperlinks in the cell in the range.
     * @returns hyperlinks
     */
    getHyperLinks(): ICellHyperLink[];
    /**
     * Update hyperlink in the cell in the range.
     * @param id id of the hyperlink
     * @param url url
     * @param label optional, label of the url
     * @returns success or not
     */
    updateHyperLink(id: string, url: string, label?: string): Promise<boolean>;
    /**
     * Cancel hyperlink in the cell in the range.
     * @param id id of the hyperlink
     * @returns success or not
     */
    cancelHyperLink(id: string): Promise<boolean>;
}

class FRangeLegacy extends FRange implements IFRangeLegacy {
    override setNumberFormat(pattern: string): Promise<boolean> {
        // TODO@Gggpound: the API should support other types of parameters
        const values: ISetNumfmtCommandParams['values'] = [];

        // Add number format info to the `values` array.
        this.forEach((row, col) => values.push({ row, col, pattern }));
        return this._commandService.executeCommand(SetNumfmtCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
        } as ISetNumfmtCommandParams);
    }

    override getCell(): ISelectionCellWithMergeInfo {
        const renderManagerService = this._injector.get(IRenderManagerService);
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const skeleton = renderManagerService.getRenderById(unitId)!
            .with(SheetSkeletonManagerService)
            .getWorksheetSkeleton(subUnitId)!.skeleton;
        return skeleton.getCellByIndex(this._range.startRow, this._range.startColumn);
    }

    override getCellRect(): DOMRect {
        const { startX: x, startY: y, endX: x2, endY: y2 } = this.getCell();
        const data = { x, y, width: x2 - x, height: y2 - y, top: y, left: x, bottom: y2, right: x2 };
        return { ...data, toJSON: () => JSON.stringify(data) };
    }

    override generateHTML(): string {
        const copyContent = this._injector.get(ISheetClipboardService).generateCopyContent(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId(),
            this._range
        );

        return copyContent?.html ?? '';
    }

    // #region DataValidation

    override async setDataValidation(rule: Nullable<FDataValidation>): Promise<FRange> {
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

    override getDataValidation(): Nullable<FDataValidation> {
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

    override getDataValidations(): FDataValidation[] {
        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        return validatorService.getDataValidations(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId(),
            [this._range]
        ).map((rule) => new FDataValidation(rule));
    }

    override async getValidatorStatus(): Promise<Promise<DataValidationStatus>[][]> {
        const validatorService = this._injector.get(SheetsDataValidationValidatorService);
        return validatorService.validatorRanges(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId(),
            [this._range]
        );
    }

    // #endregion

    // #region Filter

    override async createFilter(): Promise<FFilter | null> {
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
    override getFilter(): FFilter | null {
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

    override attachPopup(popup: IFCanvasPopup): Nullable<IDisposable> {
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

    override attachAlertPopup(alert: Omit<ICellAlert, 'location'>): IDisposable {
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

    override getComment(): Nullable<FThreadComment> {
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

    override addComment(content: IDocumentBody): Promise<boolean> {
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

    override clearComment(): Promise<boolean> {
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

    // #region hyperlink

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

    override getHyperLinks(): ICellHyperLink[] {
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

    override updateHyperLink(id: string, url: string, label?: string): Promise<boolean> {
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
    override cancelHyperLink(id: string): Promise<boolean> {
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

FRange.extend(FRangeLegacy);

declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRange extends IFRangeLegacy { }
}
