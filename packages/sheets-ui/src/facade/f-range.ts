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

import type { ICellWithCoord, IDisposable, ISelectionCell, Nullable } from '@univerjs/core';
import type { ISelectionStyle, ISheetLocation } from '@univerjs/sheets';
import type { ICanvasPopup, ICellAlert, IDropdownParam } from '@univerjs/sheets-ui';
import type { ComponentType } from '@univerjs/ui';
import { DisposableCollection, generateRandomId, ILogService, toDisposable } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { CellAlertManagerService, IMarkSelectionService, ISheetCellDropdownManagerService, ISheetClipboardService, SheetCanvasPopManagerService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
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

/**
 * @ignore
 */
interface IFRangeSheetsUIMixin {
    /**
     * Return this cell information, including whether it is merged and cell coordinates
     * @returns {ICellWithCoord} cell location and coordinate.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('H6');
     * console.log(fRange.getCell());
     * ```
     */
    getCell(this: FRange): ICellWithCoord;

    /**
     * Returns the coordinates of this cell,does not include units
     * @returns {DOMRect} coordinates of the cell， top, right, bottom, left
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('H6');
     * console.log(fRange.getCellRect());
     * ```
     */
    getCellRect(this: FRange): DOMRect;

    /**
     * Generate HTML content for the range.
     * @returns {string} HTML content of the range.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.setValues([
     *   [1, 2],
     *   [3, 4]
     * ]);
     * console.log(fRange.generateHTML());
     * ```
     */
    generateHTML(this: FRange): string;

    /**
     * Attach a popup to the start cell of current range.
     * If current worksheet is not active, the popup will not be shown.
     * Be careful to manager the detach disposable object, if not dispose correctly, it might memory leaks.
     * @param {IFCanvasPopup} popup The popup to attach
     * @returns {Nullable<IDisposable>} The disposable object to detach the popup, if the popup is not attached, return `null`.
     * @example
     * ```ts
     * // Register a custom popup component
     * univerAPI.registerComponent(
     *   'myPopup',
     *   () => React.createElement('div', {
     *     style: {
     *       color: 'red',
     *       fontSize: '14px'
     *     }
     *   }, 'Custom Popup')
     * );
     *
     * // Attach the popup to the start cell of range C3:E5
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('C3:E5');
     * const disposable = fRange.attachPopup({
     *   componentKey: 'myPopup'
     * });
     *
     * // Detach the popup after 5 seconds
     * setTimeout(() => {
     *   disposable.dispose();
     * }, 5000);
     * ```
     */
    attachPopup(popup: IFCanvasPopup): Nullable<IDisposable>;

    /**
     * Attach an alert popup to the start cell of current range.
     * @param {Omit<ICellAlert, 'location'>} alert The alert to attach
     * @returns {IDisposable} The disposable object to detach the alert.
     * @example
     * ```ts
     * // Attach an alert popup to the start cell of range C3:E5
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('C3:E5');
     *
     * const disposable = fRange.attachAlertPopup({
     *   title: 'Warning',
     *   message: 'This is an warning message',
     *   type: 1
     * });
     *
     * // Detach the alert after 5 seconds
     * setTimeout(() => {
     *   disposable.dispose();
     * }, 5000);
     * ```
     */
    attachAlertPopup(alert: Omit<ICellAlert, 'location'>): IDisposable;

    /**
     * Attach a DOM popup to the current range.
     * @param {IFCanvasPopup} alert The alert to attach
     * @returns {Nullable<IDisposable>} The disposable object to detach the alert.
     * @example
     * ```ts
     * // Register a custom popup component
     * univerAPI.registerComponent(
     *   'myPopup',
     *   () => React.createElement('div', {
     *     style: {
     *       background: 'red',
     *       fontSize: '14px'
     *     }
     *   }, 'Custom Popup')
     * );
     *
     * // Attach the popup to the range C3:E5
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('C3:E5');
     * const disposable = fRange.attachRangePopup({
     *   componentKey: 'myPopup',
     *   direction: 'top' // 'vertical' | 'horizontal' | 'top' | 'right' | 'left' | 'bottom' | 'bottom-center' | 'top-center'
     * });
     * ```
     */
    attachRangePopup(popup: IFCanvasPopup): Nullable<IDisposable>;

    /**
     * Highlight the range with the specified style and primary cell.
     * @param {Nullable<Partial<ISelectionStyle>>} style - style for highlight range.
     * @param {Nullable<ISelectionCell>} primary - primary cell for highlight range.
     * @returns {IDisposable} The disposable object to remove the highlight.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Highlight the range C3:E5 with default style
     * const fRange = fWorksheet.getRange('C3:E5');
     * fRange.highlight();
     *
     * // Highlight the range C7:E9 with custom style and primary cell D8
     * const fRange2 = fWorksheet.getRange('C7:E9');
     * const primaryCell = fWorksheet.getRange('D8').getRange();
     * const disposable = fRange2.highlight(
     *   {
     *     stroke: 'red',
     *     fill: 'yellow'
     *   },
     *   {
     *     ...primaryCell,
     *     actualRow: primaryCell.startRow,
     *     actualColumn: primaryCell.startColumn
     *   }
     * );
     *
     * // Remove the range C7:E9 highlight after 5 seconds
     * setTimeout(() => {
     *   disposable.dispose();
     * }, 5000);
     * ```
     */
    highlight(style?: Nullable<Partial<ISelectionStyle>>, primary?: Nullable<ISelectionCell>): IDisposable;

    /**
     * Show a dropdown at the current range.
     * @param {IDropdownParam} param - The parameters for the dropdown.
     * @returns {IDisposable} The disposable object to hide the dropdown.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('C3:E5');
     * fRange.showDropdown({ type: 'list', props: { options: [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }] } });
     * ```
     */
    showDropdown(param: IDropdownParam): IDisposable;
}

class FRangeSheetsUIMixin extends FRange implements IFRangeSheetsUIMixin {
    override getCell(): ICellWithCoord {
        const renderManagerService = this._injector.get(IRenderManagerService);
        const logService = this._injector.get(ILogService);
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const render = renderManagerService.getRenderById(unitId);
        const skeleton = render?.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId)?.skeleton;
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
        const clipboardService = this._injector.get(ISheetClipboardService);
        const copyContent = clipboardService.generateCopyContent(
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
        popup.direction = popup.direction ?? 'top-center';
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

    override showDropdown(param: IDropdownParam): IDisposable {
        const cellDropdownManagerService = this._injector.get(ISheetCellDropdownManagerService);
        return cellDropdownManagerService.showDropdown(param);
    }
}

FRange.extend(FRangeSheetsUIMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRange extends IFRangeSheetsUIMixin { }
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
