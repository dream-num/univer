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

import type { DocumentDataModel, ITextRangeParam } from '@univerjs/core';
import type { Documents, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import {
    DEFAULT_EMPTY_DOCUMENT_VALUE,
    Disposable,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DocumentBlockRangeType,
    FOCUSING_COMMON_DRAWINGS,
    FOCUSING_DOC,
    ICommandService,
    IContextService,
    Inject,
    IUniverInstanceService,
    Optional,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { ContextMenuPosition, IContextMenuService, IContextMenuShortcutService } from '@univerjs/ui';
import { DocEventManagerService } from '../../services/doc-event-manager.service';

const SKIP_UNIT_IDS = [
    DEFAULT_EMPTY_DOCUMENT_VALUE,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
];

/**
 * This controller subscribe to context menu events in sheet rendering views and invoke context menu at a correct
 * position and with correct menu type.
 */
export class DocContextMenuRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @IContextMenuService private readonly _contextMenuService: IContextMenuService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocEventManagerService) private readonly _docEventManagerService: DocEventManagerService,
        @Inject(DocSelectionManagerService) private readonly _docSelectionManagerService: DocSelectionManagerService,
        @IContextService private readonly _contextService: IContextService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Optional(IContextMenuShortcutService) shortcutService?: IContextMenuShortcutService
    ) {
        super();

        if (!SKIP_UNIT_IDS.includes(this._context.unitId)) {
            this._initPointerDown();
            this._initEditChange();
            if (shortcutService) {
                this.disposeWithMe(shortcutService.register((target) => this._resolveKeyboardMenu(target)));
            }
        }
    }

    private _resolveKeyboardMenu(target: HTMLElement): (() => boolean) | undefined {
        const canvas = this._context.engine.getCanvasElement();
        if (this._contextMenuService.disabled || this._univerInstanceService.getFocusedUnit() !== this._context.unit
            || (target !== canvas && !(target.matches('[data-u-comp="editor"]') && this._contextService.getContextValue(FOCUSING_DOC)))
            || this._isSelectionInCodeBlock()) {
            return;
        }

        return () => {
            const canvasRect = canvas.getBoundingClientRect();
            const rect = target.getBoundingClientRect();
            const clientX = target === canvas ? rect.left + rect.width / 2 : rect.left;
            const clientY = target === canvas ? rect.top + rect.height / 2 : rect.bottom;
            this._setContextMenuParagraph(clientX - canvasRect.left, clientY - canvasRect.top);
            const position = this._contextService.getContextValue(FOCUSING_COMMON_DRAWINGS)
                ? ContextMenuPosition.DRAWING
                : ContextMenuPosition.MAIN_AREA;
            this._contextMenuService.triggerContextMenu({ clientX, clientY, stopPropagation() {} }, position, { autoFocus: true });
            return true;
        };
    }

    private _setContextMenuParagraph(offsetX: number, offsetY: number): void {
        const bound = this._docEventManagerService.getParagraphByOffset(offsetX, offsetY);
        const segmentId = bound?.segmentId ?? '';
        const paragraph = bound && this._context.unit.getSelfOrHeaderFooterModel(segmentId)?.getBody()?.paragraphs?.find((item) => item.startIndex === bound.startIndex);
        this._docEventManagerService.contextMenuParagraph = paragraph?.paragraphId
            ? { unitId: this._context.unitId, segmentId, paragraphId: paragraph.paragraphId }
            : null;
    }

    private _initPointerDown(): void {
        const documentsPointerDownObserver = (this._context?.mainComponent as Documents)?.onPointerDown$;
        // Content range context menu
        const documentsSubscription = documentsPointerDownObserver.subscribeEvent((event) => {
            if (event.button === 2) {
                if (this._docEventManagerService.isPointerOnNonChecklistBullet(event.offsetX, event.offsetY)) {
                    return;
                }
                if (this._isSelectionInCodeBlock()) {
                    return;
                }

                this._setContextMenuParagraph(event.offsetX, event.offsetY);
                const position = this._contextService.getContextValue(FOCUSING_COMMON_DRAWINGS)
                    ? ContextMenuPosition.DRAWING
                    : ContextMenuPosition.MAIN_AREA;
                this._contextMenuService.triggerContextMenu(event, position);
            }
        });
        this.disposeWithMe(documentsSubscription);
    }

    private _initEditChange(): void {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command) => {
                if (command.id === RichTextEditingMutation.id) {
                    if (this._contextMenuService.visible) {
                        this._contextMenuService.hideContextMenu();
                    }
                }
            })
        );
    }

    private _isSelectionInCodeBlock(): boolean {
        const documentDataModel = this._univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const blockRanges = documentDataModel?.getBody()?.blockRanges?.filter((range) => range.blockType === DocumentBlockRangeType.CODE) ?? [];
        const textRanges = this._docSelectionManagerService.getTextRanges() ?? [];
        if (!blockRanges.length || !textRanges.length) {
            return false;
        }

        return blockRanges.some((blockRange) => textRanges.some((range) => isRangeIntersectingBlock(range, blockRange.startIndex, blockRange.endIndex)));
    }
}

function isRangeIntersectingBlock(range: ITextRangeParam, startIndex: number, endIndex: number): boolean {
    return Math.max(range.startOffset, startIndex) <= Math.min(range.endOffset, endIndex);
}
