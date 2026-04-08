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

import { describe, expect, it, vi } from 'vitest';
import { Graphics } from './graphics.extension';

describe('Graphics extension', () => {
    it('should register renderer, draw ranges, copy and dispose', () => {
        const graphics = new Graphics();
        const rendererA = vi.fn();
        const rendererB = vi.fn();
        graphics.registerRenderer('a', rendererA);
        graphics.registerRenderer('b', rendererB);

        const skeleton = {
            getCellByIndexWithNoHeader: vi.fn((row: number, col: number) => {
                if (row === 0 && col === 0) {
                    return undefined;
                }
                return { row, col };
            }),
        };

        graphics.draw(
            {} as never,
            {} as never,
            skeleton as never,
            [],
            {
                viewRanges: [{
                    startRow: 0,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 0,
                }],
            } as never
        );

        expect(rendererA).toHaveBeenCalledTimes(1);
        expect(rendererB).toHaveBeenCalledTimes(1);

        const copied = graphics.copy();
        const rendererC = vi.fn();
        copied.registerRenderer('c', rendererC);
        copied.draw(
            {} as never,
            {} as never,
            skeleton as never,
            [],
            {
                viewRanges: [{
                    startRow: 1,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 0,
                }],
            } as never
        );
        expect(rendererA).toHaveBeenCalledTimes(2);
        expect(rendererB).toHaveBeenCalledTimes(2);
        expect(rendererC).toHaveBeenCalledTimes(1);

        copied.dispose();
        copied.draw(
            {} as never,
            {} as never,
            skeleton as never,
            [],
            {
                viewRanges: [{
                    startRow: 1,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 0,
                }],
            } as never
        );
        expect(rendererC).toHaveBeenCalledTimes(1);
    });
});
