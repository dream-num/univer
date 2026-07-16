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

import type { ISheetLocation } from '@univerjs/sheets';
import type { IPopupWithExtraProps } from '@univerjs/ui';
import type { ReactElement } from 'react';
import type { IListDropdownProps } from '../ListDropDown';
import type { IBaseDropdownProps } from '../type';
import { Injector, LocaleService } from '@univerjs/core';
import { serializeListOptions, SheetPermissionCheckController } from '@univerjs/sheets';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { ListDropDown } from '../ListDropDown';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'list-dropdown-unit';
const SHEET_ID = 'sheet-1';
type IListPopupProps = IListDropdownProps & IBaseDropdownProps;

class TestLocaleService {
    t(key: string): string {
        return key;
    }
}

class PermissionDecision {
    static allowed = true;
    static checks: Array<{ ranges: unknown; unitId: string | undefined; subUnitId: string | undefined }> = [];

    static reset(): void {
        this.allowed = true;
        this.checks = [];
    }
}

class TestSheetPermissionCheckController {
    permissionCheckWithRanges(permissionTypes: unknown, ranges: unknown, unitId?: string, subUnitId?: string): boolean {
        PermissionDecision.checks.push({ ranges, unitId, subUnitId });
        return PermissionDecision.allowed;
    }
}

class InteractionLog {
    static selectedValues: string[][] = [];
    static hideCount = 0;
    static editCount = 0;
    static allowClose = true;

    static reset(): void {
        this.selectedValues = [];
        this.hideCount = 0;
        this.editCount = 0;
        this.allowClose = true;
    }

    static async changeSelectedValues(values: string[]): Promise<boolean> {
        this.selectedValues.push(values);
        return this.allowClose;
    }

    static hide(): void {
        this.hideCount += 1;
    }

    static edit(): void {
        this.editCount += 1;
    }
}

function createInjector() {
    const injector = new Injector();
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([SheetPermissionCheckController, { useClass: TestSheetPermissionCheckController as never }]);

    return injector;
}

function createLocation(): ISheetLocation {
    return {
        unitId: UNIT_ID,
        subUnitId: SHEET_ID,
        row: 2,
        col: 3,
        workbook: {},
        worksheet: {},
    } as ISheetLocation;
}

function createPopup(extraProps: Partial<IListPopupProps> = {}): IPopupWithExtraProps<IListPopupProps> {
    return {
        componentKey: ListDropDown.componentKey,
        unitId: UNIT_ID,
        subUnitId: SHEET_ID,
        anchorRect: { left: 10, top: 10, right: 90, bottom: 30 },
        extraProps: {
            location: createLocation(),
            hideFn: () => InteractionLog.hide(),
            onChange: (values: string[]) => InteractionLog.changeSelectedValues(values),
            onEdit: () => InteractionLog.edit(),
            options: [
                { label: 'Alpha', value: 'alpha', color: '#ffffff' },
                { label: 'Beta', value: 'beta', color: '#2b68ff' },
                { label: 'Gamma', value: 'gamma', color: '#f4d35e' },
            ],
            ...extraProps,
        },
    } as IPopupWithExtraProps<IListPopupProps>;
}

function renderWithDependencies(element: ReactElement) {
    const injector = createInjector();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                {element}
            </RediContext.Provider>
        );
    });

    return {
        container,
        injector,
        unmount: () => {
            act(() => root.unmount());
            container.remove();
        },
    };
}

function getByText(container: HTMLElement, text: string): HTMLElement {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
        if (node.textContent === text) {
            const element = node.parentElement;
            if (!element) {
                break;
            }

            return element;
        }
        node = walker.nextNode();
    }

    throw new Error(`Text not found: ${text}`);
}

async function clickText(container: HTMLElement, text: string) {
    await act(async () => {
        getByText(container, text).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await Promise.resolve();
    });
}

describe('ListDropDown', () => {
    const disposals: Array<() => void> = [];

    afterEach(() => {
        disposals.splice(0).forEach((dispose) => dispose());
        InteractionLog.reset();
        PermissionDecision.reset();
    });

    it('reports multiple selections in option order and keeps the popup open when change is rejected', async () => {
        InteractionLog.allowClose = false;
        const { container, unmount } = renderWithDependencies(
            <ListDropDown
                popup={createPopup({
                    multiple: true,
                    defaultValue: serializeListOptions(['gamma']),
                })}
            />
        );
        disposals.push(unmount);

        await clickText(container, 'Beta');

        expect(InteractionLog.selectedValues).toEqual([['beta', 'gamma']]);
        expect(InteractionLog.hideCount).toBe(0);
    });

    it('hides the popup after a successful single selection', async () => {
        const { container, unmount } = renderWithDependencies(
            <ListDropDown
                popup={createPopup({
                    defaultValue: 'alpha',
                })}
            />
        );
        disposals.push(unmount);

        await clickText(container, 'Gamma');

        expect(InteractionLog.selectedValues).toEqual([['gamma']]);
        expect(InteractionLog.hideCount).toBe(1);
    });

    it('opens the list editor only when cell edit permission allows it', async () => {
        const { container, unmount } = renderWithDependencies(
            <ListDropDown
                popup={createPopup({
                    showEdit: true,
                })}
            />
        );
        disposals.push(unmount);

        await clickText(container, 'sheets-ui.data-validation.list.edit');

        expect(InteractionLog.editCount).toBe(1);
        expect(PermissionDecision.checks).toEqual([
            {
                ranges: [{ startColumn: 3, startRow: 2, endColumn: 3, endRow: 2 }],
                unitId: UNIT_ID,
                subUnitId: SHEET_ID,
            },
        ]);
    });
});
