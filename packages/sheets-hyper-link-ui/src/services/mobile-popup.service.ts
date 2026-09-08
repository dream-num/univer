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

import type { ICustomRange, INeedCheckDisposable, Nullable, Workbook } from '@univerjs/core';
import type { IHyperLinkEditing, IHyperLinkPopupOptions } from './popup.service';
import { BuildTextUtils, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, UniverInstanceType } from '@univerjs/core';
import { getCustomRangePosition, getEditingCustomRangePosition } from '@univerjs/sheets-ui';
import { HyperLinkEditSourceType } from '../types/enums/edit-source';
import { MobileCellLinkEdit } from '../views/MobileCellLinkEdit';
import { MobileCellLinkPopup } from '../views/MobileCellLinkPopup';
import { SheetsHyperLinkPopupService } from './popup.service';

const MOBILE_HYPER_LINK_EDITOR_DIALOG_ID = 'sheet-mobile-hyper-link-editor';
const MOBILE_HYPER_LINK_VIEWER_DIALOG_ID = 'sheet-mobile-hyper-link-viewer';

export class SheetsHyperLinkMobilePopupService extends SheetsHyperLinkPopupService {
    override showPopup(location: IHyperLinkPopupOptions): void {
        if (this.getIsKeepVisible()) {
            return;
        }

        if (this._currentPopup && this._isEqualLink(location, this._currentPopup)) {
            return;
        }

        this.hideCurrentPopup(undefined, true);
        const currentEditing = this._currentEditing$.getValue();
        if (currentEditing && this._isEqualLink(location, currentEditing)) {
            return;
        }

        const { unitId, subUnitId, row, col, customRange } = location;
        if (!location.showAll && !customRange) {
            return;
        }

        const disposable: INeedCheckDisposable = {
            canDispose: () => true,
            dispose: () => this._dialogService.close(MOBILE_HYPER_LINK_VIEWER_DIALOG_ID),
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
        this._dialogService.open({
            id: MOBILE_HYPER_LINK_VIEWER_DIALOG_ID,
            title: { title: 'sheets-hyper-link-ui.popup.title' },
            children: { label: MobileCellLinkPopup.componentKey },
            onClose: () => this.hideCurrentPopup(undefined, true),
        });
    }

    override startAddEditing(link: IHyperLinkEditing): void {
        const { unitId, subUnitId, type } = link;
        let label: string;
        if (type === HyperLinkEditSourceType.EDITING) {
            const range = this._getEditingRange();
            if (!range) {
                return;
            }

            this._textSelectionManagerService.replaceDocRanges([{ ...range }], {
                unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                subUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            });
            label = range.label;
        } else {
            const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
            const worksheet = workbook?.getSheetBySheetId(subUnitId);
            const cell = worksheet?.getCellRaw(link.row, link.col);
            label = cell?.p
                ? BuildTextUtils.transform.getPlainText(cell.p.body?.dataStream ?? '')
                : (cell?.v ?? '').toString();
        }

        this._openMobileEditor({ ...link, label });
    }

    override startEditing(link: Required<IHyperLinkEditing>): void {
        this._currentEditingPopup?.dispose();
        this.hideCurrentPopup(undefined, true);

        let customRange: ICustomRange;
        let label: string;
        if (link.type === HyperLinkEditSourceType.EDITING) {
            const customRangeInfo = getEditingCustomRangePosition(
                this._injector,
                link.unitId,
                link.subUnitId,
                link.row,
                link.col,
                link.customRangeId
            );
            if (!customRangeInfo || !customRangeInfo.rects?.length) {
                return;
            }
            customRange = customRangeInfo.customRange;
            label = customRangeInfo.label;
            this._textSelectionManagerService.replaceDocRanges([{
                startOffset: customRange.startIndex,
                endOffset: customRange.endIndex + 1,
            }]);
        } else {
            const customRangeInfo = getCustomRangePosition(
                this._injector,
                link.unitId,
                link.subUnitId,
                link.row,
                link.col,
                link.customRangeId
            );
            if (!customRangeInfo || !customRangeInfo.rects?.length) {
                return;
            }
            customRange = customRangeInfo.customRange;
            label = customRangeInfo.label;
        }

        this._openMobileEditor({ ...link, customRange, label });
    }

    override endEditing(type?: HyperLinkEditSourceType): void {
        if (this.getIsKeepVisible()) {
            return;
        }
        const current = this._currentEditing$.getValue();
        if (current && (!type || type === current.type)) {
            this._currentEditingPopup?.dispose();
            this._dialogService.close(MOBILE_HYPER_LINK_EDITOR_DIALOG_ID);
            this._currentEditing$.next(null);
        }
    }

    private _openMobileEditor(editing: IHyperLinkEditing & { customRange?: ICustomRange; label?: string }): void {
        this._currentEditing$.next(editing);
        this._dialogService.open({
            id: MOBILE_HYPER_LINK_EDITOR_DIALOG_ID,
            title: { title: 'sheets-hyper-link-ui.form.addTitle' },
            children: { label: MobileCellLinkEdit.componentKey },
            maskClosable: false,
            onClose: () => this.endEditing(editing.type),
        });
    }

    private _isEqualLink(
        location: IHyperLinkPopupOptions,
        current: {
            unitId: string;
            subUnitId: string;
            row: number;
            col: number;
            customRange?: Nullable<ICustomRange>;
            type: HyperLinkEditSourceType;
        } | null
    ): boolean {
        if (!current) {
            return false;
        }

        return location.unitId === current.unitId
            && location.subUnitId === current.subUnitId
            && location.row === current.row
            && location.col === current.col
            && location.customRange?.rangeId === current.customRange?.rangeId
            && location.type === current.type;
    }
}
