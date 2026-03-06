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

import type { Graphics } from '../views/extensions/graphics.extension';
import { describe, expect, it, vi } from 'vitest';
import { SheetGraphicsRenderController } from './graphics-render.controller';

describe('SheetGraphicsRenderController', () => {
    it('should init extension, printing interceptor, and register renderer', () => {
        const registered: unknown[] = [];
        let interceptorHandler: ((component: unknown, context: { spreadsheet: { register: (obj: unknown) => void } }, next: (component: unknown) => unknown) => unknown) | undefined;

        const context = {
            mainComponent: {
                getExtensionByKey: vi.fn(() => undefined),
                register: vi.fn((ext: unknown) => {
                    registered.push(ext);
                }),
            },
        };

        const interceptor = {
            getInterceptPoints: vi.fn(() => ({ PRINTING_COMPONENT_COLLECT: 'PRINTING_COMPONENT_COLLECT' })),
            intercept: vi.fn((_point, config: { handler: typeof interceptorHandler }) => {
                interceptorHandler = config.handler;
                return { dispose: vi.fn() };
            }),
        };

        const controller = new SheetGraphicsRenderController(
            context as never,
            { interceptor } as never
        );

        expect(context.mainComponent.getExtensionByKey).toHaveBeenCalled();
        expect(context.mainComponent.register).toHaveBeenCalledTimes(1);

        const extension = registered[0] as Graphics;
        const renderer = vi.fn();
        controller.registerRenderer('feature-a', renderer as never);

        extension.draw(
            {} as never,
            {} as never,
            { getCellByIndexWithNoHeader: vi.fn(() => ({ row: 1, col: 1 })) } as never,
            [],
            { viewRanges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }] } as never
        );
        expect(renderer).toHaveBeenCalledTimes(1);

        const copySpy = vi.spyOn(extension, 'copy');
        const printSheet = { register: vi.fn() };
        const next = vi.fn((value: unknown) => ({ passthrough: value }));
        const result = interceptorHandler?.('component-a', { spreadsheet: printSheet }, next);

        expect(copySpy).toHaveBeenCalledTimes(1);
        expect(printSheet.register).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith('component-a');
        expect(result).toEqual({ passthrough: 'component-a' });

        controller.dispose();
    });

    it('should skip init extension when extension already exists and keep printing flow', () => {
        let interceptorHandler: ((component: unknown, context: { spreadsheet: { register: (obj: unknown) => void } }, next: (component: unknown) => unknown) => unknown) | undefined;
        const context = {
            mainComponent: {
                getExtensionByKey: vi.fn(() => ({})),
                register: vi.fn(),
            },
        };
        const interceptor = {
            getInterceptPoints: vi.fn(() => ({ PRINTING_COMPONENT_COLLECT: 'PRINTING_COMPONENT_COLLECT' })),
            intercept: vi.fn((_point, config: { handler: typeof interceptorHandler }) => {
                interceptorHandler = config.handler;
                return { dispose: vi.fn() };
            }),
        };

        const controller = new SheetGraphicsRenderController(
            context as never,
            { interceptor } as never
        );

        expect(context.mainComponent.register).not.toHaveBeenCalled();
        expect(() => controller.registerRenderer('noop', vi.fn() as never)).not.toThrow();

        const printSheet = { register: vi.fn() };
        const next = vi.fn((value: unknown) => value);
        const result = interceptorHandler?.('component-b', { spreadsheet: printSheet }, next);
        expect(printSheet.register).not.toHaveBeenCalled();
        expect(result).toBe('component-b');
    });
});
