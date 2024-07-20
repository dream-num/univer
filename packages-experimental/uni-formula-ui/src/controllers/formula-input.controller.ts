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

import { Disposable, ICommandService, Inject, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import type { IInsertCommandParams } from '@univerjs/docs';
import { DeleteLeftCommand, InsertCommand, MoveCursorOperation, TextSelectionManagerService } from '@univerjs/docs';
import { ComponentManager, IEditorService } from '@univerjs/ui';

import { AddDocUniFormulaCommand, RemoveDocUniFormulaCommand, UpdateDocUniFormulaCommand } from '../commands/command';
import type { IShowFormulaPopupOperationParams } from '../commands/operation';
import { CloseFormulaPopupOperation, ConfirmFormulaPopupCommand, ShowFormulaPopupOperation } from '../commands/operation';
import { DocFormulaPopup, DOCS_UNI_FORMULA_EDITOR_UNIT_ID_KEY } from '../views/components/DocFormulaPopup';
import { DocFormulaPopupService } from '../services/formula-popup.service';

const FORMULA_INPUT_TRIGGER_CHAR = '=';

@OnLifecycle(LifecycleStages.Steady, DocUniFormulaController)
export class DocUniFormulaController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @IEditorService private readonly _editorService: IEditorService,
        @Inject(DocFormulaPopupService) private readonly _docFormulaPopupService: DocFormulaPopupService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();

        this._initKeyboardListeners();
        this._initComponents();
        this._initCommands();
    }

    private _initCommands(): void {
        [
            ShowFormulaPopupOperation,
            CloseFormulaPopupOperation,
            ConfirmFormulaPopupCommand,
            AddDocUniFormulaCommand,
            RemoveDocUniFormulaCommand,
            UpdateDocUniFormulaCommand,
        ].forEach((command) => this._commandService.registerCommand(command));
    }

    private _initComponents(): void {
        this.disposeWithMe(this._componentManager.register(DocFormulaPopup.componentKey, DocFormulaPopup));
    }

    private _initKeyboardListeners(): void {
        // The formula input trigger works not exactly the same as Mention.
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            const currentEditor = this._editorService.getFocusEditor();
            const focusedUnit = this._instanceSrv.getFocusedUnit();

            if (
                currentEditor?.editorUnitId === DOCS_UNI_FORMULA_EDITOR_UNIT_ID_KEY ||
                focusedUnit?.type !== UniverInstanceType.UNIVER_DOC
            ) {
                return;
            }

            if (commandInfo.id === InsertCommand.id) {
                const params = commandInfo.params as IInsertCommandParams;
                const activeRange = this._textSelectionManagerService.getActiveRange();
                if (params.body.dataStream === FORMULA_INPUT_TRIGGER_CHAR && activeRange) {
                    this._commandService.executeCommand(ShowFormulaPopupOperation.id, {
                        startIndex: activeRange.startOffset - 1,
                        unitId: focusedUnit.getUnitId(),
                    } as IShowFormulaPopupOperationParams);
                } else if (this._docFormulaPopupService.popupInfo) {
                    this._commandService.executeCommand(CloseFormulaPopupOperation.id);
                }
            }

            if (commandInfo.id === MoveCursorOperation.id) {
                this._commandService.executeCommand(CloseFormulaPopupOperation.id);
            }

            if (commandInfo.id === DeleteLeftCommand.id) {
                const activeRange = this._textSelectionManagerService.getActiveRange();
                // if (activeRange && activeRange.endOffset <= this._docMentionPopupService.editPopup.anchor) {
                //     this._commandService.executeCommand(CloseMentionEditPopupOperation.id);
                // }
                this._commandService.executeCommand(CloseFormulaPopupOperation.id);
            }
        }));
    }
}

