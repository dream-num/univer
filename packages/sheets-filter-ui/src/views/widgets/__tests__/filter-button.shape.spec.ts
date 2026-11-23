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
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IOpenFilterPanelOperationParams } from '../../../commands/operations/sheets-filter.operation';
import {
    OpenFilterPanelOperation,
    RequestOpenFilterPanelOperation,
} from '../../../commands/operations/sheets-filter.operation';
import { SheetsFilterButtonShape } from '../filter-button.shape';

describe('sheet filter button shape', () => {
    let univer: Univer | undefined;

    afterEach(() => {
        univer?.dispose();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it.each(['unchanged', 'focus changed', 'disposed', 'reused', 'unit changed', 'sheet changed'])('keeps delayed requests owned by their source scene: %s', async (change) => {
        vi.useFakeTimers();
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return { canvas: this, setTransform: vi.fn(), clearRect: vi.fn() } as unknown as CanvasRenderingContext2D;
        });
        univer = new Univer();
        univer.registerPlugin(UniverRenderEnginePlugin);
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
            id: 'unit-1',
            name: '',
            appVersion: '',
            locale: LocaleType.EN_US,
            sheetOrder: ['sheet-1', 'sheet-2'],
            sheets: { 'sheet-1': { id: 'sheet-1', name: '' }, 'sheet-2': { id: 'sheet-2', name: 'Other' } },
            styles: {},
        });
        const injector = univer.__getInjector();
        const commands = injector.get(ICommandService);
        const executedParams: IOpenFilterPanelOperationParams[] = [];
        commands.registerCommand(RequestOpenFilterPanelOperation);
        commands.registerCommand({
            id: OpenFilterPanelOperation.id,
            type: CommandType.OPERATION,
            handler: (_accessor, params?: IOpenFilterPanelOperationParams) => {
                if (params) {
                    executedParams.push(params);
                }
                return true;
            },
        });
        const shape = injector.createInstance(SheetsFilterButtonShape, 'filter-button', {
            width: 16,
            height: 16,
            cellWidth: 72,
            cellHeight: 28,
            filterParams: { col: 4, unitId: 'unit-1', subUnitId: 'sheet-1', hasCriteria: false },
        });
        const renders = injector.get(IRenderManagerService);
        const primary = renders.createRender('unit-1');
        renders.createRender('unit-1', undefined, 'right-pane');
        const instances = univer.__getInjector().get(IUniverInstanceService);
        instances.focusUnit('unit-1');
        primary.scene.addObject(shape);
        shape.onPointerDown({ button: 0 } as IMouseEvent);
        if (change === 'unit changed') {
            univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
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
            shape.setShapeProps({ filterParams: { col: 2, unitId: 'unit-1', subUnitId: 'sheet-1', hasCriteria: false } });
        }
        await vi.advanceTimersByTimeAsync(200);
        expect(executedParams).toEqual(change === 'unchanged'
            ? [{ col: 4, unitId: 'unit-1', subUnitId: 'sheet-1' }]
            : []);
    });
});
