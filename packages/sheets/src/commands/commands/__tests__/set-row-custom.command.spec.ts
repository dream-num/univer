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

import type { ISetRowCustomMutationParams } from '../../mutations/set-row-custom.mutation';
import { ICommandService, type Injector, IUniverInstanceService, RedoCommand, UndoCommand, type Univer, UniverInstanceType, type Workbook } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SetRowCustomMutation } from '../../mutations/set-row-custom.mutation';
import { SetRowCustomCommand } from '../set-row-custom.command';
import { createCommandTestBed } from './create-command-test-bed';

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

describe('test set row custom commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    function getRowCustom(row: number): any {
        const worksheet = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!;
        const rowManager = worksheet.getRowManager();
        const rowInfo = rowManager.getRow(row);

        return rowInfo?.custom;
    }

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRowCustomCommand);
        commandService.registerCommand(SetRowCustomMutation);
    });

    afterEach(() => univer.dispose());

    it('should set custom properties on rows', async () => {
        expect(getRowCustom(1)).toBe(undefined);

        const params: ISetRowCustomMutationParams = {
            unitId: 'test',
            subUnitId: 'sheet1',
            custom: {
                1: {
                    color: 'red',
                },
                2: {
                    color: 'green',
                },
                5: {
                    color: 'blue',
                },
            },
        };
        await commandService.executeCommand(SetRowCustomCommand.id, params);

        expect(getRowCustom(1)).toEqual({ color: 'red' });
        expect(getRowCustom(2)).toEqual({ color: 'green' });
        expect(getRowCustom(5)).toEqual({ color: 'blue' });

        await commandService.executeCommand(UndoCommand.id);
        expect(getRowCustom(1)).toBeUndefined();
        expect(getRowCustom(2)).toBeNull();
        expect(getRowCustom(5)).toBeNull();

        await commandService.executeCommand(RedoCommand.id);
        expect(getRowCustom(1)).toEqual({ color: 'red' });
        expect(getRowCustom(2)).toEqual({ color: 'green' });
        expect(getRowCustom(5)).toEqual({ color: 'blue' });
    });
});
