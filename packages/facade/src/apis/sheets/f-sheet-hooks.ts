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

import type { IDisposable, IExecutionOptions, ISheetDataValidationRule, Nullable } from '@univerjs/core';
import { ICommandService, Inject, Injector, toDisposable } from '@univerjs/core';
import type { IRuleChange, IValidStatusChange } from '@univerjs/data-validation';
import { DataValidationModel } from '@univerjs/data-validation';
import type { IUpdateCommandParams } from '@univerjs/docs';
import type { IAddSheetDataValidationCommandParams, IRemoveSheetAllDataValidationCommandParams, IRemoveSheetDataValidationCommandParams, IUpdateSheetDataValidationOptionsCommandParams, IUpdateSheetDataValidationRangeCommandParams, IUpdateSheetDataValidationSettingCommandParams } from '@univerjs/sheets-data-validation';
import { AddSheetDataValidationCommand, RemoveSheetAllDataValidationCommand, RemoveSheetDataValidationCommand, UpdateSheetDataValidationOptionsCommand, UpdateSheetDataValidationRangeCommand, UpdateSheetDataValidationSettingCommand } from '@univerjs/sheets-data-validation';

import type { IDragCellPosition, IHoverCellPosition } from '@univerjs/sheets-ui';
import { DragManagerService, HoverManagerService } from '@univerjs/sheets-ui';
import type { CommentUpdate, IAddCommentCommandParams, IDeleteCommentCommandParams } from '@univerjs/thread-comment';
import { AddCommentCommand, DeleteCommentCommand, DeleteCommentTreeCommand, ThreadCommentModel, UpdateCommentCommand } from '@univerjs/thread-comment';

export class FSheetHooks {
    constructor(
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService,
        @Inject(DragManagerService) private readonly _dragManagerService: DragManagerService,
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        // empty
    }

    private get _dataValidationModel(): DataValidationModel {
        return this._injector.get(DataValidationModel);
    }

    private get _threadCommentModel(): ThreadCommentModel {
        return this._injector.get(ThreadCommentModel);
    }

    /**
     * The onCellPointerMove event is fired when a pointer changes coordinates.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onCellPointerMove(callback: (cellPos: Nullable<IHoverCellPosition>) => void): IDisposable {
        return toDisposable(this._hoverManagerService.currentPosition$.subscribe(callback));
    }

    /**
     * The onCellPointerOver event is fired when a pointer is moved into a cell's hit test boundaries.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onCellPointerOver(callback: (cellPos: Nullable<IHoverCellPosition>) => void): IDisposable {
        return toDisposable(this._hoverManagerService.currentCell$.subscribe(callback));
    }

    /**
     * The onCellDragOver event is fired when an element or text selection is being dragged into a cell's hit test boundaries.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onCellDragOver(callback: (cellPos: Nullable<IDragCellPosition>) => void): IDisposable {
        return toDisposable(this._dragManagerService.currentCell$.subscribe(callback));
    }

    /**
     * The onCellDrop event is fired when an element or text selection is being dropped on the cell.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onCellDrop(callback: (cellPos: Nullable<IDragCellPosition>) => void): IDisposable {
        return toDisposable(this._dragManagerService.endCell$.subscribe(callback));
    }

     // region DataValidation
    /**
     * The onDataValidationChange event is fired when the data validation rule of this sheet is changed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onDataValidationChange(callback: (ruleChange: IRuleChange<ISheetDataValidationRule>) => void): IDisposable {
        return toDisposable(this._dataValidationModel.ruleChange$.subscribe(callback));
    }

    /**
     * The onDataValidationStatusChange event is fired when the data validation status of this sheet is changed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onDataValidationStatusChange(callback: (statusChange: IValidStatusChange) => void): IDisposable {
        return toDisposable(this._dataValidationModel.validStatusChange$.subscribe(callback));
    }

    /**
     * The onBeforeAddDataValidation event is fired before the data validation rule is added.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeAddDataValidation(callback: (params: IAddSheetDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IAddSheetDataValidationCommandParams;
            if (commandInfo.id === AddSheetDataValidationCommand.id) {
                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeAddDataValidation');
                }
            }
        }));
    }

    /**
     * The onBeforeUpdateDataValidationCriteria event is fired before the data validation rule is updated.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeUpdateDataValidationCriteria(callback: (params: IUpdateSheetDataValidationSettingCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IUpdateSheetDataValidationSettingCommandParams;
            if (commandInfo.id === UpdateSheetDataValidationSettingCommand.id) {
                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeUpdateDataValidationCriteria');
                }
            }
        }));
    }

    /**
     * The onBeforeUpdateDataValidationRange event is fired before the data validation rule is updated.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeUpdateDataValidationRange(callback: (params: IUpdateSheetDataValidationRangeCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IUpdateSheetDataValidationRangeCommandParams;
            if (commandInfo.id === UpdateSheetDataValidationRangeCommand.id) {
                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeUpdateDataValidationRange');
                }
            }
        }));
    }

    /**
     * The onBeforeUpdateDataValidationOptions event is fired before the data validation rule is updated.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeUpdateDataValidationOptions(callback: (params: IUpdateSheetDataValidationOptionsCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IUpdateSheetDataValidationOptionsCommandParams;
            if (commandInfo.id === UpdateSheetDataValidationOptionsCommand.id) {
                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeUpdateDataValidationOptions');
                }
            }
        }));
    }

    /**
     * The onBeforeDeleteDataValidation event is fired before the data validation rule is deleted.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeDeleteDataValidation(callback: (params: IRemoveSheetDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IRemoveSheetDataValidationCommandParams;
            if (commandInfo.id === RemoveSheetDataValidationCommand.id) {
                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeDeleteDataValidation');
                }
            }
        }));
    }

    /**
     * The onBeforeDeleteAllDataValidation event is fired before delete all data validation rules.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeDeleteAllDataValidation(callback: (params: IRemoveSheetAllDataValidationCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IRemoveSheetAllDataValidationCommandParams;
            if (commandInfo.id === RemoveSheetAllDataValidationCommand.id) {
                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeDeleteAllDataValidation');
                }
            }
        }));
    }

    // endregion

    // region ThreadComment
    /**
     * The onThreadCommentChange event is fired when the thread comment of this sheet is changed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onThreadCommentChange(callback: (commentUpdate: CommentUpdate) => void | false): IDisposable {
        return toDisposable(this._threadCommentModel.commentUpdate$.subscribe(callback));
    }

    /**
     * The onThreadCommentChange event is fired when the thread comment of this sheet is changed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeAddThreadComment(callback: (params: IAddCommentCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IAddCommentCommandParams;
            if (commandInfo.id === AddCommentCommand.id) {
                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeAddThreadComment');
                }
            }
        }));
    }

    /**
     * The onBeforeUpdateThreadComment event is fired before the thread comment is updated.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeUpdateThreadComment(callback: (params: IUpdateCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IUpdateCommandParams;
            if (commandInfo.id === UpdateCommentCommand.id) {
                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeUpdateThreadComment');
                }
            }
        }));
    }

    /**
     * The onBeforeDeleteThreadComment event is fired before the thread comment is deleted.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onBeforeDeleteThreadComment(callback: (params: IDeleteCommentCommandParams, options: IExecutionOptions | undefined) => void | false): IDisposable {
        return toDisposable(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            const params = commandInfo.params as IDeleteCommentCommandParams;
            if (commandInfo.id === DeleteCommentCommand.id || commandInfo.id === DeleteCommentTreeCommand.id) {
                if (callback(params, options) === false) {
                    throw new Error('Command is stopped by the hook onBeforeDeleteThreadComment');
                }
            }
        }));
    }

    // endregion
}
