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

import type { DocumentDataModel, INeedCheckDisposable, IParagraphRange, Nullable } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { IMutiPageParagraphBound } from './doc-event-manager.service';
import { Disposable, Inject, isInternalEditorID } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { DocumentEditArea } from '@univerjs/engine-render';
import { combineLatest, first, throttleTime } from 'rxjs';
import { VIEWPORT_KEY } from '../basics/docs-view-key';
import { DocEventManagerService } from './doc-event-manager.service';
import { DocCanvasPopManagerService } from './doc-popup-manager.service';
import { DocFloatMenuService } from './float-menu.service';

export class DocParagraphMenuService extends Disposable implements IRenderModule {
    private _paragrahMenu: {
        paragraph: IParagraphRange;
        disposable: INeedCheckDisposable;
        active: boolean;
    } | null = null;

    get activeParagraph() {
        return this._paragrahMenu?.paragraph;
    }

    constructor(
        private _context: IRenderContext<DocumentDataModel>,
        @Inject(DocSelectionManagerService) private _docSelectionManagerService: DocSelectionManagerService,
        @Inject(DocEventManagerService) private _docEventManagerService: DocEventManagerService,
        @Inject(DocCanvasPopManagerService) private _docPopupManagerService: DocCanvasPopManagerService,
        @Inject(DocSkeletonManagerService) private _docSkeletonManagerService: DocSkeletonManagerService,
        @Inject(DocFloatMenuService) private _floatMenuService: DocFloatMenuService
    ) {
        super();

        if (isInternalEditorID(this._context.unitId)) {
            return;
        }

        this._init();
    }

    private _isCursorInActiveParagraph() {
        if (!this._paragrahMenu) {
            return false;
        }

        const activeTextRange = this._docSelectionManagerService.getActiveTextRange();
        if (!activeTextRange?.collapsed) {
            return false;
        }

        if (
            !activeTextRange?.collapsed ||
            activeTextRange.startOffset < this._paragrahMenu.paragraph.paragraphStart ||
            activeTextRange.startOffset > this._paragrahMenu.paragraph.paragraphEnd
        ) {
            return false;
        }

        return true;
    }

    setParagraphMenuActive(active: boolean) {
        if (this._paragrahMenu) {
            this._paragrahMenu.active = active;
            if (!this._isCursorInActiveParagraph()) {
                this._docSelectionManagerService.replaceDocRanges([{
                    startOffset: this._paragrahMenu.paragraph.paragraphStart,
                    endOffset: this._paragrahMenu.paragraph.paragraphStart,
                }]);
            }
        }
    }

    private _init() {
        const handleHoverParagraph = (paragraph: Nullable<IMutiPageParagraphBound>) => {
            const viewModel = this._docSkeletonManagerService.getViewModel();
            if (
                viewModel.getEditArea() === DocumentEditArea.BODY &&
                !this._floatMenuService.floatMenu &&
                !this._context.unit.getDisabled()
            ) {
                if (this._paragrahMenu?.active) {
                    return;
                }

                if (paragraph) {
                    this.showParagraphMenu(paragraph);
                    return;
                }
            }

            this.hideParagraphMenu(true);
        };

        this.disposeWithMe(
            combineLatest([this._docEventManagerService.hoverParagraphRealTime$, this._docEventManagerService.hoverParagraphLeft$])
                .pipe(throttleTime(16))
                .subscribe(([p, left]) => {
                    const paragraph = p ?? left;
                    handleHoverParagraph(paragraph);
                })
        );

        let lastScrollY = 0;
        this.disposeWithMe(this._context.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN)!.onScrollAfter$.subscribeEvent((e) => {
            if (lastScrollY === e.scrollY) {
                return;
            }

            lastScrollY = e.scrollY;
            this.hideParagraphMenu(true);
        }));

        this.disposeWithMe(this._docEventManagerService.clickCustomRanges$.subscribe(() => {
            this.hideParagraphMenu(true);
        }));
    }

    showParagraphMenu(paragraph: IMutiPageParagraphBound) {
        if (this._paragrahMenu?.paragraph.startIndex === paragraph.startIndex) {
            return;
        }

        this.hideParagraphMenu(true);
        const dataStream = this._context.unit.getBody()?.dataStream ?? '';
        const paragraphDataStream = paragraph ? dataStream.slice(paragraph.paragraphStart, paragraph.paragraphEnd) : '';
        const isOnlyImage = paragraphDataStream === '\b';
        const isEmptyParagraph = paragraphDataStream === '';
        const shouldHidden = isOnlyImage || isEmptyParagraph;

        if (shouldHidden) {
            return;
        }

        const disposable = this._docPopupManagerService.attachPopupToRect(
            paragraph.firstLine,
            {
                componentKey: 'doc.paragraph.menu',
                direction: 'left-center',
                onClickOutside: () => {
                    this._docSelectionManagerService.textSelection$.pipe(first()).subscribe(() => {
                        if (!this._isCursorInActiveParagraph()) {
                            this.hideParagraphMenu(true);
                        }
                    });
                },
                zIndex: 101,
            },
            this._context.unitId
        );

        this._paragrahMenu = {
            paragraph,
            disposable,
            active: false,
        };
    }

    hideParagraphMenu(force = false) {
        if (this._paragrahMenu && ((this._paragrahMenu.disposable.canDispose() || force))) {
            this._paragrahMenu.disposable.dispose();
            this._paragrahMenu = null;
        }
    }
}
