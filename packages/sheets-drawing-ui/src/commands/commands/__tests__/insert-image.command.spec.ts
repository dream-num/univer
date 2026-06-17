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

import { Inject } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { afterEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../../__tests__/create-sheets-drawing-ui-test-bed';
import { SheetDrawingUpdateController } from '../../../controllers/sheet-drawing-update.controller';
import { InsertCellImageCommand, InsertFloatImageCommand } from '../insert-image.command';

class TestSheetDrawingUpdateController {
    private _floatImages: string[] = [];
    private _cellImageCount = 0;
    private _filePickerCount = 0;
    private _failedFileNames = new Set<string>();

    failFile(name: string): void {
        this._failedFileNames.add(name);
    }

    get floatImages(): string[] {
        return this._floatImages;
    }

    get cellImageCount(): number {
        return this._cellImageCount;
    }

    get filePickerCount(): number {
        return this._filePickerCount;
    }

    async insertFloatImage(): Promise<boolean> {
        this._filePickerCount += 1;
        this._floatImages.push('picked-file');
        return true;
    }

    async insertFloatImageByFile(file: File): Promise<boolean> {
        if (this._failedFileNames.has(file.name)) {
            return false;
        }
        this._floatImages.push(file.name);
        return true;
    }

    async insertCellImage(): Promise<boolean> {
        this._cellImageCount += 1;
        return true;
    }
}

class TestRenderManagerService {
    constructor(
        @Inject(TestSheetDrawingUpdateController) private readonly _controller: TestSheetDrawingUpdateController
    ) {}

    get controller(): TestSheetDrawingUpdateController {
        return this._controller;
    }

    getRenderUnitById() {
        return {
            with: (token: unknown) => {
                if (token === SheetDrawingUpdateController) {
                    return this._controller;
                }

                return null;
            },
        };
    }

    getRenderById() {
        return this.getRenderUnitById();
    }
}

function createImageFile(name: string): File {
    return new File(['image'], name, { type: 'image/png' });
}

describe('insert image commands', () => {
    afterEach(() => {
        // each test disposes its own univer instance
    });

    it('inserts every selected file as a floating image', async () => {
        const testBed = createSheetsDrawingUiTestBed(undefined, [
            [TestSheetDrawingUpdateController],
            [IRenderManagerService, { useClass: TestRenderManagerService as never }],
        ]);
        const renderManagerService = testBed.get(IRenderManagerService) as unknown as TestRenderManagerService;
        testBed.commandService.registerCommand(InsertFloatImageCommand);

        expect(await testBed.commandService.executeCommand(InsertFloatImageCommand.id, {
            files: [
                createImageFile('first.png'),
                createImageFile('second.png'),
            ],
        })).toBe(true);

        expect(renderManagerService.controller.floatImages).toEqual(['first.png', 'second.png']);

        testBed.univer.dispose();
    });

    it('returns false when one selected floating image fails to insert', async () => {
        const testBed = createSheetsDrawingUiTestBed(undefined, [
            [TestSheetDrawingUpdateController],
            [IRenderManagerService, { useClass: TestRenderManagerService as never }],
        ]);
        const renderManagerService = testBed.get(IRenderManagerService) as unknown as TestRenderManagerService;
        renderManagerService.controller.failFile('broken.png');
        testBed.commandService.registerCommand(InsertFloatImageCommand);

        expect(await testBed.commandService.executeCommand(InsertFloatImageCommand.id, {
            files: [
                createImageFile('ok.png'),
                createImageFile('broken.png'),
            ],
        })).toBe(false);
        expect(renderManagerService.controller.floatImages).toEqual(['ok.png']);

        testBed.univer.dispose();
    });

    it('opens the floating image picker when no files are provided', async () => {
        const testBed = createSheetsDrawingUiTestBed(undefined, [
            [TestSheetDrawingUpdateController],
            [IRenderManagerService, { useClass: TestRenderManagerService as never }],
        ]);
        const renderManagerService = testBed.get(IRenderManagerService) as unknown as TestRenderManagerService;
        testBed.commandService.registerCommand(InsertFloatImageCommand);

        expect(await testBed.commandService.executeCommand(InsertFloatImageCommand.id, { files: null })).toBe(true);
        expect(renderManagerService.controller.filePickerCount).toBe(1);
        expect(renderManagerService.controller.floatImages).toEqual(['picked-file']);

        testBed.univer.dispose();
    });

    it('inserts an image into the selected cell', async () => {
        const testBed = createSheetsDrawingUiTestBed(undefined, [
            [TestSheetDrawingUpdateController],
            [IRenderManagerService, { useClass: TestRenderManagerService as never }],
        ]);
        const renderManagerService = testBed.get(IRenderManagerService) as unknown as TestRenderManagerService;
        testBed.commandService.registerCommand(InsertCellImageCommand);

        expect(await testBed.commandService.executeCommand(InsertCellImageCommand.id)).toBe(true);
        expect(renderManagerService.controller.cellImageCount).toBe(1);

        testBed.univer.dispose();
    });
});
