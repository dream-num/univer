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

import type { DocumentDataModel, Nullable } from '@univerjs/core';
import type { IInsertTextCommandParams } from '@univerjs/docs';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { Subscription } from 'rxjs';
import { Disposable, ICommandService, Inject, Optional, SHEET_EDITOR_UNITS } from '@univerjs/core';
import { DocSkeletonManagerService, InsertTextCommand } from '@univerjs/docs';
import { getCustomDecorationAtPosition, getCustomRangeAtPosition, getTextRunAtPosition } from '../../basics/paragraph';
import { AfterSpaceCommand } from '../../commands/commands/auto-format.command';
import { DocMenuStyleService } from '../../services/doc-menu-style.service';
import { IDocEmbedInteractionBoundaryService, IDocEmbedRuntimeFocusCoordinator } from '../../services/doc-embed-integration.service';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';

export class DocInputController extends Disposable implements IRenderModule {
    private _onInputSubscription: Nullable<Subscription>;

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocSelectionRenderService) private readonly _docSelectionRenderService: DocSelectionRenderService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocMenuStyleService) private readonly _docMenuStyleService: DocMenuStyleService,
        @Optional(IDocEmbedInteractionBoundaryService) _embedInteractionBoundaryService?: IDocEmbedInteractionBoundaryService,
        @Optional(IDocEmbedRuntimeFocusCoordinator) private readonly _embedRuntimeFocusCoordinator?: IDocEmbedRuntimeFocusCoordinator
    ) {
        super();

        this._init();
    }

    override dispose(): void {
        super.dispose();

        this._onInputSubscription?.unsubscribe();
    }

    private _init() {
        this._initialNormalInput();
    }

    private _initialNormalInput() {
        this._onInputSubscription = this._docSelectionRenderService.onInput$.subscribe(async (config) => {
            if (config == null) {
                return;
            }

            const { unitId } = this._context;

            const { event, content = '', activeRange } = config;

            const e = event as InputEvent;
            if (e.defaultPrevented) {
                return;
            }

            if (!SHEET_EDITOR_UNITS.includes(unitId) && this._isEmbedChildInputActive(unitId, e)) {
                return;
            }

            const skeleton = this._docSkeletonManagerService.getSkeleton();

            if (e.data == null || skeleton == null || activeRange == null) {
                return;
            }

            const { segmentId } = activeRange;

            const docDataModel = this._context.unit;
            const originBody = docDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();
            if (!originBody) {
                return;
            }

            // Insert content's style should follow the text style of the current position.
            const defaultTextStyle = this._docMenuStyleService.getDefaultStyle();
            const cacheStyle = this._docMenuStyleService.getStyleCache();
            const curCustomRange = getCustomRangeAtPosition(originBody?.customRanges ?? [], activeRange.endOffset, SHEET_EDITOR_UNITS.includes(unitId));
            const curTextRun = getTextRunAtPosition(originBody, activeRange.endOffset, defaultTextStyle, cacheStyle, SHEET_EDITOR_UNITS.includes(unitId));
            const curCustomDecorations = getCustomDecorationAtPosition(originBody?.customDecorations ?? [], activeRange.endOffset);

            await this._commandService.executeCommand<IInsertTextCommandParams>(InsertTextCommand.id, {
                unitId,
                body: {
                    dataStream: content,
                    textRuns: curTextRun
                        ? [
                            {
                                ...curTextRun,
                                st: 0,
                                ed: content.length,
                            },
                        ]
                        : [],
                    customRanges: curCustomRange
                        ? [{
                            ...curCustomRange,
                            startIndex: 0,
                            endIndex: content.length - 1,
                        }]
                        : [],
                    customDecorations: curCustomDecorations.map((customDecoration) => ({
                        ...customDecoration,
                        startIndex: 0,
                        endIndex: content.length - 1,
                    })),
                },
                range: activeRange,
                segmentId,
            });

            // Space
            if (content === ' ') {
                await this._commandService.executeCommand(AfterSpaceCommand.id);
            }
        });
    }

    private _isEmbedChildInputActive(unitId: string, event: Event): boolean {
        if (this._embedRuntimeFocusCoordinator?.isChildUnitRuntimeEvent(unitId, event.target, event)) {
            return false;
        }

        if (this._embedRuntimeFocusCoordinator?.isChildUnitInActiveSession(unitId)) {
            return false;
        }

        if (this._embedRuntimeFocusCoordinator?.shouldSuppressHostInteraction(unitId, event.target, event)) {
            return true;
        }

        return false;
    }
}
