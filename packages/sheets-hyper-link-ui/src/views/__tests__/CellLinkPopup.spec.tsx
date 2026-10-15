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

import type { Root } from 'react-dom/client';
import { LocaleService, LocaleType } from '@univerjs/core';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { OpenHyperLinkEditPanelOperation } from '../../commands/operations/popup.operations';
import { HyperLinkEditSourceType } from '../../types/enums/edit-source';
import { CellLinkPopupPure } from '../CellLinkPopup';
import { MobileCellLinkPopupPure } from '../MobileCellLinkPopup';
import { createPopupTestBed, SUB_UNIT_ID, UNIT_ID } from './hyper-link-popup-test-bed';

function renderPopup(
    root: Root,
    container: HTMLDivElement,
    testBed: ReturnType<typeof createPopupTestBed>
) {
    act(() => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                <CellLinkPopupPure
                    unitId={UNIT_ID}
                    subUnitId={SUB_UNIT_ID}
                    row={0}
                    col={0}
                    customRange={testBed.customRange}
                    type={HyperLinkEditSourceType.VIEWING}
                    editPermission
                    copyPermission={false}
                />
            </RediContext.Provider>
        );
    });

    return {
        copy: container.querySelector<HTMLButtonElement>('[data-u-comp="cell-link-popup-copy"]'),
        edit: container.querySelector('[data-u-comp="cell-link-popup-edit"]') as HTMLElement,
        remove: container.querySelector('[data-u-comp="cell-link-popup-remove"]') as HTMLElement,
    };
}

describe('CellLinkPopupPure', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createPopupTestBed> | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentTestBed?.univer.dispose();
        root = undefined;
        container = undefined;
        currentTestBed = undefined;
    });

    it.each([CellLinkPopupPure, MobileCellLinkPopupPure])('renders the tip inside the existing link card', (Popup) => {
        currentTestBed = createPopupTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const customRange = { ...currentTestBed.customRange, properties: { ...currentTestBed.customRange.properties, tooltip: '<b>Read this first</b>' } };
        act(() => root!.render(
            <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                <Popup unitId={UNIT_ID} subUnitId={SUB_UNIT_ID} row={0} col={0} customRange={customRange} type={HyperLinkEditSourceType.VIEWING} editPermission copyPermission />
            </RediContext.Provider>
        ));
        expect(container.textContent).toContain('<b>Read this first</b>');
        expect(container.querySelector('b')).toBeNull();
        expect(container.firstElementChild?.textContent).toContain('<b>Read this first</b>');
    });

    it('opens the edit panel for the selected sheet hyperlink range', async () => {
        currentTestBed = createPopupTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const executedCommands: Array<{ id: string; params: unknown }> = [];
        currentTestBed.commandService.onCommandExecuted((command) => {
            executedCommands.push({ id: command.id, params: command.params });
        });
        const actions = renderPopup(root, container, currentTestBed);
        expect(actions.copy?.disabled).toBe(true);

        await act(async () => {
            actions.edit.click();
            await Promise.resolve();
        });

        expect(executedCommands).toContainEqual({
            id: OpenHyperLinkEditPanelOperation.id,
            params: {
                unitId: UNIT_ID,
                subUnitId: SUB_UNIT_ID,
                row: 0,
                col: 0,
                customRangeId: 'link-range',
                type: HyperLinkEditSourceType.VIEWING,
            },
        });
    });

    it('labels the mobile navigation action and shows the hyperlink name', () => {
        currentTestBed = createPopupTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        currentTestBed.injector.get(LocaleService).setLocale(LocaleType.EN_US);

        act(() => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <MobileCellLinkPopupPure
                        unitId={UNIT_ID}
                        subUnitId={SUB_UNIT_ID}
                        row={0}
                        col={0}
                        customRange={currentTestBed!.customRange}
                        type={HyperLinkEditSourceType.VIEWING}
                    />
                </RediContext.Provider>
            );
        });

        const openLinkButton = container.querySelector('button');
        expect(openLinkButton?.textContent).toContain('Open link');
        expect(openLinkButton?.textContent).toContain('https://univer.ai');
    });

    it('removes the hyperlink custom range from the sheet cell', () => {
        currentTestBed = createPopupTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const actions = renderPopup(root, container, currentTestBed);

        act(() => {
            actions.remove.click();
        });

        const cell = currentTestBed.workbook.getSheetBySheetId(SUB_UNIT_ID)?.getCellRaw(0, 0);

        expect(cell?.p?.body?.customRanges?.some((range) => range.rangeId === 'link-range')).toBe(false);
        expect(cell?.p?.body?.dataStream).toBe('Univer\r\n');
    });
});
