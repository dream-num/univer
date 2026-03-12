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

import type { ISelectionWithStyle } from '@univerjs/sheets';
import { ICommandService, RANGE_TYPE } from '@univerjs/core';
import { MoveRowsCommand, SheetsSelectionsService } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import { HeaderMoveRenderController } from '../header-move.render-controller';
import { createRenderTestBed } from './render-test-bed';

describe('HeaderMoveRenderController', () => {
    it('moves selected rows by dragging row header and triggers command', () => {
        const testBed = createRenderTestBed();
        const { context, injector, sheetSkeletonManagerService } = testBed;

        // Prepare a row selection (row 1) as a realistic precondition.
        const selectionManagerService = injector.get(SheetsSelectionsService);
        const skeleton = sheetSkeletonManagerService.getCurrentSkeleton();
        const endColumn = skeleton.worksheet.getColumnCount() - 1;
        const selection: ISelectionWithStyle = {
            range: { startRow: 1, endRow: 1, startColumn: 0, endColumn, rangeType: RANGE_TYPE.ROW },
            primary: {
                startRow: 1,
                endRow: 1,
                startColumn: 0,
                endColumn,
                actualColumn: 0,
                actualRow: 1,
                isMerged: false,
                isMergedMainCell: false,
            },
            style: null,
        };
        selectionManagerService.addSelections([selection]);

        const commandService = injector.get(ICommandService);
        const executeSpy = vi.spyOn(commandService, 'executeCommand').mockResolvedValue(true as any);

        const controller = injector.createInstance(HeaderMoveRenderController, context as any);
        controller.interceptor.intercept(controller.interceptor.getInterceptPoints().HEADER_MOVE_PERMISSION_CHECK, {
            handler: () => true,
        });

        const rowHeader = context.components.get(SHEET_VIEW_KEY.ROW) as any;
        // Pointer down on row header at row 1.
        rowHeader.onPointerDown$.emit({ offsetX: 10, offsetY: 25, button: 0 }, { isStopPropagation: false });
        // Drag upward to before row 0.
        (context.scene as any).onPointerMove$.emit({ offsetX: 10, offsetY: 5, button: 0 }, {});
        // Release.
        (context.scene as any).onPointerUp$.emit({ offsetX: 10, offsetY: 5, button: 0 }, {});

        expect(executeSpy).toHaveBeenCalledWith(
            MoveRowsCommand.id,
            expect.objectContaining({
                fromRange: expect.objectContaining({ startRow: 1, endRow: 1, rangeType: RANGE_TYPE.ROW }),
                toRange: expect.objectContaining({ startRow: 0 }),
            })
        );

        testBed.univer.dispose();
    });
});
