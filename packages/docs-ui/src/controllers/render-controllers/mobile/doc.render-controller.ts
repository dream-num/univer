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
import type { DocumentSkeleton, IRenderContext } from '@univerjs/engine-render';
import type { IDocLayoutScheduleOptions } from '../doc.render-controller';
import {
    DocumentFlavor,
    fromEventSubject,
    ICommandService,
    ILogService,
    Inject,
    IUniverInstanceService,
    ThemeService,
} from '@univerjs/core';
import { DocLayoutExecutorService, DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { animationFrameScheduler, takeUntil, throttleTime } from 'rxjs';
import { DocLayoutInteractionService } from '../../../services/doc-layout-interaction.service';
import { DocPageLayoutService } from '../../../services/doc-page-layout.service';
import { DocViewScaleService } from '../../../services/doc-view-scale';
import { IEditorService } from '../../../services/editor/editor-manager.service';
import { DocSelectionRenderService } from '../../../services/selection/doc-selection-render.service';
import { DocRenderController } from '../doc.render-controller';

const MOBILE_DOC_OUTER_MARGIN = 12;

export class MobileDocRenderController extends DocRenderController {
    private _mobileModernPageWidth: number | undefined;

    constructor(
        context: IRenderContext<DocumentDataModel>,
        @ICommandService commandService: ICommandService,
        @Inject(DocSelectionRenderService) docSelectionRenderService: DocSelectionRenderService,
        @Inject(DocSkeletonManagerService) docSkeletonManagerService: DocSkeletonManagerService,
        @IEditorService editorService: IEditorService,
        @IRenderManagerService renderManagerService: IRenderManagerService,
        @IUniverInstanceService univerInstanceService: IUniverInstanceService,
        @Inject(DocPageLayoutService) docPageLayoutService: DocPageLayoutService,
        @Inject(DocSelectionManagerService) textSelectionManagerService: DocSelectionManagerService,
        @Inject(DocViewScaleService) docViewScaleService: DocViewScaleService,
        @Inject(ThemeService) themeService: ThemeService,
        @Inject(DocLayoutExecutorService) docLayoutExecutorService: DocLayoutExecutorService,
        @Inject(DocLayoutInteractionService) docLayoutInteractionService: DocLayoutInteractionService,
        @ILogService logService: ILogService
    ) {
        super(
            context,
            commandService,
            docSelectionRenderService,
            docSkeletonManagerService,
            editorService,
            renderManagerService,
            univerInstanceService,
            docPageLayoutService,
            textSelectionManagerService,
            docViewScaleService,
            themeService,
            docLayoutExecutorService,
            docLayoutInteractionService,
            logService
        );
        this._mobileModernPageWidth = this._getMobileModernLayoutOptions().modernPageWidth;
        this._initResponsiveLayout();
    }

    protected override _scheduleLayout(
        unitId: string,
        skeleton: DocumentSkeleton,
        options: IDocLayoutScheduleOptions,
        refreshMainSelection = true,
        preserveInactiveViewportAnchor = false
    ): void {
        const layoutOptions = {
            ...options,
            ...this._getMobileModernLayoutOptions(),
        };
        this._mobileModernPageWidth = layoutOptions.modernPageWidth;
        super._scheduleLayout(unitId, skeleton, layoutOptions, refreshMainSelection, preserveInactiveViewportAnchor);
    }

    protected override _shouldEnableHorizontalScrollBar(): boolean {
        return this._context.unit.getSnapshot().documentStyle.documentFlavor !== DocumentFlavor.MODERN &&
            super._shouldEnableHorizontalScrollBar();
    }

    private _getMobileModernLayoutOptions(): Pick<IDocLayoutScheduleOptions, 'modernPageWidth' | 'modernHorizontalMargin'> {
        if (this._context.unit.getSnapshot().documentStyle.documentFlavor !== DocumentFlavor.MODERN) {
            return {};
        }

        const parentWidth = this._context.scene.getParent()?.width;
        const availableWidth = parentWidth != null && parentWidth > 1 ? parentWidth : this._context.engine.width;
        if (!Number.isFinite(availableWidth) || availableWidth <= MOBILE_DOC_OUTER_MARGIN * 2) {
            return {};
        }

        return {
            modernPageWidth: availableWidth - MOBILE_DOC_OUTER_MARGIN * 2,
            modernHorizontalMargin: super._getHorizontalPageMargin(),
        };
    }

    private _initResponsiveLayout(): void {
        if (this._context.unit.getSnapshot().documentStyle.documentFlavor !== DocumentFlavor.MODERN) {
            return;
        }

        this.disposeWithMe(fromEventSubject(this._context.engine.onTransformChange$).pipe(
            throttleTime(0, animationFrameScheduler),
            takeUntil(this.dispose$)
        ).subscribe(() => {
            const modernPageWidth = this._getMobileModernLayoutOptions().modernPageWidth;
            if (modernPageWidth == null || Math.abs(modernPageWidth - (this._mobileModernPageWidth ?? 0)) < 1) {
                return;
            }
            const skeleton = this._docSkeletonManagerService.getSkeleton();
            if (skeleton) {
                this._scheduleLayout(this._context.unitId, skeleton, { reason: 'initial' });
            }
        }));
    }

    protected override _getHorizontalPageMargin(): number {
        return MOBILE_DOC_OUTER_MARGIN;
    }
}
