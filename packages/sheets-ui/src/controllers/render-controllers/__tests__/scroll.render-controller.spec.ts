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

import { FOCUSING_SHEET, ICommandService, IContextService } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { SetScrollRelativeCommand } from '../../../commands/commands/set-scroll.command';
import { SheetsScrollRenderController } from '../scroll.render-controller';
import { createRenderTestBed } from './render-test-bed';

describe('SheetsScrollRenderController', () => {
    it('executes relative scroll command on mousewheel when focused', () => {
        const testBed = createRenderTestBed();
        const { context, scene, contextService } = testBed;
        const commandService = testBed.get(ICommandService);
        const executeSpy = vi.spyOn(commandService, 'executeCommand');

        contextService.setContextValue(FOCUSING_SHEET, true);

        const _controller = new SheetsScrollRenderController(
            context as any,
            testBed.injector as any,
            testBed.sheetSkeletonManagerService as any,
            testBed.get(IContextService) as any,
            commandService as any,
            { getRenderById: vi.fn(() => ({ scene })) } as any,
            {
                rawScrollInfo$: { subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })) },
                currentSkeletonBefore$: { subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })) },
                setValidScrollStateToCurrSheet: vi.fn(),
                validViewportScrollInfo$: { next: vi.fn() },
                setSearchParam: vi.fn(),
                getScrollStateByParam: vi.fn(() => null),
                calcViewportScrollFromRowColOffset: vi.fn(() => ({ viewportScrollX: 0, viewportScrollY: 0 })),
            } as any
        );

        const preventDefault = vi.fn();
        scene.onMouseWheel$.emit(
            { ctrlKey: false, shiftKey: false, deltaX: 5, deltaY: 10, preventDefault },
            { stopPropagation: () => { } }
        );

        expect(executeSpy).toHaveBeenCalledWith(SetScrollRelativeCommand.id, { offsetX: 5, offsetY: 10 });

        // Avoid disposing here: faked render context does not implement all IDisposable contracts.
        void _controller;
    });
});
