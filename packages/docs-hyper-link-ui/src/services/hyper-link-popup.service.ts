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

import type { DocumentDataModel, ITextRange, Nullable } from '@univerjs/core';
import { Disposable, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { TextSelectionManagerService } from '@univerjs/docs';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';
import { DocHyperLinkModel } from '@univerjs/docs-hyper-link';
import { DocHyperLinkEdit } from '../views/hyper-link-edit';
import { DocLinkPopup } from '../views/hyper-link-popup';

export interface ILinkInfo {
    unitId: string; linkId: string; rangeIndex: number;
}

export class DocHyperLinkPopupService extends Disposable {
    private readonly _editingLink$ = new BehaviorSubject<Nullable<ILinkInfo>>(null);
    private readonly _showingLink$ = new BehaviorSubject<Nullable<ILinkInfo>>(null);
    readonly editingLink$ = this._editingLink$.asObservable();
    readonly showingLink$ = this._showingLink$.asObservable();

    private _editPopup: Nullable<IDisposable> = null;
    private _infoPopup: Nullable<IDisposable> = null;

    constructor(
        @Inject(DocCanvasPopManagerService) private readonly _docCanvasPopupManagerService: DocCanvasPopManagerService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @Inject(DocHyperLinkModel) private readonly _docHyperLinkModel: DocHyperLinkModel,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }

    get editing() {
        return this._editingLink$.value;
    }

    get showing() {
        return this._showingLink$.value;
    }

    showEditPopup(linkInfo: Nullable<ILinkInfo>): Nullable<IDisposable> {
        if (this._editPopup) {
            this._editPopup.dispose();
        }
        this._editingLink$.next(linkInfo);
        let activeRange: Nullable<ITextRange> = this._textSelectionManagerService.getActiveRange();
        if (linkInfo) {
            const { unitId, linkId } = linkInfo;
            const doc = this._univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
            const range = doc?.getBody()?.customRanges?.find((i) => i.rangeId === linkId);
            if (range) {
                activeRange = {
                    collapsed: false,
                    startOffset: range.startIndex,
                    endOffset: range.endIndex + 1,
                };
                this._textSelectionManagerService.replaceTextRanges([{
                    startOffset: range.startIndex,
                    endOffset: range.endIndex + 1,
                }]);
            }
        }

        if (activeRange) {
            this._editPopup = this._docCanvasPopupManagerService.attachPopupToRange(
                activeRange,
                {
                    componentKey: DocHyperLinkEdit.componentKey,
                    direction: 'bottom',
                }
            );
            return this._editPopup;
        }

        return null;
    }

    hideEditPopup() {
        this._editingLink$.next(null);
        this._editPopup?.dispose();
    }

    showInfoPopup(info: ILinkInfo): Nullable<IDisposable> {
        const { linkId, unitId, rangeIndex } = info;
        if (
            this.showing?.linkId === linkId &&
            this.showing?.unitId === unitId &&
            this.showing.rangeIndex === rangeIndex
        ) {
            return;
        }

        if (this._infoPopup) {
            this._infoPopup.dispose();
        }
        const link = this._docHyperLinkModel.getLink(unitId, linkId);
        const doc = this._univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        if (!doc || !link) {
            return;
        }
        const range = doc.getBody()?.customRanges?.[rangeIndex];
        this._showingLink$.next({ unitId, linkId, rangeIndex });
        if (!range) {
            return;
        }

        this._infoPopup = this._docCanvasPopupManagerService.attachPopupToRange(
            {
                collapsed: false,
                startOffset: range.startIndex,
                endOffset: range.endIndex + 1,
            },
            {
                componentKey: DocLinkPopup.componentKey,
                direction: 'top',
                closeOnSelfTarget: true,
            }
        );
        return this._infoPopup;
    }

    hideInfoPopup() {
        this._showingLink$.next(null);
        this._infoPopup?.dispose();
    }
}
