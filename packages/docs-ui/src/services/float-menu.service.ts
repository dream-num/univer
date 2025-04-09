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

import type { DocumentDataModel, IDisposable, ITextRangeParam, Nullable } from '@univerjs/core';
import type { INodePosition, IRenderContext, IRenderModule, ITextRangeWithStyle } from '@univerjs/engine-render';
import { DataStreamTreeTokenType, deepCompare, Disposable, Inject, isInternalEditorID, IUniverInstanceService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { ComponentManager } from '@univerjs/ui';
import { FloatToolbar } from '../components/float-toolbar/FloatToolbar';
import { DocCanvasPopManagerService } from './doc-popup-manager.service';
import { DocSelectionRenderService } from './selection/doc-selection-render.service';

const FLOAT_MENU_COMPONENT_KEY = 'univer.doc.float-menu';

function isInSameLine(startNodePosition: Nullable<INodePosition>, endNodePosition: Nullable<INodePosition>) {
    if (startNodePosition == null || endNodePosition == null) {
        return false;
    }
    const { glyph: _startGlyph, ...startRest } = startNodePosition;
    const { glyph: _endGlyph, ...endRest } = endNodePosition;

    return deepCompare(startRest, endRest);
}

const SKIP_SYMBOLS: string[] = [
    DataStreamTreeTokenType.CUSTOM_BLOCK,
    DataStreamTreeTokenType.PARAGRAPH,
];

export class DocFloatMenuService extends Disposable implements IRenderModule {
    private _floatMenu: Nullable<{ disposable: IDisposable; start: number; end: number }> = null;

    constructor(
        private _context: IRenderContext<DocumentDataModel>,
        @Inject(DocSelectionManagerService) private readonly _docSelectionManagerService: DocSelectionManagerService,
        @Inject(DocCanvasPopManagerService) private readonly _docCanvasPopManagerService: DocCanvasPopManagerService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DocSelectionRenderService) private readonly _docSelectionRenderService: DocSelectionRenderService
    ) {
        super();

        if (isInternalEditorID(this._context.unitId)) {
            return;
        }
        this._registerFloatMenu();
        this._initSelectionChange();

        this.disposeWithMe(() => {
            this._hideFloatMenu();
        });
    }

    get floatMenu() {
        return this._floatMenu;
    }

    private _registerFloatMenu() {
        this.disposeWithMe(this._componentManager.register(FLOAT_MENU_COMPONENT_KEY, FloatToolbar));
    }

    private _initSelectionChange() {
        this.disposeWithMe(this._docSelectionRenderService.onSelectionStart$.subscribe(() => {
            this._hideFloatMenu();
        }));

        this.disposeWithMe(this._docSelectionManagerService.textSelection$.subscribe((selection) => {
            const { unitId, textRanges } = selection;
            if (unitId !== this._context.unitId) {
                return;
            }

            const range = (textRanges.length > 0) && textRanges.find((range) => !range.collapsed);
            if (range) {
                if (range.startOffset === this._floatMenu?.start && range.endOffset === this._floatMenu?.end) {
                    return;
                }
                this._hideFloatMenu();
                this._showFloatMenu(unitId, range);
                return;
            }

            this._hideFloatMenu();
        }));
    }

    private _hideFloatMenu() {
        this._floatMenu?.disposable.dispose();
        this._floatMenu = null;
    }

    private _showFloatMenu(unitId: string, range: ITextRangeParam) {
        const documentDataModel = this._univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        if (!documentDataModel || documentDataModel.getDisabled()) {
            return;
        }

        const token = documentDataModel.getBody()?.dataStream[range.startOffset];
        if (range.endOffset - range.startOffset === 1 && token && SKIP_SYMBOLS.includes(token)) {
            return;
        }
        const wholeCustomRanges = documentDataModel.getBody()?.customRanges?.filter((range) => range.wholeEntity);
        if (wholeCustomRanges?.some((customRange) => customRange.startIndex === range.startOffset && customRange.endIndex === range.endOffset - 1)) {
            return;
        }

        this._floatMenu = {
            disposable: this._docCanvasPopManagerService.attachPopupToRange(
                range,
                {
                    componentKey: FLOAT_MENU_COMPONENT_KEY,
                    direction: range.direction === 'backward' || isInSameLine((range as ITextRangeWithStyle).startNodePosition, (range as ITextRangeWithStyle).endNodePosition) ? 'top-center' : 'bottom-center',
                    offset: [0, 4],
                },
                unitId
            ),
            start: range.startOffset,
            end: range.endOffset,
        };

        return toDisposable(() => this._hideFloatMenu());
    }
}
