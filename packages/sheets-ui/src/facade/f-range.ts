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

import type { ICellWithCoord, IDisposable, ISelectionCell, Nullable } from '@univerjs/core';
import type { ISelectionStyle, ISheetLocation } from '@univerjs/sheets';
import type { ComponentType } from '@univerjs/ui';
import { DisposableCollection, generateRandomId, ILogService, toDisposable } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { CellAlertManagerService, type ICanvasPopup, type ICellAlert, IMarkSelectionService, SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { ISheetClipboardService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { FRange } from '@univerjs/sheets/facade';
import { ComponentManager } from '@univerjs/ui';

export interface IFComponentKey {
    /**
     * The key of the component to be rendered in the popup.
     * if key is a string, it will be query from the component registry.
     * if key is a React or Vue3 component, it will be rendered directly.
     */
    componentKey: string | ComponentType;
    /**
     * If componentKey is a Vue3 component, this must be set to true
     */
    isVue3?: boolean;
}

export interface IFCanvasPopup extends Omit<ICanvasPopup, 'componentKey'>, IFComponentKey { }

interface IFRangeSheetsUIMixin {
    /**
     * Return this cell information, including whether it is merged and cell coordinates
     * @returns {ICellWithCoord} cell location and coordinate.
     * @example
     * ``` ts
     * let sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRange(5, 7).getCell();
     * ```
     */
    getCell(this: FRange): ICellWithCoord;

    /**
     * Returns the coordinates of this cell,does not include units
     * @returns coordinates of the cell， top, right, bottom, left
     * @example
     * ``` ts
     * let sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRange(5, 7).getCellRect();
     * ```
     */
    getCellRect(this: FRange): DOMRect;

    /**
     * Generate HTML content for the range.
     * @example
     * ``` ts
     * let sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRange(5, 7).generateHTML();
     * ```
     */
    generateHTML(this: FRange): string;

    /**
     * Attach a popup to the start cell of current range.
     * If current worksheet is not active, the popup will not be shown.
     * Be careful to manager the detach disposable object, if not dispose correctly, it might memory leaks.
     * @param popup The popup to attach
     * @returns The disposable object to detach the popup, if the popup is not attached, return `null`.
     * @example
    ```
        let sheet = univerAPI.getActiveWorkbook().getActiveSheet();
        let range = sheet.getRange(2, 2, 3, 3);
        univerAPI.getActiveWorkbook().setActiveRange(range);
        let disposable = range.attachPopup({
        componentKey: 'univer.sheet.cell-alert',
        extraProps: { alert: { type: 0, title: 'This is an Info', message: 'This is an info message' } },
        });
    ```
     */
    attachPopup(popup: IFCanvasPopup): Nullable<IDisposable>;

    /**
     * Attach an alert popup to the start cell of current range.
     * @param alert The alert to attach
     * @returns The disposable object to detach the alert.
     * @example
     * ```ts
     * let sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * let range = sheet.getRange(2, 2, 3, 3);
     * range.attachAlertPopup({ message: 'This is an alert', type: 'warning' });
     * ```
     */
    attachAlertPopup(alert: Omit<ICellAlert, 'location'>): IDisposable;
    /**
     * Attach a DOM popup to the start cell of current range.
     * @param alert The alert to attach
     * @returns The disposable object to detach the alert.
     * @example
     * ```ts
        let sheet = univerAPI.getActiveWorkbook().getActiveSheet();
        let range = sheet.getRange(2, 2, 3, 3);
        univerAPI.getActiveWorkbook().setActiveRange(range);
        let disposable = range.attachRangePopup({
        componentKey: 'univer.sheet.single-dom-popup',
        extraProps: { alert: { type: 0, title: 'This is an Info', message: 'This is an info message' } },
        });
     * ```
     */
    attachRangePopup(popup: IFCanvasPopup): Nullable<IDisposable>;

    /**
     *  Highlight the range with the specified style and primary cell.
     * @param style - style for highlight range.
     * @param primary - primary cell for highlight range.
     * @example
     * ```ts
     * let sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * let range = sheet.getRange(2, 2, 3, 3);
     * range.highlight({ stroke: 'red' }, { startRow: 2, startColumn: 2 });
     * ```
     */
    highlight(style?: Nullable<Partial<ISelectionStyle>>, primary?: Nullable<ISelectionCell>): IDisposable;
}

class FRangeSheetsUIMixin extends FRange implements IFRangeSheetsUIMixin {
    override getCell(): ICellWithCoord {
        const renderManagerService = this._injector.get(IRenderManagerService);
        const logService = this._injector.get(ILogService);
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const render = renderManagerService.getRenderById(unitId);
        const skeleton = render?.with(SheetSkeletonManagerService).getWorksheetSkeleton(subUnitId)?.skeleton;
        if (!skeleton) {
            logService.error('[Facade]: `FRange.getCell` can only be called in current worksheet');
            throw new Error('`FRange.getCell` can only be called in current worksheet');
        }

        return skeleton.getCellWithCoordByIndex(this._range.startRow, this._range.startColumn);
    }

    override getCellRect(): DOMRect {
        const { startX: x, startY: y, endX: x2, endY: y2 } = this.getCell();
        const data = { x, y, width: x2 - x, height: y2 - y, top: y, left: x, bottom: y2, right: x2 };
        return { ...data, toJSON: () => JSON.stringify(data) };
    }

    override generateHTML(): string {
        const copyContent = this._injector.get(ISheetClipboardService).generateCopyContent(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId(),
            this._range
        );

        return copyContent?.html ?? '';
    }

    override attachPopup(popup: IFCanvasPopup): Nullable<IDisposable> {
        popup.direction = popup.direction ?? 'horizontal';
        popup.extraProps = popup.extraProps ?? {};
        popup.offset = popup.offset ?? [0, 0];

        const { key, disposableCollection } = transformComponentKey(popup, this._injector.get(ComponentManager));
        const sheetsPopupService = this._injector.get(SheetCanvasPopManagerService);
        const disposePopup = sheetsPopupService.attachPopupToCell(
            this._range.startRow,
            this._range.startColumn,
            { ...popup, componentKey: key },
            this.getUnitId(),
            this._worksheet.getSheetId()
        );
        if (disposePopup) {
            disposableCollection.add(disposePopup);
            return disposableCollection;
        }

        disposableCollection.dispose();
        return null;
    }

    override attachAlertPopup(alert: Omit<ICellAlert, 'location'>): IDisposable {
        const cellAlertService = this._injector.get(CellAlertManagerService);
        const location: ISheetLocation = {
            workbook: this._workbook,
            worksheet: this._worksheet,
            row: this._range.startRow,
            col: this._range.startColumn,
            unitId: this.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
        };
        cellAlertService.showAlert({
            ...alert,
            location,
        });

        return {
            dispose: (): void => {
                cellAlertService.removeAlert(alert.key);
            },
        };
    }

    /**
     * attachDOMPopup
     * @param popup
     * @returns {IDisposable} disposable
        let sheet = univerAPI.getActiveWorkbook().getActiveSheet();
        let range = sheet.getRange(2, 2, 3, 3);
        univerAPI.getActiveWorkbook().setActiveRange(range);
        let disposable = range.attachDOMPopup({
        componentKey: 'univer.sheet.single-dom-popup',
        extraProps: { alert: { type: 0, title: 'This is an Info', message: 'This is an info message' } },
        });
     */
    override attachRangePopup(popup: IFCanvasPopup): Nullable<IDisposable> {
        popup.direction = popup.direction ?? 'horizontal';
        popup.extraProps = popup.extraProps ?? {};
        popup.offset = popup.offset ?? [0, 0];

        const { key, disposableCollection } = transformComponentKey(popup, this._injector.get(ComponentManager));
        const sheetsPopupService = this._injector.get(SheetCanvasPopManagerService);
        const disposePopup = sheetsPopupService.attachRangePopup(
            this._range,
            { ...popup, componentKey: key },
            this.getUnitId(),
            this._worksheet.getSheetId()
        );
        if (disposePopup) {
            disposableCollection.add(disposePopup);
            return disposableCollection;
        }

        disposableCollection.dispose();
        return null;
    }

    override highlight(style?: Nullable<Partial<ISelectionStyle>>, primary?: Nullable<ISelectionCell>): IDisposable {
        const markSelectionService = this._injector.get(IMarkSelectionService);
        const id = markSelectionService.addShape({ range: this._range, style, primary });

        if (!id) {
            throw new Error('Failed to highlight current range');
        }
        return toDisposable(() => {
            markSelectionService.removeShape(id);
        });
    }
}

FRange.extend(FRangeSheetsUIMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRange extends IFRangeSheetsUIMixin {}
}

/**
 * Transform component key
 * @param {IFComponentKey} component - The component key to transform.
 * @param {ComponentManager} componentManager - The component manager to use for registration.
 * @returns {string} The transformed component key.
 */
export function transformComponentKey(component: IFComponentKey, componentManager: ComponentManager): { key: string; disposableCollection: DisposableCollection } {
    const { componentKey, isVue3 } = component;
    let key: string;
    const disposableCollection = new DisposableCollection();
    if (typeof componentKey === 'string') {
        key = componentKey;
    } else {
        key = `External_${generateRandomId(6)}`;
        disposableCollection.add(componentManager.register(key, componentKey, { framework: isVue3 ? 'vue3' : 'react' }));
    }

    return {
        key,
        disposableCollection,
    };
}
