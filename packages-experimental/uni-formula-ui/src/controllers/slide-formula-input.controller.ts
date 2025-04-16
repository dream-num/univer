/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { IInsertCommandParams } from '@univerjs/docs-ui';
import type { IShowFormulaPopupOperationParams, ISlidePopupPosition } from '../commands/operations/operation';
import { Disposable, ICommandService, Inject, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IEditorService, InsertCommand } from '@univerjs/docs-ui';
import { ISlideEditorBridgeService } from '@univerjs/slides-ui';
import { AddSlideUniFormulaCommand } from '../commands/commands/slide.command';
import { CloseFormulaPopupOperation, ShowFormulaPopupOperation } from '../commands/operations/operation';
import { UniFormulaPopupService } from '../services/formula-popup.service';
import { UNI_FORMULA_EDITOR_ID } from '../views/components/DocFormulaPopup';

const FORMULA_INPUT_TRIGGER_CHAR = '=';

export class SlideUniFormulaInputController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @ICommandService private readonly _commandSrv: ICommandService,
        @IEditorService private readonly _editorSrv: IEditorService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @Inject(UniFormulaPopupService) private readonly _formulaPopupSrv: UniFormulaPopupService
    ) {
        super();

        this._initCommands();
        this._initKeyboardListeners();
    }

    private _initCommands() {
        [
            AddSlideUniFormulaCommand,
        ].forEach((cmd) => this._commandSrv.registerCommand(cmd));
    }

    private _initKeyboardListeners(): void {
        this.disposeWithMe(this._commandSrv.onCommandExecuted((commandInfo) => {
            const currentEditor = this._editorSrv.getFocusEditor();
            const focusedUnit = this._instanceSrv.getFocusedUnit();

            const { id } = commandInfo;

            if (
                currentEditor?.getEditorId() === UNI_FORMULA_EDITOR_ID ||
                focusedUnit?.type !== UniverInstanceType.UNIVER_SLIDE
            ) {
                return;
            }

            if (id === InsertCommand.id) {
                const params = commandInfo.params as IInsertCommandParams;
                const activeRange = this._textSelectionManagerService.getActiveTextRange();
                if (params.body.dataStream === FORMULA_INPUT_TRIGGER_CHAR && activeRange) {
                    // NOTE: we can avoid manually get the SlideEditorBridgeService when we split
                    // slide formula editor plugin into a separate package.
                    const editorBridgeService = this._injector.get(ISlideEditorBridgeService);
                    const editorRect = editorBridgeService.getEditorRect();
                    const { pageId, richTextObj } = editorRect;
                    const { oKey } = richTextObj;
                    this._showPopup({
                        startIndex: activeRange.startOffset! - 1,
                        unitId: focusedUnit.getUnitId(),
                        position: {
                            pageId,
                            elementId: oKey,
                        } as ISlidePopupPosition,
                    });
                } else if (this._formulaPopupSrv.popupInfo) {
                    this._closePopup();
                }
            }
        }));
    }

    private _removeTimer(): void {
        if (this._closePopupTimer !== null) {
            window.clearTimeout(this._closePopupTimer);
            this._closePopupTimer = null;
        }
    }

    private _showPopup(params: IShowFormulaPopupOperationParams): void {
        this._removeTimer();
        this._commandSrv.executeCommand(ShowFormulaPopupOperation.id, params);
    }

    private _closePopupTimer: number | null = null;
    private _closePopup(timeout: number = 0): void {
        if (!this._formulaPopupSrv.popupInfo) {
            return;
        }

        if (timeout === 0) {
            this._commandSrv.executeCommand(CloseFormulaPopupOperation.id);
        } else {
            this._closePopupTimer = window.setTimeout(() => this._closePopup(0), timeout);
        }
    }
}
