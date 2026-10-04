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

import type { DocumentDataModel, IDrawingParam } from '@univerjs/core';
import type { Documents, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, Inject, PositionedObjectLayoutType, ThemeService } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { findDocDrawing } from '@univerjs/docs-drawing';
import {
    DocSelectionRenderService,
    getAnchorBounding,
    NodePositionConvertToCursor,
    TEXT_RANGE_LAYER_INDEX,
} from '@univerjs/docs-ui';
import { IDrawingManagerService } from '@univerjs/drawing';
import { Path } from '@univerjs/engine-render';
import { findDrawingTextAnchor } from '../../utils/drawing-text-anchor';

// A slender, rounded canvas outline. Inverse scene scale keeps the icon and stroke screen-sized.
const ANCHOR_PATH = 'M 8 4 C 9.104 4 10 3.104 10 2 C 10 0.896 9.104 0 8 0 C 6.896 0 6 0.896 6 2 C 6 3.104 6.896 4 8 4 Z M 8 4 L 8 16 M 5 7.2 L 11 7.2 M 1 9.5 L 1 10.5 C 1 13.5 4.25 16 8 16 C 11.75 16 15 13.5 15 10.5 L 15 9.5 M 1 9.5 L 3.25 11 M 15 9.5 L 12.75 11';

export class DocDrawingAnchorRenderController extends Disposable implements IRenderModule {
    private _stroke = '';
    private _focused: IDrawingParam[] = [];
    private readonly _markers = new Map<string, Path>();

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @IDrawingManagerService drawingManager: IDrawingManagerService,
        @Inject(DocSkeletonManagerService) private readonly _skeletonManager: DocSkeletonManagerService,
        @Inject(DocSelectionRenderService) private readonly _selectionRender: DocSelectionRenderService,
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super();
        this.disposeWithMe(drawingManager.focus$.subscribe((drawings) => {
            this._focused = (drawings ?? []).filter((drawing) => drawing.unitId === this._context.unitId);
            this._updateMarkers();
        }));
        this.disposeWithMe(this._context.scene.beforeRender$.subscribe(() => this._updateMarkers()));
        this.disposeWithMe(this._themeService.currentTheme$.subscribe(() => {
            this._stroke = this._themeService.getColorFromTheme('gray.500');
            this._updateMarkers();
        }));
        this.disposeWithMe({ dispose: () => {
            this._markers.forEach((marker) => marker.dispose());
            this._markers.clear();
        } });
    }

    private _updateMarkers(): void {
        const { scene, unit, mainComponent } = this._context;
        const snapshot = unit.getSnapshot();
        const skeleton = this._skeletonManager.getSkeleton();
        const active = new Set<string>();
        const document = mainComponent as Documents;
        if (skeleton && document) {
            const config = document.getOffsetConfig();
            const converter = new NodePositionConvertToCursor(config, skeleton);
            const scale = scene.getAncestorScale();
            for (const { drawingId } of this._focused) {
                const drawing = findDocDrawing(snapshot, drawingId)?.drawing;
                const anchor = findDrawingTextAnchor(snapshot, drawingId);
                if (!drawing || drawing.layoutType === PositionedObjectLayoutType.INLINE || !anchor) {
                    continue;
                }
                if (anchor.segmentId !== this._selectionRender.getSegment()) {
                    continue;
                }
                const position = skeleton.findNodePositionByCharIndex(anchor.offset, true, anchor.segmentId, this._selectionRender.getSegmentPage());
                const glyph = skeleton.findGlyphByPosition(position);
                const line = glyph?.parent?.parent;
                const startLine = line?.parent?.lines.find((item) => item.paragraphIndex === line.paragraphIndex && item.paragraphStart) ?? line;
                const startGlyph = startLine?.divides[0]?.glyphGroup[0];
                const paragraphPosition = startGlyph && skeleton.findPositionByGlyph(startGlyph, this._selectionRender.getSegmentPage());
                if (!paragraphPosition) {
                    continue;
                }
                const caret = { ...paragraphPosition, isBack: true };
                const { contentBoxPointGroup } = converter.getRangePointData(caret, caret);
                if (!contentBoxPointGroup.length) {
                    continue;
                }
                const bounds = getAnchorBounding(contentBoxPointGroup);
                const left = config.docsLeft + bounds.left - 22 / scale.scaleX;
                const top = config.docsTop + bounds.top;
                let marker = this._markers.get(drawingId);
                const stroke = this._stroke;
                if (!marker) {
                    marker = new Path(`__DocDrawingAnchor__${drawingId}`, {
                        data: ANCHOR_PATH,
                        width: 14,
                        height: 16,
                        stroke,
                        strokeWidth: 1.25,
                        strokeLineCap: 'round',
                        strokeLineJoin: 'round',
                        evented: false,
                        debounceParentDirty: false,
                    });
                    this._markers.set(drawingId, marker);
                    scene.addObject(marker, TEXT_RANGE_LAYER_INDEX);
                }
                if (marker.left !== left || marker.top !== top || marker.scaleX !== 1 / scale.scaleX || marker.scaleY !== 1 / scale.scaleY) {
                    marker.transformByState({ left, top, scaleX: 1 / scale.scaleX, scaleY: 1 / scale.scaleY });
                }
                if (marker.stroke !== stroke) {
                    marker.setProps({ stroke });
                }
                active.add(drawingId);
            }
        }
        for (const [id, marker] of this._markers) {
            if (!active.has(id)) {
                marker.dispose();
                this._markers.delete(id);
            }
        }
    }
}
