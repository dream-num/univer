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
import { SheetFindReplaceHighlightShape } from '../find-replace-highlight.shape';

vi.mock('@univerjs/engine-render', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/engine-render')>('@univerjs/engine-render');
    return {
        ...actual,
        Rect: {
            drawWith: vi.fn(),
        },
        Shape: class {
            width = 0;
            height = 0;
            constructor(_key?: string, _props?: any) {}
            transformByState(state: any) {
                if (state.width) this.width = state.width;
                if (state.height) this.height = state.height;
            }
        },
    };
});

describe('SheetFindReplaceHighlightShape', () => {
    it('should update props and draw activated border', async () => {
        const { Rect } = await import('@univerjs/engine-render');

        const shape = new SheetFindReplaceHighlightShape('k', {
            inHiddenRange: false,
            color: { r: 1, g: 2, b: 3 },
            width: 10,
            height: 20,
        } as any);

        shape.setShapeProps({ activated: true, width: 10, height: 20 } as any);
        (shape as any)._draw({} as any);

        expect(Rect.drawWith).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            strokeWidth: 2,
        }));
    });
});
