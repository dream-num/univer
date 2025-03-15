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

import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IDeleteCommandParams, IInsertCommandParams, IMoveCursorOperationParams } from '@univerjs/docs-ui';
import { DeleteDirection, Direction, Disposable, ICommandService, Inject } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { DeleteCommand, DeleteLeftCommand, InsertCommand, MoveCursorOperation } from '@univerjs/docs-ui';
import { IShortcutService, KeyCode } from '@univerjs/ui';
import { CloseQuickInsertPopupOperation, ShowQuickInsertPopupOperation } from '../commands/operations/quick-insert-popup.operation';
import { DocQuickInsertPopupService } from '../services/doc-quick-insert-popup.service';
import { builtInMenuCommandIds, textMenu } from './built-in-menus';

export class DocQuickInsertTriggerController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @Inject(DocQuickInsertPopupService) private readonly _docQuickInsertPopupService: DocQuickInsertPopupService,
        @Inject(IShortcutService) private readonly _shortcutService: IShortcutService
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

    private _initTrigger() {
        this.disposeWithMe(
            // eslint-disable-next-line complexity
            this._commandService.onCommandExecuted((commandInfo) => {
                const { _docQuickInsertPopupService, _textSelectionManagerService, _commandService } = this;
                if (commandInfo.id === InsertCommand.id) {
                    const params = commandInfo.params as IInsertCommandParams;
                    if (_docQuickInsertPopupService.editPopup) {
                        _docQuickInsertPopupService.setInputOffset({
                            start: _docQuickInsertPopupService.inputOffset.start,
                            end: params.range.endOffset + 1,
                        });
                        return;
                    }

                    const activeRange = _textSelectionManagerService.getActiveTextRange();
                    if (!activeRange) {
                        return;
                    }

                    const popup = _docQuickInsertPopupService.resolvePopup(params.body.dataStream);
                    if (!popup) {
                        return;
                    }

                    const available = popup.preconditions ? popup.preconditions(params) : true;
                    if (!available) {
                        return;
                    }

                    _docQuickInsertPopupService.setInputOffset({ start: activeRange.startOffset - 1, end: activeRange.startOffset });

                    setTimeout(() => {
                        _commandService.executeCommand(ShowQuickInsertPopupOperation.id, {
                            index: activeRange.startOffset - 1,
                            unitId: params.unitId,
                            popup,
                        });
                    }, 100);
                }

                if (commandInfo.id === RichTextEditingMutation.id) {
                    const params = commandInfo.params as IRichTextEditingMutationParams;
                    if (params.isCompositionEnd) {
                        const endOffset = params.textRanges?.[0]?.endOffset;
                        if (endOffset) {
                            _docQuickInsertPopupService.setInputOffset({ start: _docQuickInsertPopupService.inputOffset.start, end: endOffset });
                        }
                    }
                }

                if (commandInfo.id === DeleteCommand.id) {
                    const params = commandInfo.params as IDeleteCommandParams;
                    if (_docQuickInsertPopupService.editPopup && params.direction === DeleteDirection.LEFT) {
                        const len = params.len ?? 0;
                        _docQuickInsertPopupService.setInputOffset({ start: _docQuickInsertPopupService.inputOffset.start, end: params.range.endOffset - len });
                    }
                }

                if (commandInfo.id === MoveCursorOperation.id) {
                    const params = commandInfo.params as IMoveCursorOperationParams;

                    if (params.direction === Direction.LEFT || params.direction === Direction.RIGHT) {
                        _docQuickInsertPopupService.editPopup && _commandService.executeCommand(CloseQuickInsertPopupOperation.id);
                    }
                }

                if (commandInfo.id === DeleteLeftCommand.id) {
                    const activeRange = _textSelectionManagerService.getActiveTextRange();
                    if (!_docQuickInsertPopupService.editPopup || !activeRange) {
                        return;
                    }

                    if (activeRange.endOffset <= _docQuickInsertPopupService.editPopup.anchor) {
                        _commandService.executeCommand(CloseQuickInsertPopupOperation.id);
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
