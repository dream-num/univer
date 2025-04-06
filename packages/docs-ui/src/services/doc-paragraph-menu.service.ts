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

import type { DocumentDataModel, INeedCheckDisposable } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, Inject, isInternalEditorID } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { ComponentManager } from '@univerjs/ui';
import { DocEventManagerService } from './doc-event-manager.service';
import { DocCanvasPopManagerService } from './doc-popup-manager.service';

export class DocParagraphMenuService extends Disposable implements IRenderModule {
    private _paragrahMenu: {
        index: number;
        disposable: INeedCheckDisposable;
    } | null = null;

    constructor(
        private _context: IRenderContext<DocumentDataModel>,
        @Inject(DocSelectionManagerService) private _docSelectionManagerService: DocSelectionManagerService,
        @Inject(DocEventManagerService) private _docEventManagerService: DocEventManagerService,
        @Inject(DocCanvasPopManagerService) private _docPopupManagerService: DocCanvasPopManagerService,
        @Inject(ComponentManager) private _componentManager: ComponentManager
    ) {
        super();

        if (isInternalEditorID(this._context.unitId)) {
            return;
        }

        this._init();
    }

    private _init() {
        this.disposeWithMe(
            this._docEventManagerService.hoverParagraph$.subscribe((paragraph) => {
                if (paragraph) {
                    this.showParagraphMenu(paragraph.paragraph.paragraphStart);
                    return;
                }

                this.hideParagraphMenu();
            })
        );
    }

    showParagraphMenu(paragraphStart: number) {
        if (this._paragrahMenu?.index === paragraphStart) {
            return;
        }

        this.hideParagraphMenu();

        const disposable = this._docPopupManagerService.attachPopupToRange(
            {
                startOffset: paragraphStart,
                endOffset: paragraphStart + 1,
                collapsed: false,
            },
            {
                componentKey: 'doc.paragraph.menu',
                direction: 'left',
                customEnterLeave: true,
            },
            this._context.unitId
        );

        this._paragrahMenu = {
            index: paragraphStart,
            disposable,
        };
    }

    hideParagraphMenu() {
        if (this._paragrahMenu && this._paragrahMenu.disposable.canDispose()) {
            this._paragrahMenu.disposable.dispose();
            this._paragrahMenu = null;
        }
    }
}
