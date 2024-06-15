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

import type { Nullable } from '@univerjs/core';
import { Disposable, ICommandService, IContextService, IUniverInstanceService, LifecycleStages, LocaleService, OnLifecycle, toDisposable } from '@univerjs/core';
import { DocSkeletonManagerService, TextSelectionManagerService } from '@univerjs/docs';
import { IDocDrawingService } from '@univerjs/docs-drawing';
import { IDrawingManagerService, IImageIoService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IMessageService } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';

// Listen doc drawing transformer change, and update drawing data.

@OnLifecycle(LifecycleStages.Rendered, DocDrawingTransformerController)
export class DocDrawingTransformerController extends Disposable {
    private _listenerOnImageMap = new Set();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @IImageIoService private readonly _imageIoService: IImageIoService,
        @IDocDrawingService private readonly _docDrawingService: IDocDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IContextService private readonly _contextService: IContextService,
        @IMessageService private readonly _messageService: IMessageService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManager: TextSelectionManagerService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._listenDrawingFocus();
    }

    private _listenDrawingFocus(): void {
        this.disposeWithMe(
            this._drawingManagerService.add$.subscribe((drawingParams) => {
                if (drawingParams.length === 0) {
                    return;
                }

                for (const drawingParam of drawingParams) {
                    const { unitId } = drawingParam;

                    if (!this._listenerOnImageMap.has(unitId)) {
                        this._listenTransformerChange(unitId);
                        this._listenerOnImageMap.add(unitId);
                    }
                }
            })
        );
    }

    // Only handle one drawing transformer change.
    private _listenTransformerChange(unitId: string): void {
        const transformer = this._getSceneAndTransformerByDrawingSearch(unitId)?.transformer;

        if (transformer == null) {
            return;
        }

        this.disposeWithMe(
            toDisposable(
                transformer.onChangeStartObservable.add((state) => {
                    // TODO
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                transformer.onChangingObservable.add((state) => {
                    const { objects } = state;
                    // TODO
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                transformer.onChangeEndObservable.add((state) => {
                    const { objects } = state;
                    // TODO
                })
            )
        );
    }

    private _getSceneAndTransformerByDrawingSearch(unitId: Nullable<string>) {
        if (unitId == null) {
            return;
        }

        const renderObject = this._renderManagerService.getRenderById(unitId);

        const scene = renderObject?.scene;

        if (scene == null) {
            return;
        }

        const transformer = scene.getTransformerByCreate();

        return { scene, transformer };
    }
}
