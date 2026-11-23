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

import type { Workbook } from '@univerjs/core';
import type { IMouseEvent } from '@univerjs/engine-render';
import { CommandType, ICommandService, IUniverInstanceService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { SheetsTableButtonStateEnum } from '@univerjs/sheets-table';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
    IOpenTableFilterPanelOperationParams,
} from '../../../commands/operations/open-table-filter-dialog.opration';
import {
    OpenTableFilterPanelOperation,
    RequestOpenTableFilterPanelOperation,
} from '../../../commands/operations/open-table-filter-dialog.opration';
import { SheetsTableFilterButtonShape } from '../table-filter-button.shape';

function createPointerEvent(button: number): IMouseEvent {
    return { button } as IMouseEvent;
}

async function waitForFilterButtonDelay(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 230));
    await Promise.resolve();
}

describe('sheet table filter button shape', () => {
    let univer: Univer | undefined;

    afterEach(() => {
        univer?.dispose();
        univer = undefined;
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    function createShape(executedParams: IOpenTableFilterPanelOperationParams[]): SheetsTableFilterButtonShape {
        univer = new Univer();
        univer.registerPlugin(UniverRenderEnginePlugin);
        const commandService = univer.__getInjector().get(ICommandService);
        commandService.registerCommand(RequestOpenTableFilterPanelOperation);
        commandService.registerCommand({
            id: OpenTableFilterPanelOperation.id,
            type: CommandType.OPERATION,
            handler: (_accessor, params?: IOpenTableFilterPanelOperationParams) => {
                if (params) {
                    executedParams.push(params);
                }
                return true;
            },
        });

        return univer.__getInjector().createInstance(SheetsTableFilterButtonShape, 'filter-button', {
            width: 16,
            height: 16,
            cellWidth: 72,
            cellHeight: 28,
            iconColor: '#ffffff',
            hoverBackground: '#eeeeee',
            hoverIconColor: '#111111',
            filterParams: {
                row: 3,
                col: 4,
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                buttonState: SheetsTableButtonStateEnum.FilterNoneSortNone,
                tableId: 'table-orders',
            },
        });
    }

    it.each(['unchanged', 'focus changed', 'disposed', 'reused', 'unit changed', 'sheet changed'])('keeps delayed requests owned by their source scene: %s', async (change) => {
        vi.useFakeTimers();
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return { canvas: this, setTransform: vi.fn(), clearRect: vi.fn() } as unknown as CanvasRenderingContext2D;
        });
        const executedParams: IOpenTableFilterPanelOperationParams[] = [];
        const shape = createShape(executedParams);
        univer!.createUnit(UniverInstanceType.UNIVER_SHEET, {
            id: 'unit-1',
            name: '',
            appVersion: '',
            locale: LocaleType.EN_US,
            sheetOrder: ['sheet-1', 'sheet-2'],
            sheets: { 'sheet-1': { id: 'sheet-1', name: '' }, 'sheet-2': { id: 'sheet-2', name: 'Other' } },
            styles: {},
        });
        const renders = univer!.__getInjector().get(IRenderManagerService);
        const primary = renders.createRender('unit-1');
        renders.createRender('unit-1', undefined, 'right-pane');
        const instances = univer!.__getInjector().get(IUniverInstanceService);
        instances.focusUnit('unit-1');
        primary.scene.addObject(shape);
        shape.onPointerDown(createPointerEvent(0));
        if (change === 'unit changed') {
            univer!.createUnit(UniverInstanceType.UNIVER_SHEET, {
                id: 'other-unit',
                name: '',
                appVersion: '',
                locale: LocaleType.EN_US,
                sheetOrder: [],
                sheets: {},
                styles: {},
            });
            instances.focusUnit('other-unit');
        } else if (change === 'sheet changed') {
            const workbook = instances.getUnit<Workbook>('unit-1', UniverInstanceType.UNIVER_SHEET)!;
            workbook.setActiveSheet(workbook.getSheetBySheetId('sheet-2')!);
        } else if (change === 'focus changed') {
            renders.focusRender?.('right-pane');
        } else if (change === 'disposed') {
            shape.dispose();
        } else if (change === 'reused') {
            shape.setShapeProps({ filterParams: {
                row: 8,
                col: 2,
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                buttonState: SheetsTableButtonStateEnum.FilterNoneSortNone,
                tableId: 'other-table',
            } });
        }
        await vi.advanceTimersByTimeAsync(200);
        expect(executedParams.length).toBe(change === 'unchanged' ? 1 : 0);
    });

    it('opens the table filter panel with the current cell and table parameters on primary pointer down', async () => {
        const executedParams: IOpenTableFilterPanelOperationParams[] = [];
        const shape = createShape(executedParams);

        shape.onPointerDown(createPointerEvent(0));
        await waitForFilterButtonDelay();

        expect(executedParams).toEqual([{
            row: 3,
            col: 4,
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            tableId: 'table-orders',
        }]);
    });

    it('opens the filter panel with updated cell and table parameters after the shape is reused', async () => {
        const executedParams: IOpenTableFilterPanelOperationParams[] = [];
        const shape = createShape(executedParams);

        shape.setShapeProps({
            filterParams: {
                row: 8,
                col: 2,
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                buttonState: SheetsTableButtonStateEnum.FilterNoneSortNone,
                tableId: 'table-archive',
            },
        });
        shape.onPointerDown(createPointerEvent(0));
        await waitForFilterButtonDelay();

        expect(executedParams).toEqual([{
            row: 8,
            col: 2,
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            tableId: 'table-archive',
        }]);
    });

    it('keeps the filter panel closed for secondary pointer down', async () => {
        const executedParams: IOpenTableFilterPanelOperationParams[] = [];
        const shape = createShape(executedParams);

        shape.onPointerDown(createPointerEvent(2));
        await waitForFilterButtonDelay();

        expect(executedParams).toEqual([]);
    });
});
