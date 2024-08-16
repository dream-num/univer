/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Documents, IRenderContext, IRenderModule, Viewport } from '@univerjs/engine-render';
import { getParagraphByGlyph, GlyphType, PageLayoutType, Vector2 } from '@univerjs/engine-render';
import type { DocumentDataModel } from '@univerjs/core';
import { Disposable, ICommandService, Inject, PresetListType } from '@univerjs/core';
import { DocSkeletonManagerService, ToggleCheckListCommand, VIEWPORT_KEY } from '@univerjs/docs';
// import { DocEventManagerService } from '../../services/doc-event-manager.service';

export class DocChecklistRenderController extends Disposable implements IRenderModule {
    constructor(
        private _context: IRenderContext<DocumentDataModel>,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initPointerDownObserver();
        this._initHoverCursor();
    }

    private _initPointerDownObserver() {
        this.disposeWithMe(
            this._context.mainComponent!.onPointerDown$.subscribeEvent((evt) => {
                const { offsetX, offsetY } = evt;

                const documentComponent = this._context.mainComponent as Documents;
                const coord = this._getTransformCoordForDocumentOffset(
                    documentComponent,
                    this._context.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN)!,
                    offsetX,
                    offsetY
                );
                if (!coord) {
                    return;
                }
                const { pageLayoutType = PageLayoutType.VERTICAL, pageMarginLeft, pageMarginTop } = documentComponent.getOffsetConfig();
                const skeleton = this._docSkeletonManagerService.getSkeleton();
                const node = skeleton.findNodeByCoord(
                    coord,
                    pageLayoutType,
                    pageMarginLeft,
                    pageMarginTop
                );
                if (!node) {
                    return;
                }
                const paragraph = getParagraphByGlyph(node.node, this._context.unit.getBody());
                if (paragraph && paragraph.bullet && node.node.glyphType === GlyphType.LIST) {
                    if (
                        paragraph.bullet.listType === PresetListType.CHECK_LIST ||
                        paragraph.bullet.listType === PresetListType.CHECK_LIST_CHECKED
                    ) {
                        this._commandService.executeCommand(ToggleCheckListCommand.id, {
                            index: paragraph.startIndex,
                        });
                    }
                }
            })
        );
    }

    private _initHoverCursor() {
        // this.disposeWithMe(
        //     this._docHoverManagerService.bullet$.subscribe((paragraph) => {
        //         if (paragraph) {
        //             this._context.mainComponent!.setCursor(CURSOR_TYPE.POINTER);
        //         } else {
        //             this._context.mainComponent!.setCursor(CURSOR_TYPE.TEXT);
        //         }
        //     })
        // );
    }

    private _getTransformCoordForDocumentOffset(document: Documents, viewport: Viewport, evtOffsetX: number, evtOffsetY: number) {
        const { documentTransform } = document.getOffsetConfig();
        const originCoord = viewport.transformVector2SceneCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        if (!originCoord) {
            return;
        }

        return documentTransform.clone().invert().applyPoint(originCoord);
    }
}
