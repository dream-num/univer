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

import type { IMouseEvent } from '@univerjs/engine-render';
import type { IOpenTableFilterPanelOperationParams } from '../../../commands/operations/open-table-filter-dialog.opration';
import { CommandType, ICommandService, Univer } from '@univerjs/core';
import { SheetsTableButtonStateEnum } from '@univerjs/sheets-table';
import { afterEach, describe, expect, it } from 'vitest';
import { OpenTableFilterPanelOperation } from '../../../commands/operations/open-table-filter-dialog.opration';
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
    });

    function createShape(executedParams: IOpenTableFilterPanelOperationParams[]): SheetsTableFilterButtonShape {
        univer = new Univer();
        const commandService = univer.__getInjector().get(ICommandService);
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

        return new SheetsTableFilterButtonShape('filter-button', {
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
        }, commandService);
    }

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
