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
    IDisposable,
    IDocumentBody,
    ISelectionCellWithMergeInfo,
    Nullable,
} from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import type { ISetNumfmtCommandParams } from '@univerjs/sheets-numfmt';
import type { ICanvasPopup, ICellAlert } from '@univerjs/sheets-ui';
import type { IFComponentKey } from './utils';
import { ICommandService, Tools, UserManagerService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { FRange } from '@univerjs/sheets/facade';
import { SetNumfmtCommand } from '@univerjs/sheets-numfmt';
import { AddCommentCommand, DeleteCommentTreeCommand, SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { CellAlertManagerService, ISheetClipboardService, SheetCanvasPopManagerService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { getDT } from '@univerjs/thread-comment-ui';
import { ComponentManager } from '@univerjs/ui';
import { FThreadComment } from './f-thread-comment';
import { transformComponentKey } from './utils';

export type FontLine = 'none' | 'underline' | 'line-through';
export type FontStyle = 'normal' | 'italic';
export type FontWeight = 'normal' | 'bold';

export interface IFCanvasPopup extends Omit<ICanvasPopup, 'componentKey'>, IFComponentKey { }

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
}

FRange.extend(FRangeLegacy);

declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRange extends IFRangeLegacy { }
}

export { FRange };
