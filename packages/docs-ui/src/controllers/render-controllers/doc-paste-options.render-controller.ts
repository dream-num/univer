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

import type { DocumentDataModel, IDisposable } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, IContextService, Inject, isInternalEditorID } from '@univerjs/core';
import { MOBILE_UI_MODE } from '@univerjs/ui';
import { IDocClipboardService } from '../../services/clipboard/clipboard.service';
import { DocCanvasPopManagerService } from '../../services/doc-popup-manager.service';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';
import { DOC_PASTE_OPTIONS_COMPONENT } from '../../views/DocPasteOptions';

export class DocPasteOptionsRenderController extends Disposable implements IRenderModule {
    private _popup: IDisposable | undefined;

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @IDocClipboardService private readonly _clipboard: IDocClipboardService,
        @Inject(DocSelectionRenderService) selection: DocSelectionRenderService,
        @Inject(DocCanvasPopManagerService) popupManager: DocCanvasPopManagerService,
        @IContextService contextService: IContextService
    ) {
        super();
        if (isInternalEditorID(_context.unitId)) {
            return;
        }
        const mobile = contextService.getContextValue(MOBILE_UI_MODE) === true;
        this.disposeWithMe(selection.onKeydown$.subscribe(({ event }) => {
            const key = event as KeyboardEvent;
            if ((key.ctrlKey || key.metaKey) && key.shiftKey && key.key.toLowerCase() === 'v') {
                this._clipboard.setNextPasteMode('text');
            } else if (!['Control', 'Meta', 'Shift', 'Alt'].includes(key.key)) {
                this._clipboard.setNextPasteMode('source');
                this._clipboard.dismissPasteOptions();
            }
        }));
        this.disposeWithMe(selection.onInputBefore$.subscribe(() => this._clipboard.dismissPasteOptions()));
        this.disposeWithMe(selection.onPointerDown$.subscribe(() => {
            this._clipboard.setNextPasteMode('source');
            // A mobile pointer-down may start a pan. Actual selection changes
            // already invalidate the session in the clipboard service.
            if (!mobile) {
                this._clipboard.dismissPasteOptions();
            }
        }));
        this.disposeWithMe(selection.onBlur$.subscribe(() => this._clipboard.setNextPasteMode('source')));
        this.disposeWithMe(this._clipboard.pasteOptions$.subscribe((state) => {
            this._popup?.dispose();
            this._popup = undefined;
            if (state?.unitId !== this._context.unitId) {
                return;
            }
            this._popup = popupManager.attachPopupToRange(state.range, {
                componentKey: DOC_PASTE_OPTIONS_COMPONENT,
                direction: 'bottom-left',
                rangeAnchor: 'selection-end',
                requiresStableLayout: false,
                hideOnInvisible: !mobile,
                extraProps: { unitId: state.unitId },
                offset: [0, 6],
                onClickOutside: mobile ? undefined : () => this._clipboard.dismissPasteOptions(),
            }, state.unitId);
        }));
        this.disposeWithMe(() => {
            this._popup?.dispose();
            this._clipboard.dismissPasteOptions();
        });
    }
}
