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
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import {
    Disposable,
    DocumentFlavor,
    ICommandService,
    Inject,
    isInternalEditorID,
    LocaleService,
    ThemeService,
} from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService, SetHeadingCollapsedCommand } from '@univerjs/docs';
import { ILayoutService } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import type { IHeadingCollapseColors } from '../views/heading-collapse-shape';
import { VIEWPORT_KEY } from '../basics/docs-view-key';
import { HeadingCollapseShape } from '../views/heading-collapse-shape';
import { DocEventManagerService } from './doc-event-manager.service';
import { TEXT_RANGE_LAYER_INDEX } from './selection/text-range';

export class DocHeadingCollapseService extends Disposable implements IRenderModule {
    private readonly _buttons = new Map<string, HeadingCollapseShape>();
    private _colors: IHeadingCollapseColors;
    private _expandLabel = '';
    private _collapseLabel = '';

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocSkeletonManagerService) private readonly _skeletonManager: DocSkeletonManagerService,
        @Inject(DocEventManagerService) private readonly _eventManager: DocEventManagerService,
        @Inject(DocSelectionManagerService) private readonly _selections: DocSelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @Inject(ThemeService) themeService: ThemeService,
        @Inject(LocaleService) localeService: LocaleService
    ) {
        super();
        this._colors = this._getColors(themeService);
        if (isInternalEditorID(_context.unitId)) {
            return;
        }
        this.disposeWithMe(themeService.currentTheme$.subscribe(() => {
            this._colors = this._getColors(themeService);
            this._update();
        }));
        this.disposeWithMe(localeService.currentLocale$.subscribe(() => {
            this._expandLabel = localeService.t<LocaleKey>('docs-ui.heading.expand');
            this._collapseLabel = localeService.t<LocaleKey>('docs-ui.heading.collapse');
            this._update();
        }));
        this.disposeWithMe(_context.scene.beforeRender$.subscribe(() => this._update()));
        this.disposeWithMe(this._skeletonManager.currentSkeleton$.subscribe(() => this._update()));
        this.disposeWithMe(this._skeletonManager.getSkeleton().dirty$.subscribe(() => this._update()));
        const resetHover = () => this._buttons.forEach((button) => button.resetHover());
        const viewport = _context.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (viewport) {
            let scrollX = viewport.viewportScrollX;
            let scrollY = viewport.viewportScrollY;
            this.disposeWithMe(viewport.onScrollAfter$.subscribeEvent((event) => {
                if (event.viewportScrollX !== scrollX || event.viewportScrollY !== scrollY) {
                    resetHover();
                    scrollX = event.viewportScrollX;
                    scrollY = event.viewportScrollY;
                }
            }));
        }
        this.disposeWithMe(_context.scene.onPointerCancel$.subscribeEvent(resetHover));
        this.disposeWithMe(_context.scene.onTransformChange$.subscribeEvent(({ value, preValue }) => {
            if ((value.scaleX != null && value.scaleX !== preValue.scaleX) ||
                (value.scaleY != null && value.scaleY !== preValue.scaleY)) {
                resetHover();
            }
        }));
        this.disposeWithMe(_context.scene.onPointerLeave$.subscribeEvent(resetHover));
        this.disposeWithMe(this._selections.textSelection$.subscribe(({ unitId }) => {
            if (unitId === _context.unitId) {
                this._normalizeSelection();
            }
        }));
    }

    private _getColors(themeService: ThemeService): IHeadingCollapseColors {
        return {
            normal: themeService.getColorFromTheme('gray.900'),
            hover: themeService.getColorFromTheme('primary.600'),
            tooltipBackground: themeService.getColorFromTheme('gray.700'),
            tooltipText: themeService.getColorFromTheme('gray.0'),
        };
    }

    private _normalizeSelection(): void {
        const target = { unitId: this._context.unitId, subUnitId: this._context.unitId };
        const info = this._selections.getSelectionInfo(target);
        if (!info || info.segmentId) {
            return;
        }
        const viewModel = this._skeletonManager.getViewModel();
        const hiddenRect = info.rectRanges.find((range) => !range.segmentId && range.startOffset != null &&
            viewModel.getCollapsedHeadingAtOffset(range.startOffset));
        if (hiddenRect?.startOffset != null) {
            const offset = viewModel.getCollapsedHeadingAtOffset(hiddenRect.startOffset)!.paragraphIndex;
            const textRanges = [{ startOffset: offset, endOffset: offset, collapsed: true, isActive: true }];
            this._selections.replaceSelectionInfoWithoutRefresh({ ...info, textRanges, rectRanges: [] }, target);
            this._selections.replaceDocRanges(textRanges, target, false, { forceFocus: false });
            return;
        }
        let changed = false;
        const textRanges = info.textRanges.map((range) => {
            if (range.segmentId) {
                return range;
            }
            const startOffset = viewModel.getCollapsedHeadingAtOffset(range.startOffset)?.paragraphIndex ?? range.startOffset;
            const endOffset = viewModel.getCollapsedHeadingAtOffset(range.endOffset)?.paragraphIndex ?? range.endOffset;
            if (startOffset === range.startOffset && endOffset === range.endOffset) {
                return range;
            }
            changed = true;
            return { ...range, startOffset, endOffset, collapsed: startOffset === endOffset, startNodePosition: undefined, endNodePosition: undefined };
        });
        if (changed) {
            this._selections.replaceSelectionInfoWithoutRefresh({ ...info, textRanges }, target);
            this._selections.replaceDocRanges([...textRanges, ...info.rectRanges], target, false, { forceFocus: false });
        }
    }

    private _update(): void {
        this._normalizeSelection();
        const active = new Set<string>();
        const viewModel = this._skeletonManager.getViewModel();
        if (this._context.unit.getSnapshot().documentStyle.documentFlavor === DocumentFlavor.MODERN) {
            for (const heading of viewModel.getHeadingSections()) {
                if (heading.startOffset >= heading.endOffset || viewModel.getCollapsedHeadingAtOffset(heading.paragraphIndex)) {
                    continue;
                }
                const bound = this._eventManager.findParagraphBoundByIndex(heading.paragraphIndex);
                if (!bound || bound.segmentId) {
                    continue;
                }
                active.add(heading.paragraphId);
                let button = this._buttons.get(heading.paragraphId);
                if (!button) {
                    button = new HeadingCollapseShape(`__DocHeadingCollapse__${heading.paragraphId}`, this._colors, () => {
                        const paragraph = this._context.unit.getBody()?.paragraphs?.find((item) => item.paragraphId === heading.paragraphId);
                        if (paragraph && this._commandService.syncExecuteCommand(SetHeadingCollapsedCommand.id, {
                            unitId: this._context.unitId,
                            paragraphId: heading.paragraphId,
                            collapsed: paragraph.headingCollapsed !== true,
                        })) {
                            this._layoutService.focus(this._context.unitId);
                        }
                    });
                    this._buttons.set(heading.paragraphId, button);
                    this._context.scene.addObject(button, TEXT_RANGE_LAYER_INDEX);
                }
                const left = bound.firstLine.left - button.width;
                const top = (bound.firstLine.top + bound.firstLine.bottom - button.height) / 2;
                if (button.left !== left || button.top !== top) {
                    button.resetHover();
                    button.transformByState({ left, top });
                }
                button.update(heading.collapsed, heading.collapsed ? this._expandLabel : this._collapseLabel, this._colors);
            }
        }
        for (const [id, button] of this._buttons) {
            if (!active.has(id)) {
                button.dispose();
                this._buttons.delete(id);
            }
        }
    }

    override dispose(): void {
        super.dispose();
        this._buttons.forEach((button) => button.dispose());
        this._buttons.clear();
    }
}
