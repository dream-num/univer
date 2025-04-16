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

import type { DocumentDataModel } from '@univerjs/core';
import type { Documents, IRenderContext, IRenderModule, Viewport } from '@univerjs/engine-render';
import { Disposable, ICommandService, Inject } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { CURSOR_TYPE, Vector2 } from '@univerjs/engine-render';
import { ToggleCheckListCommand } from '../../commands/commands/list.command';
import { DocEventManagerService } from '../../services/doc-event-manager.service';

export class DocChecklistRenderController extends Disposable implements IRenderModule {
    constructor(
        private _context: IRenderContext<DocumentDataModel>,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocEventManagerService) private readonly _docEventManagerService: DocEventManagerService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService
    ) {
        super();

        this._initPointerDownObserver();
        this._initHoverCursor();
    }

    private _initPointerDownObserver() {
        this._docEventManagerService.clickBullets$.subscribe((paragraph) => {
            const textRanges = this._textSelectionManagerService.getTextRanges();
            this._commandService.executeCommand(ToggleCheckListCommand.id, {
                index: paragraph.paragraph.startIndex,
                segmentId: paragraph.segmentId,
                textRanges,
            });
        });
    }

    private _initHoverCursor() {
        this.disposeWithMe(
            this._docEventManagerService.hoverBullet$.subscribe((paragraph) => {
                if (paragraph) {
                    this._context.mainComponent!.setCursor(CURSOR_TYPE.POINTER);
                } else {
                    this._context.mainComponent!.setCursor(CURSOR_TYPE.TEXT);
                }
            })
        );
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
