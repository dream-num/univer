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

import { ICommandService } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../../__tests__/create-sheets-drawing-ui-test-bed';
import { SheetDrawingUpdateController } from '../../../controllers/sheet-drawing-update.controller';
import { InsertCellImageCommand, InsertFloatImageCommand } from '../insert-image.command';

describe('sheet drawing image commands', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('routes float image insertion through the update controller for each provided file', async () => {
        const insertFloatImageByFile = vi.fn(async () => true);
        const testBed = createSheetsDrawingUiTestBed(undefined, [
            [SheetDrawingUpdateController, {
                useValue: {
                    insertFloatImageByFile,
                    insertFloatImage: vi.fn(async () => true),
                    insertCellImage: vi.fn(async () => true),
                },
            }],
        ]);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(InsertFloatImageCommand);

        const files = [
            new File(['left'], 'left.png', { type: 'image/png' }),
            new File(['right'], 'right.png', { type: 'image/png' }),
        ];

        expect(await commandService.executeCommand(InsertFloatImageCommand.id, { files })).toBe(true);
        expect(insertFloatImageByFile).toHaveBeenCalledTimes(2);

        testBed.univer.dispose();
    });

    it('opens the float image picker when no files are provided', async () => {
        const insertFloatImage = vi.fn(async () => true);
        const testBed = createSheetsDrawingUiTestBed(undefined, [
            [SheetDrawingUpdateController, {
                useValue: {
                    insertFloatImageByFile: vi.fn(async () => true),
                    insertFloatImage,
                    insertCellImage: vi.fn(async () => true),
                },
            }],
        ]);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(InsertFloatImageCommand);

        expect(await commandService.executeCommand(InsertFloatImageCommand.id)).toBe(true);
        expect(insertFloatImage).toHaveBeenCalledTimes(1);

        testBed.univer.dispose();
    });

    it('routes cell image insertion through the update controller', async () => {
        const insertCellImage = vi.fn(async () => true);
        const testBed = createSheetsDrawingUiTestBed(undefined, [
            [SheetDrawingUpdateController, {
                useValue: {
                    insertFloatImageByFile: vi.fn(async () => true),
                    insertFloatImage: vi.fn(async () => true),
                    insertCellImage,
                },
            }],
        ]);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(InsertCellImageCommand);

        expect(await commandService.executeCommand(InsertCellImageCommand.id)).toBe(true);
        expect(insertCellImage).toHaveBeenCalledTimes(1);

        testBed.univer.dispose();
    });
});
