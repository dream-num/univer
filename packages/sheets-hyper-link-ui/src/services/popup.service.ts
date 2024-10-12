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

import { BuildTextUtils, createInternalEditorID, CustomRangeType, Disposable, DOCS_ZEN_EDITOR_UNIT_ID_KEY, Inject, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { DocCanvasPopManagerService, IEditorService, IRangeSelectorService } from '@univerjs/docs-ui';
import { getCustomRangePosition, getEditingCustomRangePosition, IEditorBridgeService, SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { IZenZoneService } from '@univerjs/ui';
import { BehaviorSubject, Subject } from 'rxjs';
import type { DocumentDataModel, ICustomRange, IDisposable, INeedCheckDisposable, ITextRange, Nullable, Workbook } from '@univerjs/core';
import type { IBoundRectNoAngle } from '@univerjs/engine-render';
import type { ISheetLocationBase } from '@univerjs/sheets';
import type { ICanvasPopup } from '@univerjs/sheets-ui';
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
    customRange?: ICustomRange;
    type: HyperLinkEditSourceType;
}

interface IHyperLinkEditing {
    unitId: string;
    subUnitId: string;
    row: number;
    col: number;
    customRangeId?: string;
    type: HyperLinkEditSourceType;
}

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
        @Inject(DocCanvasPopManagerService) private readonly _docCanvasPopManagerService: DocCanvasPopManagerService,
        @IEditorService private readonly _editorService: IEditorService,
        @IRangeSelectorService private readonly _rangeSelectorService: IRangeSelectorService,
        @IZenZoneService private readonly _zenZoneService: IZenZoneService
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
        if (location.type !== HyperLinkEditSourceType.ZEN_EDITOR && this._zenZoneService.visible) {
            return;
        }
        const currentEditing = this._currentEditing$.getValue();
        if (currentEditing && isEqualLink(location, currentEditing)) {
            return;
        }

        const { unitId, subUnitId, row, col, customRangeRect, customRange } = location;
        if (!customRange) {
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
            disposable = customRangeRect && this._sheetCanvasPopManagerService.attachPopupToAbsolutePosition(
                customRangeRect,
                popup
            );
        } else if (location.type === HyperLinkEditSourceType.ZEN_EDITOR) {
            disposable = this._docCanvasPopManagerService.attachPopupToRange(
                {
                    startOffset: customRange.startIndex,
                    endOffset: customRange.endIndex + 1,
                    collapsed: false,
                },
                popup,
                DOCS_ZEN_EDITOR_UNIT_ID_KEY
            );
        } else {
            disposable = customRangeRect && this._sheetCanvasPopManagerService.attachPopupByPosition(
                customRangeRect,
                popup
            );
        }

        if (disposable) {
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
            const links = BuildTextUtils.customRange.getCustomRangesInterestsWithRange(textRange, body.customRanges?.filter((i) => i.rangeType === CustomRangeType.HYPERLINK) ?? []);
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
            direction: 'bottom',
            onClickOutside: () => {
                if (!this.getIsKeepVisible()) {
                    this.endEditing();
                }
            },
            onContextMenu: () => {
                this.endEditing();
            },
            hiddenType: 'hide',
        };
        return popup;
    }

    startAddEditing(link: IHyperLinkEditing) {
        const { unitId, subUnitId, type } = link;
        if (type === HyperLinkEditSourceType.ZEN_EDITOR) {
            const document: Nullable<DocumentDataModel> = this._univerInstanceService.getUnit(DOCS_ZEN_EDITOR_UNIT_ID_KEY, UniverInstanceType.UNIVER_DOC);
            if (!document) {
                return;
            }
            const range = this._textSelectionManagerService.getActiveTextRange();
            if (!range) {
                return;
            }
            this._currentEditingPopup = this._docCanvasPopManagerService.attachPopupToRange(
                range,
                this._editPopup,
                DOCS_ZEN_EDITOR_UNIT_ID_KEY
            );
            const label = document.getBody()?.dataStream.slice(range.startOffset, range.endOffset - 1);
            this._currentEditing$.next({
                ...link,
                label,
            });
        } else if (type === HyperLinkEditSourceType.EDITING) {
            const range = this._getEditingRange();

            if (range) {
                this._textSelectionManagerService.replaceTextRanges([{ ...range }]);
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
                label: range?.label ?? '',
            });
        } else {
            this._currentEditingPopup = this._sheetCanvasPopManagerService.attachPopupToCell(
                link.row,
                link.col,
                this._editPopup,
                unitId,
                subUnitId
            );
            const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
            const worksheet = workbook?.getSheetBySheetId(subUnitId);
            const cell = worksheet?.getCellRaw(link.row, link.col);
            this._currentEditing$.next({
                ...link,
                label: cell?.p ? BuildTextUtils.transform.getPlainText(cell.p.body?.dataStream ?? '') : (cell?.v ?? '').toString(),
            });
        }
    }

    startEditing(link: Required<IHyperLinkEditing>) {
        this._currentEditingPopup?.dispose();
        this.hideCurrentPopup(undefined, true);

        const { unitId, subUnitId } = link;
        let customRange;
        let label;
        if (link.type === HyperLinkEditSourceType.ZEN_EDITOR) {
            const document: Nullable<DocumentDataModel> = this._univerInstanceService.getUnit(DOCS_ZEN_EDITOR_UNIT_ID_KEY, UniverInstanceType.UNIVER_DOC);
            customRange = document?.getBody()?.customRanges?.find((range) => range.rangeId === link.customRangeId);
            label = customRange ? document?.getBody()?.dataStream.slice(customRange.startIndex + 1, customRange.endIndex) : '';
            if (!customRange || !label) {
                return;
            }
            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: customRange.startIndex,
                    endOffset: customRange.endIndex + 1,
                },
            ]);
            this._currentEditingPopup = this._docCanvasPopManagerService.attachPopupToRange(
                {
                    startOffset: customRange.startIndex,
                    endOffset: customRange.endIndex,
                    collapsed: false,
                },
                this._editPopup,
                DOCS_ZEN_EDITOR_UNIT_ID_KEY
            );
        } else if (link.type === HyperLinkEditSourceType.EDITING) {
            const customRangeInfo = getEditingCustomRangePosition(this._injector, link.unitId, link.subUnitId, link.row, link.col, link.customRangeId);
            if (!customRangeInfo || !customRangeInfo.rects?.length) {
                return;
            }
            customRange = customRangeInfo.customRange;
            label = customRangeInfo.label;
            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: customRange.startIndex,
                    endOffset: customRange.endIndex + 1,
                },
            ]);
            this._currentEditingPopup = this._sheetCanvasPopManagerService.attachPopupToAbsolutePosition(
                customRangeInfo.rects.pop()!,
                this._editPopup,
                unitId,
                subUnitId
            );
        } else {
            const customRangeInfo = getCustomRangePosition(this._injector, link.unitId, link.subUnitId, link.row, link.col, link.customRangeId);
            if (!customRangeInfo || !customRangeInfo.rects?.length) {
                return;
            }
            customRange = customRangeInfo.customRange;
            label = customRangeInfo.label;
            this._currentEditingPopup = this._sheetCanvasPopManagerService.attachPopupByPosition(
                customRangeInfo.rects.pop()!,
                this._editPopup,
                unitId,
                subUnitId
            );
        }
        this._currentEditing$.next({
            ...link,
            customRange,
            label,
        });
    }

    endEditing(type?: HyperLinkEditSourceType) {
        const current = this._currentEditing$.getValue();
        if (current && (!type || type === current.type)) {
            this._currentEditingPopup?.dispose();
            this._currentEditing$.next(null);
        }
    }
}
