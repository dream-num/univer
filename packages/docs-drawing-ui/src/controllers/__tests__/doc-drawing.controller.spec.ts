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
import { ComponentManager, IMenuManagerService, IShortcutService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { createDocUiTestBed } from '../../__tests__/create-doc-ui-test-bed';
import { InsertDocImageCommand } from '../../commands/commands/insert-image.command';
import { ClearDocDrawingTransformerOperation } from '../../commands/operations/clear-drawing-transformer.operation';
import { DocDrawingUIController } from '../doc-drawing.controller';
import { DocDrawingUpdateRenderController } from '../render-controllers/doc-drawing-update.render-controller';

describe('DocDrawingUIController', () => {
    it('wires doc drawing commands into the real command service and registers the ui surface', async () => {
        const insertDocImage = vi.fn(() => true);
        const debounceRefreshControls = vi.fn();
        const componentManager = {
            register: vi.fn(() => ({ dispose: vi.fn() })),
        };
        const menuManagerService = {
            mergeMenu: vi.fn(),
        };
        const shortcutService = {
            registerShortcut: vi.fn(() => ({ dispose: vi.fn() })),
        };

        const testBed = createDocUiTestBed(undefined, [
            [ComponentManager, { useValue: componentManager as never }],
            [IMenuManagerService, { useValue: menuManagerService as never }],
            [IShortcutService, { useValue: shortcutService as never }],
            [IRenderManagerService, {
                useValue: {
                    getRenderById: () => ({
                        scene: {
                            getTransformer: () => ({
                                debounceRefreshControls,
                            }),
                        },
                        with: <T>(token: T) => {
                            if (token === DocDrawingUpdateRenderController) {
                                return { insertDocImage } as T;
                            }

                            return null as T;
                        },
                    }),
                    getRenderUnitById: () => ({
                        scene: {
                            getTransformer: () => ({
                                debounceRefreshControls,
                            }),
                        },
                        with: <T>(token: T) => {
                            if (token === DocDrawingUpdateRenderController) {
                                return { insertDocImage } as T;
                            }

                            return null as T;
                        },
                    }),
                } as unknown as IRenderManagerService,
            }],
        ]);

        const controller = testBed.injector.createInstance(DocDrawingUIController);
        const commandService = testBed.get(ICommandService);

        expect(await commandService.executeCommand(InsertDocImageCommand.id)).toBe(true);
        expect(await commandService.executeCommand(ClearDocDrawingTransformerOperation.id, ['test-doc'])).toBe(true);

        expect(insertDocImage).toHaveBeenCalledTimes(1);
        expect(debounceRefreshControls).toHaveBeenCalledTimes(1);
        expect(componentManager.register).toHaveBeenCalled();
        expect(menuManagerService.mergeMenu).toHaveBeenCalled();
        expect(shortcutService.registerShortcut).toHaveBeenCalled();

        controller.dispose();
        testBed.univer.dispose();
    });
});
