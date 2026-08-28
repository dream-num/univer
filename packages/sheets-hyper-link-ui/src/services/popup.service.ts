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

import type { ICustomRange, IDisposable, INeedCheckDisposable, ITextRange, Nullable, Workbook } from '@univerjs/core';
import type { IBoundRectNoAngle } from '@univerjs/engine-render';
import type { ISheetLocationBase } from '@univerjs/sheets';
import type { ICanvasPopup } from '@univerjs/sheets-ui';
import {
    BuildTextUtils,
    CustomRangeType,
    Disposable,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    Inject,
    Injector,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { calcDocRangePositions } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { getCustomRangePosition, getEditingCustomRangePosition, IEditorBridgeService, SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { IDialogService, isMobileDialogService } from '@univerjs/ui';
import { BehaviorSubject, Subject } from 'rxjs';
import { HyperLinkEditSourceType } from '../types/enums/edit-source';
import { CellLinkEdit } from '../views/CellLinkEdit';
import { CellLinkPopup } from '../views/CellLinkPopup';

export interface IHyperLinkPopup {
    unitId: string;
    subUnitId: string;
    disposable: INeedCheckDisposable;
    row: number;
    col: number;
    editPermission?: boolean;
    copyPermission?: boolean;
    customRange?: Nullable<ICustomRange>;
    type: HyperLinkEditSourceType;
    showAll?: boolean;
}

interface IHyperLinkEditing {
    unitId: string;
    subUnitId: string;
    row: number;
    col: number;
    customRangeId?: string;
    type: HyperLinkEditSourceType;
}

const MOBILE_HYPER_LINK_EDITOR_DIALOG_ID = 'sheet-mobile-hyper-link-editor';
const MOBILE_HYPER_LINK_VIEWER_DIALOG_ID = 'sheet-mobile-hyper-link-viewer';

const isEqualLink = (a: IHyperLinkPopupOptions, b: Omit<IHyperLinkPopup, 'disposable' | 'editPermission'>) => {
    return (
        a.unitId === b.unitId
        && a.subUnitId === b.subUnitId
        && a.row === b.row
        && a.col === b.col
        && a.customRange?.rangeId === b.customRange?.rangeId
        && a.type === b.type
    );
};

interface IHyperLinkPopupOptions extends ISheetLocationBase {
    editPermission?: boolean;
    copyPermission?: boolean;
    customRange?: Nullable<ICustomRange>;
    customRangeRect?: Nullable<IBoundRectNoAngle>;
    showAll?: boolean;
    type: HyperLinkEditSourceType;
}

export class SheetsHyperLinkPopupService extends Disposable {
    private _currentPopup: IHyperLinkPopup | null = null;
    private _currentPopup$ = new Subject<IHyperLinkPopup | null>();
    currentPopup$ = this._currentPopup$.asObservable();
    private _currentEditingPopup: Nullable<IDisposable> = null;

    private _currentEditing$ = new BehaviorSubject<(IHyperLinkEditing & { customRange?: ICustomRange; label?: string }) | null>(null);
    currentEditing$ = this._currentEditing$.asObservable();

    private _isKeepVisible: boolean = false;

    get currentPopup() {
        return this._currentPopup;
    }

    get currentEditing() {
        return this._currentEditing$.getValue();
    }

    constructor(
        @Inject(SheetCanvasPopManagerService) private readonly _sheetCanvasPopManagerService: SheetCanvasPopManagerService,
        @Inject(Injector) private readonly _injector: Injector,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IDialogService private readonly _dialogService: IDialogService
    ) {
        super();

        this.disposeWithMe(() => {
            this.hideCurrentPopup();
            this.endEditing();

            this._currentEditing$.complete();
            this._currentPopup$.complete();
        });
    }

    public setIsKeepVisible(v: boolean) {
        this._isKeepVisible = v;
    }

    public getIsKeepVisible() {
        return this._isKeepVisible;
    }

    showPopup(location: IHyperLinkPopupOptions) {
        if (this._currentPopup && isEqualLink(location, this._currentPopup)) {
            return;
        }

        this.hideCurrentPopup(undefined, true);
        const currentEditing = this._currentEditing$.getValue();
        if (currentEditing && isEqualLink(location, currentEditing)) {
            return;
        }

        const { unitId, subUnitId, row, col, customRangeRect, customRange } = location;
        const mobileDialogService = this._getMobileDialogService();
        if (mobileDialogService) {
            if (!location.showAll && !customRange) {
                return;
            }
            const disposable: INeedCheckDisposable = {
                canDispose: () => true,
                dispose: () => mobileDialogService.close(MOBILE_HYPER_LINK_VIEWER_DIALOG_ID),
            };
            this._currentPopup = {
                unitId,
                subUnitId,
                disposable,
                row,
                col,
                editPermission: !!location.editPermission,
                copyPermission: !!location.copyPermission,
                customRange,
                type: location.type,
                showAll: location.showAll,
            };
            this._currentPopup$.next(this._currentPopup);
            mobileDialogService.open({
                id: MOBILE_HYPER_LINK_VIEWER_DIALOG_ID,
                title: { title: 'sheets-hyper-link-ui.form.addTitle' },
                children: { label: CellLinkPopup.componentKey },
                onClose: () => this.hideCurrentPopup(undefined, true),
            });
            return;
        }
        let disposable: Nullable<INeedCheckDisposable>;
        const popup: ICanvasPopup = {
            componentKey: CellLinkPopup.componentKey,
            direction: 'bottom',
            onClickOutside: () => {
                this.hideCurrentPopup();
            },
            onClick: () => {
                this.hideCurrentPopup(location.type, true);
            },
        };
        if (location.type === HyperLinkEditSourceType.EDITING) {
            if (!customRange) {
                return;
            }
            disposable = customRangeRect && this._sheetCanvasPopManagerService.attachPopupToAbsolutePosition(
                customRangeRect,
                popup
            );
        } else {
            if (location.showAll) {
                disposable = this._sheetCanvasPopManagerService.attachPopupToCell(location.row, location.col, popup, unitId, subUnitId);
            } else {
                if (!customRange) {
                    return;
                }

                disposable = customRangeRect && this._sheetCanvasPopManagerService.attachPopupByPosition(
                    customRangeRect,
                    popup,
                    location
                );
            }
        }

        if (disposable) {
            if (this._currentPopup) {
                this._currentPopup.disposable?.dispose();
            }
            this._currentPopup = {
                unitId,
                subUnitId,
                disposable,
                row,
                col,
                editPermission: !!location.editPermission,
                copyPermission: !!location.copyPermission,
                customRange,
                type: location.type,
                showAll: location.showAll,
            };
            this._currentPopup$.next(this._currentPopup);
        }
    }

    hideCurrentPopup(type?: HyperLinkEditSourceType, force?: boolean) {
        if (!this._currentPopup) {
            return;
        }

        if (((!type || type === this._currentPopup.type) && this._currentPopup.disposable.canDispose()) || force) {
            this._currentPopup?.disposable?.dispose();
            this._currentPopup = null;
            this._currentPopup$.next(null);
        }
    }

    override dispose(): void {
        super.dispose();
        this.hideCurrentPopup();
        this.endEditing();
        this._currentPopup$.complete();
        this._currentEditing$.complete();
    }

    private _getEditingRange(): Nullable<ITextRange & { label: string }> {
        const visible = this._editorBridgeService.isVisible().visible;
        const state = this._editorBridgeService.getEditCellState();
        if (visible && state) {
            const textRange = this._textSelectionManagerService.getActiveTextRange();
            const body = state.documentLayoutObject.documentModel?.getBody();
            if (!body) {
                return null;
            }
            if (!textRange || textRange.collapsed) {
                return {
                    startOffset: 0,
                    endOffset: body.dataStream.length - 2,
                    collapsed: body.dataStream.length - 2 === 0,
                    label: BuildTextUtils.transform.getPlainText(body.dataStream),
                };
            }
            const links = BuildTextUtils.customRange.getCustomRangesInterestsWithSelection(textRange, body.customRanges?.filter((i) => i.rangeType === CustomRangeType.HYPERLINK) ?? []);
            let start = textRange.startOffset;
            let end = textRange.endOffset;
            links.forEach((link) => {
                start = Math.min(start, link.startIndex);
                end = Math.max(end, link.endIndex + 1);
            });
            return {
                startOffset: start,
                endOffset: end,
                collapsed: start === end,
                label: BuildTextUtils.transform.getPlainText(body.dataStream.slice(start, end)),
            };
        }

        return null;
    }

    private get _editPopup() {
        const popup: ICanvasPopup = {
            componentKey: CellLinkEdit.componentKey,
            direction: 'vertical',
            onClickOutside: () => {
                this.endEditing();
            },
            onContextMenu: () => {
                this.endEditing();
            },
            hiddenType: 'hide',
        };
        return popup;
    }

    private _openMobileEditor(editing: IHyperLinkEditing & { customRange?: ICustomRange; label?: string }): void {
        const dialogService = this._getMobileDialogService();
        if (!dialogService) return;
        this._currentEditing$.next(editing);
        dialogService.open({
            id: MOBILE_HYPER_LINK_EDITOR_DIALOG_ID,
            title: { title: 'sheets-hyper-link-ui.form.addTitle' },
            children: { label: CellLinkEdit.componentKey },
            maskClosable: false,
            onClose: () => this.endEditing(editing.type),
        });
    }

    private _getMobileDialogService(): IDialogService | null {
        return isMobileDialogService(this._dialogService) ? this._dialogService : null;
    }

    startAddEditing(link: IHyperLinkEditing) {
        const { unitId, subUnitId, type } = link;
        if (type === HyperLinkEditSourceType.EDITING) {
            const range = this._getEditingRange();

            if (!range) {
                return;
            }

            this._textSelectionManagerService.replaceDocRanges([{ ...range }], { unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY, subUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY });
            if (this._getMobileDialogService()) {
                this._openMobileEditor({ ...link, label: range.label });
                return;
            }
            const currentRender = this._renderManagerService.getRenderUnitById(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
            if (!currentRender) {
                return;
            }
            const rects = calcDocRangePositions(range, currentRender);
            if (!rects?.length) {
                return;
            }
            this._currentEditingPopup = this._sheetCanvasPopManagerService.attachPopupToAbsolutePosition(
                rects.pop()!,
                this._editPopup,
                unitId,
                subUnitId
            );

            this._currentEditing$.next({
                ...link,
                label: range?.label ?? '',
            });
        } else {
            const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
            const worksheet = workbook?.getSheetBySheetId(subUnitId);
            const cell = worksheet?.getCellRaw(link.row, link.col);
            const label = cell?.p ? BuildTextUtils.transform.getPlainText(cell.p.body?.dataStream ?? '') : (cell?.v ?? '').toString();
            if (this._getMobileDialogService()) {
                this._openMobileEditor({ ...link, label });
                return;
            }
            this._currentEditingPopup = this._sheetCanvasPopManagerService.attachPopupToCell(
                link.row,
                link.col,
                this._editPopup,
                unitId,
                subUnitId
            );
            this._currentEditing$.next({
                ...link,
                label,
            });
        }
    }

    startEditing(link: Required<IHyperLinkEditing>) {
        this._currentEditingPopup?.dispose();
        this.hideCurrentPopup(undefined, true);

        const { unitId, subUnitId } = link;
        const mobile = Boolean(this._getMobileDialogService());
        let customRange;
        let label;
        if (link.type === HyperLinkEditSourceType.EDITING) {
            const customRangeInfo = getEditingCustomRangePosition(this._injector, link.unitId, link.subUnitId, link.row, link.col, link.customRangeId);
            if (!customRangeInfo || !customRangeInfo.rects?.length) {
                return;
            }
            customRange = customRangeInfo.customRange;
            label = customRangeInfo.label;
            this._textSelectionManagerService.replaceDocRanges([
                {
                    startOffset: customRange.startIndex,
                    endOffset: customRange.endIndex + 1,
                },
            ]);
            if (!mobile) {
                this._currentEditingPopup = this._sheetCanvasPopManagerService.attachPopupToAbsolutePosition(
                    customRangeInfo.rects.pop()!,
                    this._editPopup,
                    unitId,
                    subUnitId
                );
            }
        } else {
            const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
            const worksheet = workbook?.getSheetBySheetId(subUnitId);
            const cell = worksheet?.getCellRaw(link.row, link.col);
            const style = workbook?.getStyles().getStyleByCell(cell);
            const tr = style?.tr;

            const customRangeInfo = getCustomRangePosition(this._injector, link.unitId, link.subUnitId, link.row, link.col, link.customRangeId);
            if (!customRangeInfo || !customRangeInfo.rects?.length) {
                return;
            }
            customRange = customRangeInfo.customRange;
            label = customRangeInfo.label;
            if (!mobile) {
                if (tr) {
                    this._currentEditingPopup = this._sheetCanvasPopManagerService.attachPopupToCell(
                        link.row,
                        link.col,
                        this._editPopup,
                        unitId,
                        subUnitId
                    );
                } else {
                    this._currentEditingPopup = this._sheetCanvasPopManagerService.attachPopupByPosition(
                        customRangeInfo.rects.pop()!,
                        this._editPopup,
                        {
                            unitId,
                            subUnitId,
                            row: link.row,
                            col: link.col,
                        }
                    );
                }
            }
        }
        const editing = {
            ...link,
            customRange,
            label,
        };
        if (mobile) {
            this._openMobileEditor(editing);
            return;
        }
        this._currentEditing$.next(editing);
    }

    endEditing(type?: HyperLinkEditSourceType) {
        if (this.getIsKeepVisible()) {
            return;
        }
        const current = this._currentEditing$.getValue();
        if (current && (!type || type === current.type)) {
            this._currentEditingPopup?.dispose();
            this._getMobileDialogService()?.close(MOBILE_HYPER_LINK_EDITOR_DIALOG_ID);
            this._currentEditing$.next(null);
        }
    }
}
