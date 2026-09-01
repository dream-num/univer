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

import { Disposable, DocumentDataModel, Inject, IPermissionService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { canEditDocumentTargets, DocSelectionManagerService, getDocumentEntityParentPermissionObjectIds, getDocumentEntityPermissionObjectId } from '@univerjs/docs';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { BehaviorSubject } from 'rxjs';
import { DocHyperLinkEdit } from '../views/DocHyperLinkEdit';
import { DocLinkPopup } from '../views/DocLinkPopup';

export interface ILinkInfo {
    unitId: string;
    linkId: string;
    segmentId?: string;
    segmentPage?: number;
    startIndex: number;
    endIndex: number;
}

type LinkPopupDisposable = ReturnType<DocCanvasPopManagerService['attachPopupToRange']>;

export class DocHyperLinkPopupService extends Disposable {
    private readonly _editingLink$ = new BehaviorSubject<ILinkInfo | null>(null);
    private readonly _showingLink$ = new BehaviorSubject<ILinkInfo | null>(null);
    readonly editingLink$ = this._editingLink$.asObservable();
    readonly showingLink$ = this._showingLink$.asObservable();

    private _editPopup: LinkPopupDisposable | null = null;
    private _editPopupUnitId: string | null = null;
    private _infoPopup: LinkPopupDisposable | null = null;
    private _infoPopupSuppressed = false;
    private _infoPopupSuppressionTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(
        @Inject(DocCanvasPopManagerService) private readonly _docCanvasPopupManagerService: DocCanvasPopManagerService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this.disposeWithMe(() => {
            if (this._infoPopupSuppressionTimer !== null) {
                clearTimeout(this._infoPopupSuppressionTimer);
            }
            this._editingLink$.complete();
            this._showingLink$.complete();
        });

        this.disposeWithMe(this._permissionService.permissionPointUpdate$.subscribe(() => {
            const editing = this.editing;
            if (editing && !this.canEditLink(editing.unitId, editing)) {
                this.hideEditPopup();
            }
            const showing = this.showing;
            if (showing) {
                this._showingLink$.next({ ...showing });
            }
        }));
        this.disposeWithMe(this._renderManagerService.disposed$.subscribe((unitId) => {
            if (this._editPopupUnitId === unitId) {
                this.hideEditPopup();
            }
            if (this.showing?.unitId === unitId) {
                this.hideInfoPopup();
            }
        }));
    }

    override dispose(): void {
        this.hideEditPopup();
        this.hideInfoPopup();
        super.dispose();
    }

    get editing() {
        return this._editingLink$.value;
    }

    get showing() {
        return this._showingLink$.value;
    }

    showEditPopup(unitId: string, linkInfo: ILinkInfo | null): LinkPopupDisposable | null {
        if (!this.canEditLink(unitId, linkInfo)) {
            return null;
        }
        if (this._editPopup) {
            this._editPopup.dispose();
            this._editPopup = null;
            this._editPopupUnitId = null;
        }
        this._editingLink$.next(linkInfo);
        const textRanges = this._textSelectionManagerService.getTextRanges({ unitId, subUnitId: unitId });
        let activeRange = textRanges?.[textRanges.length - 1];

        if (linkInfo) {
            const { segmentId, segmentPage, startIndex, endIndex } = linkInfo;
            activeRange = {
                collapsed: false,
                startOffset: startIndex,
                endOffset: endIndex + 1,
                segmentId,
                segmentPage,
            };

            this._textSelectionManagerService.replaceDocRanges([{
                startOffset: startIndex,
                endOffset: endIndex + 1,
            }]);
        }

        if (activeRange) {
            this._editPopup = this._docCanvasPopupManagerService.attachPopupToRange(
                activeRange,
                {
                    componentKey: DocHyperLinkEdit.componentKey,
                    direction: 'bottom',
                    offset: [0, 10],
                },
                unitId
            );
            this._editPopupUnitId = unitId;
            return this._editPopup;
        }

        return null;
    }

    hideEditPopup() {
        this._editingLink$.next(null);
        this._editPopup?.dispose();
        this._editPopup = null;
        this._editPopupUnitId = null;
    }

    showInfoPopup(info: ILinkInfo): LinkPopupDisposable | null | undefined {
        if (this._infoPopupSuppressed) {
            return;
        }

        const { linkId, unitId, segmentId, segmentPage, startIndex, endIndex } = info;
        if (
            this.showing?.linkId === linkId &&
            this.showing?.unitId === unitId &&
            this.showing?.segmentId === segmentId &&
            this.showing?.segmentPage === segmentPage &&
            this.showing?.startIndex === startIndex &&
            this.showing?.endIndex === endIndex
        ) {
            return;
        }

        if (this._infoPopup) {
            this._infoPopup.dispose();
            this._infoPopup = null;
        }
        const doc = this._univerInstanceService.getUnit(unitId, UniverInstanceType.UNIVER_DOC);
        if (!(doc instanceof DocumentDataModel)) {
            return;
        }
        this._showingLink$.next({ unitId, linkId, segmentId, segmentPage, startIndex, endIndex });

        this._infoPopup = this._docCanvasPopupManagerService.attachPopupToRange(
            {
                collapsed: false,
                startOffset: startIndex,
                endOffset: endIndex + 1,
                segmentId,
                segmentPage,
            },
            {
                componentKey: DocLinkPopup.componentKey,
                direction: 'top-center',
                multipleDirection: 'top',
                offset: [0, 10],
                onClickOutside: () => {
                    this.hideInfoPopup();
                },
            },
            unitId
        );
        return this._infoPopup;
    }

    hideInfoPopup() {
        this._showingLink$.next(null);
        this._infoPopup?.dispose();
        this._infoPopup = null;
    }

    hideInfoPopupOnPointerDown() {
        this._infoPopupSuppressed = true;
        if (this._infoPopupSuppressionTimer !== null) {
            clearTimeout(this._infoPopupSuppressionTimer);
        }

        this.hideInfoPopup();
        this._infoPopupSuppressionTimer = setTimeout(() => {
            this._infoPopupSuppressed = false;
            this._infoPopupSuppressionTimer = null;
        }, 0);
    }

    canEditLink(unitId: string, linkInfo: ILinkInfo | null): boolean {
        const document = this._univerInstanceService.getUnit(unitId, UniverInstanceType.UNIVER_DOC);
        if (!(document instanceof DocumentDataModel)) {
            return false;
        }
        if (!linkInfo) {
            return canEditDocumentTargets(this._permissionService, unitId, []);
        }
        const segmentId = linkInfo.segmentId ?? '';
        return canEditDocumentTargets(this._permissionService, unitId, [
            ...getDocumentEntityParentPermissionObjectIds(document, segmentId, 'custom-range', linkInfo.linkId),
            getDocumentEntityPermissionObjectId(segmentId, 'custom-range', linkInfo.linkId),
        ]);
    }
}
