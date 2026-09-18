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

import type { Vector2 } from '@univerjs/engine-render';
import { DocBackground, Documents, documentSkeletonTableIterator } from '@univerjs/engine-render';
import { NodePositionConvertToCursor } from '../services/selection/convert-text-range';

/** Full document pages let whitespace select drawings behind the text. */
export class DocPageRenderComponent extends Documents {
    override isHit(coord: Vector2): boolean {
        if (!super.isHit(coord)) {
            return false;
        }
        const skeleton = this.getSkeleton();
        const layer = this.layer;
        const hasDrawingBehind = layer != null && this.getScene()?.getLayers().some((candidate) =>
            candidate.zIndex < layer.zIndex && candidate.getObjects().some((object) =>
                !(object instanceof Documents) && !(object instanceof DocBackground) && !object.isInGroup &&
                object.visible && object.evented && object.isHit(coord)));
        if (!hasDrawingBehind || !skeleton) {
            return true;
        }

        const local = this.getInverseCoord(coord);
        const hit = skeleton.findNodeByCoord(local, this.pageLayoutType, this.pageMarginLeft, this.pageMarginTop);
        if (hit?.node.content?.trim()) {
            const position = skeleton.findPositionByGlyph(hit.node, hit.segmentPage);
            if (position) {
                // Reuse the editor's glyph selection geometry, excluding line padding.
                const converter = new NodePositionConvertToCursor(this.getOffsetConfig(), skeleton);
                const { contentBoxPointGroup } = converter.getRangePointData(
                    { ...position, isBack: true },
                    { ...position, isBack: false }
                );
                if (contentBoxPointGroup.some((points) => local.x >= points[0].x && local.x <= points[2].x &&
                    local.y >= points[0].y && local.y <= points[2].y)) {
                    return true;
                }
            }
        }

        const data = skeleton.getSkeletonData();
        if (!data) {
            return false;
        }
        const { docsLeft, docsTop } = this.getOffsetConfig();
        // Table cells and their editor controls keep priority over rear drawings.
        const controlPadding = 24;
        return documentSkeletonTableIterator(data.pages, {
            docsLeft,
            docsTop,
            includeCells: false,
            pageMarginTop: this.pageMarginTop,
            skeHeaders: data.skeHeaders,
            skeFooters: data.skeFooters,
            unitId: skeleton.getViewModel().getDataModel().getUnitId(),
        }).some(({ tableRect }) => local.x + docsLeft >= tableRect.left - controlPadding &&
            local.x + docsLeft <= tableRect.right + controlPadding &&
            local.y + docsTop >= tableRect.top - controlPadding &&
            local.y + docsTop <= tableRect.bottom + controlPadding);
    }
}
