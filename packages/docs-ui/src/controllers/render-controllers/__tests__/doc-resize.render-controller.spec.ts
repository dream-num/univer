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

import { EventSubject } from '@univerjs/core';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DocResizeRenderController, hasRenderableDocSkeleton } from '../doc-resize.render-controller';

describe('hasRenderableDocSkeleton', () => {
    it('rejects missing and empty skeletons', () => {
        expect(hasRenderableDocSkeleton(undefined)).toBe(false);
        expect(hasRenderableDocSkeleton({ getSkeleton: () => null })).toBe(false);
        expect(hasRenderableDocSkeleton({ getSkeleton: () => ({ getSkeletonData: () => ({ pages: [] }) }) })).toBe(false);
    });

    it('accepts a skeleton with at least one page', () => {
        expect(hasRenderableDocSkeleton({
            getSkeleton: () => ({ getSkeletonData: () => ({ pages: [{}] }) }),
        })).toBe(true);
    });
});

describe('DocResizeRenderController', () => {
    it('refreshes page layout and text selection after sidebar layout changes', async () => {
        const calculatePagePosition = vi.fn();
        const refreshRanges = vi.fn();
        const refreshSelection = vi.fn();
        const sidebarOptions$ = new Subject();
        const controller = new DocResizeRenderController(
            {
                unitId: 'doc-1',
                engine: {
                    onTransformChange$: new EventSubject(),
                },
                mainComponent: {
                    getSkeleton: () => ({ getSkeletonData: () => ({ pages: [{}] }) }),
                },
            } as never,
            { calculatePagePosition } as never,
            { refreshSelection } as never,
            { refreshRanges } as never,
            { sidebarOptions$ } as never
        );

        sidebarOptions$.next({ visible: true });
        expect(calculatePagePosition).not.toHaveBeenCalled();

        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        expect(calculatePagePosition).toHaveBeenCalledOnce();
        expect(refreshRanges).toHaveBeenCalledOnce();
        expect(refreshSelection).toHaveBeenCalledOnce();
        controller.dispose();
    });
});
