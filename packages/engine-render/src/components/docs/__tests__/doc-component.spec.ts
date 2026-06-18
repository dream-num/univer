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

import type { IViewportInfo } from '../../../basics/vector2';
import type { UniverRenderingContext } from '../../../context';
import { describe, expect, it, vi } from 'vitest';
import { RENDER_CLASS_TYPE } from '../../../basics/const';
import { PageLayoutType } from '../../../basics/i-document-skeleton-cached';
import { DocComponent } from '../doc-component';

class TestDocComponent extends DocComponent {
    readonly drawCalls: Array<{ ctx: UniverRenderingContext; bounds?: Partial<IViewportInfo> }> = [];

    protected override _draw(ctx: UniverRenderingContext, bounds?: Partial<IViewportInfo>): void {
        this.drawCalls.push({ ctx, bounds });
    }
}

function createCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        transform: vi.fn(),
    } as any;
}

function createPage() {
    return {
        pageWidth: 100,
        pageHeight: 80,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 8,
        marginBottom: 8,
    } as any;
}

describe('DocComponent', () => {
    it('uses default document layout config when no config is provided', () => {
        const component = new TestDocComponent('doc-component');

        expect(component.pageMarginLeft).toBe(17);
        expect(component.pageMarginTop).toBe(14);
        expect(component.pageLayoutType).toBe(PageLayoutType.VERTICAL);
        expect(component.getSkeleton()).toBeUndefined();
    });

    it('renders only when a skeleton is attached and the component is visible', () => {
        const component = new TestDocComponent('doc-component');
        const ctx = createCtx();

        component.render(ctx);
        expect(ctx.save).not.toHaveBeenCalled();

        component.setSkeleton({} as any);
        component.render(ctx, { viewBound: { left: 0, top: 0, right: 100, bottom: 100 } } as IViewportInfo);
        expect(ctx.save).toHaveBeenCalledTimes(1);
        expect(ctx.transform).toHaveBeenCalledTimes(1);
        expect(ctx.restore).toHaveBeenCalledTimes(1);
        expect(component.drawCalls).toHaveLength(1);

        component.hide();
        component.render(ctx);
        expect(component.drawCalls).toHaveLength(1);
    });

    it('uses scene ancestor scale and skips pages outside the viewport', () => {
        const component = new TestDocComponent('doc-component', {} as any, {
            pageMarginLeft: 24,
            pageMarginTop: 18,
            pageLayoutType: PageLayoutType.HORIZONTAL,
        });
        component.parent = {
            classType: RENDER_CLASS_TYPE.SCENE,
            scaleX: 2,
            scaleY: 3,
            ancestorScaleX: 1.25,
            ancestorScaleY: 1.5,
        } as any;
        const bounds = { viewBound: { left: 200, top: 200, right: 300, bottom: 300 } } as IViewportInfo;

        expect(component.pageMarginLeft).toBe(24);
        expect(component.pageMarginTop).toBe(18);
        expect(component.pageLayoutType).toBe(PageLayoutType.HORIZONTAL);
        expect(component.getParentScale()).toEqual({ scaleX: 1.25, scaleY: 1.5 });
        expect(component.isSkipByDiffBounds(createPage(), 0, 0, bounds)).toBe(true);
        expect(component.isSkipByDiffBounds(createPage(), 220, 220, bounds)).toBe(false);
        expect(component.isSkipByDiffBounds({ ...createPage(), pageWidth: Number.POSITIVE_INFINITY }, 220, 400, bounds)).toBe(false);
        expect(component.isSkipByDiffBounds({ ...createPage(), pageHeight: Number.POSITIVE_INFINITY }, 400, 220, bounds)).toBe(false);
    });
});
