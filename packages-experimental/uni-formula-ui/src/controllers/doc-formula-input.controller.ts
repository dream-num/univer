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

import { CustomRangeType, Disposable, ICommandService, ILogService, Inject, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import type { IInsertCommandParams } from '@univerjs/docs';
import { DeleteLeftCommand, InsertCommand, MoveCursorOperation, TextSelectionManagerService } from '@univerjs/docs';
import { IEditorService } from '@univerjs/ui';
import { DocHoverManagerService } from '@univerjs/docs-ui';

import { AddDocUniFormulaCommand, RemoveDocUniFormulaCommand, UpdateDocUniFormulaCommand } from '../commands/commands/doc.command';
import type { IShowFormulaPopupOperationParams } from '../commands/operations/operation';
import { CloseFormulaPopupOperation, ShowFormulaPopupOperation } from '../commands/operations/operation';
import { UNI_FORMULA_EDITOR_ID } from '../views/components/DocFormulaPopup';
import { UniFormulaPopupService } from '../services/formula-popup.service';

const FORMULA_INPUT_TRIGGER_CHAR = '=';

@OnLifecycle(LifecycleStages.Steady, DocUniFormulaInputController)
export class DocUniFormulaInputController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @IEditorService private readonly _editorService: IEditorService,
        @ILogService private readonly _logService: ILogService,
        @Inject(DocHoverManagerService) private readonly _docHoverManagerSrv: DocHoverManagerService,
        @Inject(UniFormulaPopupService) private readonly _formulaPopupSrv: UniFormulaPopupService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService
    ) {
        super();

        this._initKeyboardListeners();
        this._initCommands();
        this._initHoverListener();
    }

    private _initCommands(): void {
        [
            AddDocUniFormulaCommand,
            RemoveDocUniFormulaCommand,
            UpdateDocUniFormulaCommand,
        ].forEach((command) => this._commandService.registerCommand(command));
    }

    private _initKeyboardListeners(): void {
        // TODO@wzhudev: only need to listen when a doc unit is focused.
        // The formula input trigger works not exactly the same as Mention.
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            const currentEditor = this._editorService.getFocusEditor();
            const focusedUnit = this._instanceSrv.getFocusedUnit();

            const { id } = commandInfo;

            if (
                currentEditor?.editorUnitId === UNI_FORMULA_EDITOR_ID ||
                focusedUnit?.type !== UniverInstanceType.UNIVER_DOC
            ) {
                return;
            }

            if (id === InsertCommand.id) {
                const params = commandInfo.params as IInsertCommandParams;
                const activeRange = this._textSelectionManagerService.getActiveTextRange();
                if (params.body.dataStream === FORMULA_INPUT_TRIGGER_CHAR && activeRange) {
                    this._showPopup({
                        startIndex: activeRange.startOffset! - 1,
                        unitId: focusedUnit.getUnitId(),
                        position: {},
                    });
                } else if (this._formulaPopupSrv.popupInfo) {
                    this._closePopup();
                }
            }

            if (id === MoveCursorOperation.id || id === DeleteLeftCommand.id) {
                this._closePopup();
            }
        }));
    }

    private _initHoverListener(): void {
        this.disposeWithMe(this._docHoverManagerSrv.activeCustomRanges$.subscribe((customRanges) => {
            const focusedUnit = this._instanceSrv.getFocusedUnit();

            if (
                !focusedUnit ||
                this._formulaPopupSrv.popupInfo?.type === 'new' ||
                this._formulaPopupSrv.popupLocked
            ) {
                return;
            }

            const formulaCustomRange = customRanges.find((range) => range.rangeType === CustomRangeType.UNI_FORMULA);
            if (formulaCustomRange) {
                const { startIndex, rangeId } = formulaCustomRange;
                this._logService.debug('[DocUniFormulaController]: activeCustomRanges', customRanges);
                this._showPopup({
                    startIndex,
                    unitId: focusedUnit.getUnitId(),
                    position: { rangeId },
                    type: 'existing',
                });
            } else {
                if (!this._hovered) {
                    this._closePopup(500);
                }
            }
        }));

        this.disposeWithMe(this._formulaPopupSrv.popupHovered$.subscribe((hovered) => {
            if (hovered) {
                this._removeTimer();
            }

            this._hovered = hovered;
        }));
    }

    private _hovered = false;

    private _removeTimer(): void {
        if (this._closePopupTimer !== null) {
            window.clearTimeout(this._closePopupTimer);
            this._closePopupTimer = null;
        }
    }

    private _showPopup(params: IShowFormulaPopupOperationParams): void {
        this._removeTimer();
        this._commandService.executeCommand(ShowFormulaPopupOperation.id, params);
    }

    private _closePopupTimer: number | null = null;
    private _closePopup(timeout: number = 0): void {
        if (!this._formulaPopupSrv.popupInfo) {
            return;
        }

        if (timeout === 0) {
            this._commandService.executeCommand(CloseFormulaPopupOperation.id);
        } else {
            this._closePopupTimer = window.setTimeout(() => this._closePopup(0), timeout);
        }
    }
}

