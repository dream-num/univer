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

import type { Nullable } from '@univerjs/core';
import type { IViewportInfo, Vector2 } from '../../../basics/vector2';
import type { UniverRenderingContext } from '../../../context';
import type { SpreadsheetSkeleton } from '../sheet.render-skeleton';
import { describe, expect, it, vi } from 'vitest';
import { RENDER_CLASS_TYPE } from '../../../basics/const';
import { SheetComponent } from '../sheet-component';

class TestSheetComponent extends SheetComponent {
    readonly drawCalls: Array<{ ctx: UniverRenderingContext; bounds?: IViewportInfo }> = [];

    getDocuments() {
        return null;
    }

    getNoMergeCellPositionByIndex(): Nullable<{ startY: number; startX: number; endX: number; endY: number }> {
        return null;
    }

    getSelectionBounding(): Nullable<{ startRow: number; startColumn: number; endRow: number; endColumn: number }> {
        return null;
    }

    protected override _draw(ctx: UniverRenderingContext, bounds?: IViewportInfo): void {
        this.drawCalls.push({ ctx, bounds });
    }
}

function createCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
    } as unknown as UniverRenderingContext;
}

describe('SheetComponent', () => {
    it('renders visible sheet components inside a canvas save and restore pair', () => {
        const component = new TestSheetComponent('sheet-component');
        const ctx = createCtx();
        const bounds = { viewBound: { left: 0, top: 0, right: 100, bottom: 80 } } as IViewportInfo;

        component.render(ctx, bounds);

        expect(ctx.save).toHaveBeenCalledTimes(1);
        expect(ctx.restore).toHaveBeenCalledTimes(1);
        expect(component.drawCalls).toEqual([{ ctx, bounds }]);
    });

    it('updates the skeleton and syncs the scene transformer offset', () => {
        const component = new TestSheetComponent('sheet-component');
        const scene = { updateTransformerZero: vi.fn() };
        vi.spyOn(component as any, 'getScene').mockReturnValue(scene);
        const skeleton = {
            rowHeaderWidth: 46,
            columnHeaderHeight: 28,
        } as SpreadsheetSkeleton;

        component.updateSkeleton(skeleton);

        expect(component.getSkeleton()).toBe(skeleton);
        expect(scene.updateTransformerZero).toHaveBeenCalledWith(46, 28);
    });

    it('uses viewer ancestor scale for hit testing helpers and clears skeleton on dispose', () => {
        const component = new TestSheetComponent('sheet-component', { rowHeaderWidth: 1, columnHeaderHeight: 1 } as SpreadsheetSkeleton);
        component.parent = {
            classType: RENDER_CLASS_TYPE.SCENE_VIEWER,
            scaleX: 2,
            scaleY: 3,
            ancestorScaleX: 1.25,
            ancestorScaleY: 1.5,
            removeObject: vi.fn(),
        } as any;

        expect(component.getParentScale()).toEqual({ scaleX: 1.25, scaleY: 1.5 });
        expect(component.getScrollXYByRelativeCoords({} as Vector2)).toEqual({ x: 0, y: 0 });

        component.dispose();
        expect(component.getSkeleton()).toBeNull();
    });
});
