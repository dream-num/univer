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

import type { RefObject } from 'react';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { getMobileCanvasPanDelta, useDependency, useMobileCanvasViewport } from '@univerjs/ui';
import { VIEWPORT_KEY } from '../../basics/docs-view-key';
import { DocMobileElementMenuService } from '../../services/doc-mobile-element-menu.service';
import { calcDocRangePositions, transformBound2OffsetBound } from '../../services/doc-popup-manager.service';

export function MobileDocCanvasViewport({ containerRef, canvasRef }: {
    containerRef: RefObject<HTMLElement | null>;
    canvasRef: RefObject<HTMLElement | null>;
}) {
    const instances = useDependency(IUniverInstanceService);
    const renders = useDependency(IRenderManagerService);
    const elements = useDependency(DocMobileElementMenuService);
    const selections = useDependency(DocSelectionManagerService);
    useMobileCanvasViewport({
        containerRef,
        canvasRef,
        panelsOnly: true,
        onReveal: () => {
            const doc = instances.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC);
            const render = doc && renders.getRenderUnitById(doc.getUnitId());
            const viewport = render?.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
            if (!render || !viewport) {
                return;
            }
            const selected = render.scene.getTransformer()?.getSelectedObjectMap().values().next().value;
            const target = elements.getEditingBounds(render.unitId);
            let bounds = target
                ? transformBound2OffsetBound(target, render.scene)
                : selected && transformBound2OffsetBound({
                    left: selected.left,
                    top: selected.top,
                    right: selected.left + selected.width,
                    bottom: selected.top + selected.height,
                }, render.scene);
            if (!bounds) {
                const range = selections.getActiveTextRange();
                const rangeBounds = range && calcDocRangePositions(range, render)?.[0];
                if (rangeBounds) {
                    const canvas = render.engine.getCanvasElement().getBoundingClientRect();
                    bounds = {
                        left: rangeBounds.left - canvas.left,
                        top: rangeBounds.top - canvas.top,
                        right: rangeBounds.right - canvas.left,
                        bottom: rangeBounds.bottom - canvas.top,
                    };
                }
            }
            const canvasBounds = canvasRef.current?.getBoundingClientRect();
            if (!bounds || !canvasBounds) {
                return;
            }
            const delta = getMobileCanvasPanDelta({
                left: bounds.left,
                top: bounds.top,
                width: bounds.right - bounds.left,
                height: bounds.bottom - bounds.top,
            }, canvasBounds);
            if (delta.x === 0 && delta.y === 0) {
                return;
            }
            const scale = render.scene.getAncestorScale();
            viewport.scrollToViewportPos({
                viewportScrollX: viewport.viewportScrollX - delta.x / scale.scaleX,
                viewportScrollY: viewport.viewportScrollY - delta.y / scale.scaleY,
            });
        },
    });
    return null;
}
