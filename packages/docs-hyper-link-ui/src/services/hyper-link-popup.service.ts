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

import type { DocumentDataModel, IDisposable, ITextRangeParam, Nullable } from '@univerjs/core';
import { Disposable, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import { BehaviorSubject } from 'rxjs';
import { DocHyperLinkEdit } from '../views/hyper-link-edit';
import { DocLinkPopup } from '../views/hyper-link-popup';

export interface ILinkInfo {
    unitId: string;
    linkId: string;
    segmentId?: string;
    segmentPage?: number;
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
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this.disposeWithMe(() => {
            this._editingLink$.complete();
            this._showingLink$.complete();
        });
    }

    get editing() {
        return this._editingLink$.value;
    }

    get showing() {
        return this._showingLink$.value;
    }

    showEditPopup(unitId: string, linkInfo: Nullable<ILinkInfo>): Nullable<IDisposable> {
        if (this._editPopup) {
            this._editPopup.dispose();
        }
        this._editingLink$.next(linkInfo);
        let activeRange: Nullable<ITextRangeParam> = this._textSelectionManagerService.getActiveTextRange();
        if (linkInfo) {
            const { unitId, linkId, segmentId, segmentPage } = linkInfo;
            const doc = this._univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
            const range = doc?.getSelfOrHeaderFooterModel(segmentId)?.getBody()?.customRanges?.find((i) => i.rangeId === linkId);
            if (range) {
                activeRange = {
                    collapsed: false,
                    startOffset: range.startIndex,
                    endOffset: range.endIndex + 1,
                    segmentId,
                    segmentPage,
                };

                this._textSelectionManagerService.replaceDocRanges([{
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
                },
                unitId
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
        const { linkId, unitId, segmentId, segmentPage } = info;
        if (
            this.showing?.linkId === linkId &&
            this.showing?.unitId === unitId &&
            this.showing?.segmentId === segmentId &&
            this.showing?.segmentPage === segmentPage
        ) {
            return;
        }

        if (this._infoPopup) {
            this._infoPopup.dispose();
        }
        const doc = this._univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        if (!doc) {
            return;
        }
        const range = doc.getSelfOrHeaderFooterModel(info.segmentId).getBody()?.customRanges?.find((i) => i.rangeId === linkId);
        this._showingLink$.next({ unitId, linkId, segmentId, segmentPage });
        if (!range) {
            return;
        }

        this._infoPopup = this._docCanvasPopupManagerService.attachPopupToRange(
            {
                collapsed: false,
                startOffset: range.startIndex,
                endOffset: range.endIndex + 1,
                segmentId: info.segmentId,
                segmentPage: info.segmentPage,
            },
            {
                componentKey: DocLinkPopup.componentKey,
                direction: 'top-center',
                multipleDirection: 'top',
                onClickOutside: () => {
                    this.hideInfoPopup();
                },
            },
            info.unitId
        );
        return this._infoPopup;
    }

    hideInfoPopup() {
        this._showingLink$.next(null);
        this._infoPopup?.dispose();
    }
}
