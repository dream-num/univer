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

import type { IDisposable } from '@univerjs/core';
import {
    Disposable,
    DocumentDataModel,
    ICommandService,
    IContextService,
    Inject,
    IPermissionService,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceType,
} from '@univerjs/core';
import { canEditDocumentTargets, DocSelectionManagerService, getDocumentEntityParentPermissionObjectIds, getDocumentEntityPermissionObjectId } from '@univerjs/docs';
import { DocCanvasPopManagerService, MOBILE_DOC_ELEMENT_MENU } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IDialogService, MOBILE_UI_MODE } from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';
import { DeleteDocHyperLinkCommand } from '../commands/commands/delete-link.command';
import { DocHyperLinkEdit } from '../views/DocHyperLinkEdit';
import { DocLinkPopup } from '../views/DocLinkPopup';
import { MobileDocHyperLinkEdit } from '../views/MobileDocHyperLinkEdit';
import { MobileDocLinkPopup } from '../views/MobileDocLinkPopup';

export interface ILinkInfo {
    unitId: string;
    linkId: string;
    segmentId?: string;
    segmentPage?: number;
    startIndex: number;
    endIndex: number;
}

const MOBILE_DOC_HYPER_LINK_EDITOR_DIALOG_ID = 'doc-mobile-hyper-link-editor';
const MOBILE_DOC_HYPER_LINK_VIEWER_DIALOG_ID = 'doc-mobile-hyper-link-viewer';

const INFO_POPUP_HIDE_DELAY = 150;

function isSameLinkInfo(current: ILinkInfo | null, next: ILinkInfo): boolean {
    return current?.linkId === next.linkId &&
        current.unitId === next.unitId &&
        (current.segmentId ?? '') === (next.segmentId ?? '') &&
        current.segmentPage === next.segmentPage &&
        current.startIndex === next.startIndex &&
        current.endIndex === next.endIndex;
}

export class DocHyperLinkPopupService extends Disposable {
    private readonly _editingLink$ = new BehaviorSubject<ILinkInfo | null>(null);
    private readonly _showingLink$ = new BehaviorSubject<ILinkInfo | null>(null);
    readonly editingLink$ = this._editingLink$.asObservable();
    readonly showingLink$ = this._showingLink$.asObservable();

    private _editPopup: IDisposable | null = null;
    private _editPopupUnitId: string | null = null;
    private _infoPopup: IDisposable | null = null;
    private _infoPopupPinned = false;
    private _infoPopupHideTimer: ReturnType<typeof setTimeout> | null = null;
    private _infoPopupSuppressed = false;
    private _infoPopupSuppressionTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(
        @Inject(DocCanvasPopManagerService) private readonly _docCanvasPopupManagerService: DocCanvasPopManagerService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IContextService private readonly _contextService: IContextService,
        @IDialogService private readonly _dialogService: IDialogService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this.disposeWithMe(() => {
            this.cancelScheduledHideInfoPopup();
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

    get infoPopupPinned() {
        return this._infoPopupPinned;
    }

    showEditPopup(unitId: string, linkInfo: ILinkInfo | null): IDisposable | null {
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
            const mobileDialogService = this._getMobileDialogService();
            if (mobileDialogService) {
                this._editPopup = mobileDialogService.open({
                    id: MOBILE_DOC_HYPER_LINK_EDITOR_DIALOG_ID,
                    title: { title: this._localeService.t('docs-hyper-link-ui.menu.tooltip') },
                    children: { label: MobileDocHyperLinkEdit.componentKey },
                    maskClosable: false,
                    onClose: () => this.hideEditPopup(),
                });
                return this._editPopup;
            }

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
        this._getMobileDialogService()?.close(MOBILE_DOC_HYPER_LINK_EDITOR_DIALOG_ID);
        this._editPopup?.dispose();
        this._editPopup = null;
        this._editPopupUnitId = null;
    }

    showInfoPopup(info: ILinkInfo, options?: { pinned?: boolean }): IDisposable | null | undefined {
        this.cancelScheduledHideInfoPopup();
        if (this._infoPopupSuppressed) {
            return;
        }

        const { linkId, unitId, segmentId, segmentPage, startIndex, endIndex } = info;
        const isSameLink = isSameLinkInfo(this.showing, info);
        if (isSameLink) {
            if (options?.pinned) {
                this._infoPopupPinned = true;
            }
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
        this._infoPopupPinned = options?.pinned ?? false;
        this._showingLink$.next({ unitId, linkId, segmentId, segmentPage, startIndex, endIndex });

        const mobileDialogService = this._getMobileDialogService();
        if (mobileDialogService && !this.canEditLink(unitId, info)) {
            this._infoPopup = mobileDialogService.open({
                id: MOBILE_DOC_HYPER_LINK_VIEWER_DIALOG_ID,
                title: { title: this._localeService.t('docs-hyper-link-ui.menu.tooltip') },
                children: { label: MobileDocLinkPopup.componentKey },
                onClose: () => this.hideInfoPopup(),
            });
            return this._infoPopup;
        }

        this._infoPopup = this._docCanvasPopupManagerService.attachPopupToRange(
            {
                collapsed: false,
                startOffset: startIndex,
                endOffset: endIndex + 1,
                segmentId,
                segmentPage,
            },
            {
                componentKey: mobileDialogService ? MOBILE_DOC_ELEMENT_MENU : DocLinkPopup.componentKey,
                extraProps: {
                    onEdit: () => {
                        this.hideInfoPopup();
                        this.showEditPopup(unitId, info);
                    },
                    onDelete: async () => {
                        if (await this._commandService.executeCommand(DeleteDocHyperLinkCommand.id, { unitId, linkId, segmentId })) {
                            this.hideInfoPopup();
                        }
                    },
                },
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
        this.cancelScheduledHideInfoPopup();
        this._infoPopupPinned = false;
        this._showingLink$.next(null);
        this._getMobileDialogService()?.close(MOBILE_DOC_HYPER_LINK_VIEWER_DIALOG_ID);
        this._infoPopup?.dispose();
        this._infoPopup = null;
    }

    scheduleHideInfoPopup() {
        if (this._infoPopupPinned || !this.showing) {
            return;
        }

        this.cancelScheduledHideInfoPopup();
        this._infoPopupHideTimer = setTimeout(() => {
            this._infoPopupHideTimer = null;
            if (!this._infoPopupPinned) {
                this.hideInfoPopup();
            }
        }, INFO_POPUP_HIDE_DELAY);
    }

    cancelScheduledHideInfoPopup() {
        if (this._infoPopupHideTimer !== null) {
            clearTimeout(this._infoPopupHideTimer);
            this._infoPopupHideTimer = null;
        }
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

    private _getMobileDialogService(): IDialogService | null {
        return this._contextService.getContextValue(MOBILE_UI_MODE) ? this._dialogService : null;
    }
}
