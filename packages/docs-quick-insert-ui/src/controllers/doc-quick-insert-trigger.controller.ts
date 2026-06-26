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

import type { DocumentDataModel } from '@univerjs/core';
import type {
    IDeleteTextCommandParams,
    IInsertTextCommandParams,
    IRichTextEditingMutationParams,
} from '@univerjs/docs';
import type { IIMEInputCommandParams, IMoveCursorOperationParams } from '@univerjs/docs-ui';
import {
    DeleteDirection,
    Direction,
    Disposable,
    ICommandService,
    Inject,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DeleteTextCommand,
    DocSelectionManagerService,
    InsertTextCommand,
    RichTextEditingMutation,
} from '@univerjs/docs';
import { DeleteLeftCommand, IMEInputCommand, MoveCursorOperation } from '@univerjs/docs-ui';
import { IShortcutService, KeyCode } from '@univerjs/ui';
import {
    CloseQuickInsertPopupOperation,
    ShowQuickInsertPopupOperation,
} from '../commands/operations/quick-insert-popup.operation';
import { builtInMenuCommandIds, textMenu } from '../menu/menu';
import { DocQuickInsertPopupService } from '../services/doc-quick-insert-popup.service';

export class DocQuickInsertTriggerController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @Inject(DocQuickInsertPopupService) private readonly _docQuickInsertPopupService: DocQuickInsertPopupService,
        @Inject(IShortcutService) private readonly _shortcutService: IShortcutService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this.disposeWithMe(this._shortcutService.registerShortcut({
            id: CloseQuickInsertPopupOperation.id,
            binding: KeyCode.ESC,
            preconditions: () => Boolean(this._docQuickInsertPopupService.editPopup),
            priority: 1000,
        }));

        this._initTrigger();
        this._initMenuHandler();
    }

    // eslint-disable-next-line max-lines-per-function
    private _initTrigger() {
        this.disposeWithMe(
            // eslint-disable-next-line complexity, max-lines-per-function
            this._commandService.onCommandExecuted((commandInfo) => {
                const documentDataModel = this._univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
                if (documentDataModel?.getDisabled()) {
                    return;
                }

                if (commandInfo.id === InsertTextCommand.id) {
                    const params = commandInfo.params as IInsertTextCommandParams;
                    if (this._docQuickInsertPopupService.editPopup) {
                        this._docQuickInsertPopupService.setInputOffset({
                            start: this._docQuickInsertPopupService.inputOffset.start,
                            end: params.range.endOffset + 1,
                        });
                        return;
                    }

                    const activeRange = this._textSelectionManagerService.getActiveTextRange();
                    if (!activeRange) {
                        return;
                    }

                    const popup = this._docQuickInsertPopupService.resolvePopup(params.body.dataStream);
                    if (!popup) {
                        return;
                    }

                    const available = popup.preconditions ? popup.preconditions(params) : true;
                    if (!available) {
                        return;
                    }

                    this._docQuickInsertPopupService.setInputOffset({ start: activeRange.startOffset - 1, end: activeRange.startOffset });

                    setTimeout(() => {
                        this._commandService.executeCommand(ShowQuickInsertPopupOperation.id, {
                            index: activeRange.startOffset - 1,
                            unitId: params.unitId,
                            popup,
                        });
                    }, 100);
                }

                if (commandInfo.id === IMEInputCommand.id) {
                    const params = commandInfo.params as IIMEInputCommandParams;
                    if (!this._docQuickInsertPopupService.isComposing && params.isCompositionStart) {
                        this._docQuickInsertPopupService.setIsComposing(true);
                    }

                    if (this._docQuickInsertPopupService.isComposing && params.isCompositionEnd) {
                        this._docQuickInsertPopupService.setIsComposing(false);
                    }
                }

                if (commandInfo.id === RichTextEditingMutation.id) {
                    const params = commandInfo.params as IRichTextEditingMutationParams;
                    if (params.isCompositionEnd) {
                        const endOffset = params.textRanges?.[0]?.endOffset;
                        if (endOffset) {
                            this._docQuickInsertPopupService.setInputOffset({ start: this._docQuickInsertPopupService.inputOffset.start, end: endOffset });
                        }
                    }
                }

                if (commandInfo.id === DeleteTextCommand.id) {
                    const params = commandInfo.params as IDeleteTextCommandParams;
                    if (this._docQuickInsertPopupService.editPopup && params.direction === DeleteDirection.LEFT) {
                        const len = params.len ?? 0;
                        this._docQuickInsertPopupService.setInputOffset({ start: this._docQuickInsertPopupService.inputOffset.start, end: params.range.endOffset - len });
                    }
                }

                if (commandInfo.id === MoveCursorOperation.id) {
                    const params = commandInfo.params as IMoveCursorOperationParams;

                    if (params.direction === Direction.LEFT || params.direction === Direction.RIGHT) {
                        this._docQuickInsertPopupService.editPopup && this._commandService.executeCommand(CloseQuickInsertPopupOperation.id);
                    }
                }

                if (commandInfo.id === DeleteLeftCommand.id) {
                    const activeRange = this._textSelectionManagerService.getActiveTextRange();
                    if (!this._docQuickInsertPopupService.editPopup || !activeRange) {
                        return;
                    }

                    if (activeRange.endOffset <= this._docQuickInsertPopupService.editPopup.anchor) {
                        this._commandService.executeCommand(CloseQuickInsertPopupOperation.id);
                    }
                }
            })
        );
    }

    private _initMenuHandler() {
        this.disposeWithMe(this._docQuickInsertPopupService.onMenuSelected((menu) => {
            if (menu.id === textMenu.id) {
                return;
            }

            if (builtInMenuCommandIds.has(menu.id)) {
                this._commandService.executeCommand(menu.id);
            }
        }));
    }
}
