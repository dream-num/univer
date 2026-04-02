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
import { IRenderManagerService } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { createDocUiTestBed } from '../../../__tests__/create-doc-ui-test-bed';
import { DocDrawingUpdateRenderController } from '../../../controllers/render-controllers/doc-drawing-update.render-controller';
import { ClearDocDrawingTransformerOperation } from '../../operations/clear-drawing-transformer.operation';
import { GroupDocDrawingCommand } from '../group-doc-drawing.command';
import { InsertDocImageCommand } from '../insert-image.command';

describe('docs drawing ui commands', () => {
    it('routes insert image through the current render controller', async () => {
        const insertDocImage = vi.fn(() => true);
        const testBed = createDocUiTestBed(undefined, [
            [IRenderManagerService, {
                useValue: {
                    getRenderById: () => ({
                        with: <T>(token: T) => token === DocDrawingUpdateRenderController
                            ? ({ insertDocImage } as T)
                            : (null as T),
                    }),
                    getRenderUnitById: () => ({
                        with: <T>(token: T) => token === DocDrawingUpdateRenderController
                            ? ({ insertDocImage } as T)
                            : (null as T),
                    }),
                } as unknown as IRenderManagerService,
            }],
        ]);

        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(InsertDocImageCommand);

        expect(await commandService.executeCommand(InsertDocImageCommand.id, { files: null })).toBe(true);
        expect(insertDocImage).toHaveBeenCalledTimes(1);

        testBed.univer.dispose();
    });

    it('returns false when there is no active render controller for insert image', async () => {
        const testBed = createDocUiTestBed(undefined, [
            [IRenderManagerService, {
                useValue: {
                    getRenderById: () => null,
                    getRenderUnitById: () => null,
                } as unknown as IRenderManagerService,
            }],
        ]);

        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(InsertDocImageCommand);

        expect(await commandService.executeCommand(InsertDocImageCommand.id, { files: null })).toBe(false);

        testBed.univer.dispose();
    });

    it('clears drawing transformers for all requested units', async () => {
        const debounceRefreshControls = vi.fn();
        const testBed = createDocUiTestBed(undefined, [
            [IRenderManagerService, {
                useValue: {
                    getRenderById: () => ({
                        scene: {
                            getTransformer: () => ({
                                debounceRefreshControls,
                            }),
                        },
                    }),
                    getRenderUnitById: () => ({
                        scene: {
                            getTransformer: () => ({
                                debounceRefreshControls,
                            }),
                        },
                    }),
                } as unknown as IRenderManagerService,
            }],
        ]);

        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(ClearDocDrawingTransformerOperation);

        expect(await commandService.executeCommand(ClearDocDrawingTransformerOperation.id, ['doc-1', 'doc-2'])).toBe(true);
        expect(debounceRefreshControls).toHaveBeenCalledTimes(2);

        testBed.univer.dispose();
    });

    it('keeps group command protected as a no-op until the business path is implemented', async () => {
        const testBed = createDocUiTestBed();
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(GroupDocDrawingCommand);

        expect(await commandService.executeCommand(GroupDocDrawingCommand.id, [{
            parent: { unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'group-1' },
            children: [{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'shape-1' }],
        }])).toBe(false);

        testBed.univer.dispose();
    });
});
