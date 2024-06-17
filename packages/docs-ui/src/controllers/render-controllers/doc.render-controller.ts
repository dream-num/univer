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

import type { DocumentDataModel, EventState, ICommandInfo, Nullable } from '@univerjs/core';
import { ICommandService, IConfigService, RxDisposable } from '@univerjs/core';
import type { IDocSkeletonManagerParam, IRichTextEditingMutationParams } from '@univerjs/docs';
import { DOCS_COMPONENT_BACKGROUND_LAYER_INDEX, DOCS_COMPONENT_DEFAULT_Z_INDEX, DOCS_COMPONENT_HEADER_LAYER_INDEX, DOCS_COMPONENT_MAIN_LAYER_INDEX, DOCS_VIEW_KEY, DocSkeletonManagerService, RichTextEditingMutation, VIEWPORT_KEY } from '@univerjs/docs';
import type { DocumentSkeleton, IRenderContext, IRenderModule, IWheelEvent } from '@univerjs/engine-render';
import { DocBackground, Documents, EVENT_TYPE, Layer, PageLayoutType, ScrollBar, Viewport } from '@univerjs/engine-render';
import { IEditorService } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';
import { takeUntil } from 'rxjs';

export class DocRenderController extends RxDisposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IConfigService private readonly _configService: IConfigService,
        @IEditorService private readonly _editorService: IEditorService
    ) {
        super();

        this._addNewRender();
        this._initRenderRefresh();
        this._initCommandListener();
    }

    private _addNewRender() {
        const { scene, engine, unit } = this._context;

        const viewMain = new Viewport(VIEWPORT_KEY.VIEW_MAIN, scene, {
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            isRelativeX: true,
            isRelativeY: true,
            isWheelPreventDefaultX: true,
        });

        scene.attachControl();

        scene.on(EVENT_TYPE.wheel, (evt: unknown, state: EventState) => {
            const e = evt as IWheelEvent;

            if (e.ctrlKey) {
                const deltaFactor = Math.abs(e.deltaX);
                let scrollNum = deltaFactor < 40 ? 0.2 : deltaFactor < 80 ? 0.4 : 0.2;
                scrollNum *= e.deltaY > 0 ? -1 : 1;
                if (scene.scaleX < 1) {
                    scrollNum /= 2;
                }

                if (scene.scaleX + scrollNum > 4) {
                    scene.scale(4, 4);
                } else if (scene.scaleX + scrollNum < 0.1) {
                    scene.scale(0.1, 0.1);
                } else {
                    // const value = e.deltaY > 0 ? 0.1 : -0.1;
                    // scene.scaleBy(scrollNum, scrollNum);
                    e.preventDefault();
                }
            } else {
                viewMain.onMouseWheel(e, state);
            }
        });

        const hasScroll = this._configService.getConfig('hasScroll') as Nullable<boolean>;

        if (hasScroll !== false) {
            new ScrollBar(viewMain);
        }

        scene.addLayer(
            new Layer(scene, [], DOCS_COMPONENT_MAIN_LAYER_INDEX),
            new Layer(scene, [], DOCS_COMPONENT_HEADER_LAYER_INDEX)
        );

        this._addComponent();

        const should = unit.getShouldRenderLoopImmediately();
        if (should) {
            engine.runRenderLoop(() => {
                scene.render();
            });
        }
    }

    private _addComponent() {
        const { scene, unit: documentModel, components } = this._context;
        const config = {
            pageMarginLeft: documentModel.documentStyle.marginLeft || 0,
            pageMarginTop: documentModel.documentStyle.marginTop || 0,
        };

        const documents = new Documents(DOCS_VIEW_KEY.MAIN, undefined, config);
        documents.zIndex = DOCS_COMPONENT_DEFAULT_Z_INDEX;
        const docBackground = new DocBackground(DOCS_VIEW_KEY.BACKGROUND, undefined, config);
        docBackground.zIndex = DOCS_COMPONENT_DEFAULT_Z_INDEX;

        this._context.mainComponent = documents;
        components.set(DOCS_VIEW_KEY.MAIN, documents);
        components.set(DOCS_VIEW_KEY.BACKGROUND, docBackground);

        scene.addObjects([documents], DOCS_COMPONENT_MAIN_LAYER_INDEX);
        scene.addObjects([docBackground], DOCS_COMPONENT_BACKGROUND_LAYER_INDEX);

        if (this._editorService.getEditor(documentModel.getUnitId()) == null) {
            scene.enableLayerCache(DOCS_COMPONENT_MAIN_LAYER_INDEX);
        }
    }

    private _initRenderRefresh() {
        this._docSkeletonManagerService.currentSkeletonBefore$.pipe(takeUntil(this.dispose$)).subscribe((param) => {
            this._create(param);
        });
    }

    private _create(param: Nullable<IDocSkeletonManagerParam>) {
        if (!param) {
            return;
        }

        const { skeleton: documentSkeleton } = param;
        const { mainComponent, components } = this._context;

        const docsComponent = mainComponent as Documents;
        const docBackground = components.get(DOCS_VIEW_KEY.BACKGROUND) as DocBackground;

        docsComponent.changeSkeleton(documentSkeleton);
        docBackground.changeSkeleton(documentSkeleton);

        this._recalculateSizeBySkeleton(documentSkeleton);
    }

    private _initCommandListener() {
        const updateCommandList = [RichTextEditingMutation.id];

        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            // TODO@Jocs: performance, only update the skeleton when the command is related to the current unit.
            if (updateCommandList.includes(command.id)) {
                const params = command.params as IRichTextEditingMutationParams;
                const { unitId } = params;

                const docsSkeletonObject = this._docSkeletonManagerService.getSkeletonByUnitId(unitId);
                if (docsSkeletonObject == null) {
                    return;
                }

                const { skeleton } = docsSkeletonObject;

                // TODO: `disabled` is only used for read only demo, and will be removed in the future.
                const disabled = !!skeleton.getViewModel().getDataModel().getSnapshot().disabled;
                if (disabled) {
                    return;
                }

                skeleton.calculate();

                if (this._editorService.isEditor(unitId)) {
                    this._context.mainComponent?.makeDirty();

                    return;
                }

                this._recalculateSizeBySkeleton(skeleton);
            }
        }));
    }

    private _recalculateSizeBySkeleton(skeleton: DocumentSkeleton) {
        const { mainComponent, scene, unitId, components } = this._context;

        const docsComponent = mainComponent as Documents;

        const docBackground = components.get(DOCS_VIEW_KEY.BACKGROUND) as DocBackground;

        const pages = skeleton.getSkeletonData()?.pages;
        if (pages == null) {
            return;
        }

        let width = 0;
        let height = 0;

        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];
            const { pageWidth, pageHeight } = page;

            if (docsComponent.pageLayoutType === PageLayoutType.VERTICAL) {
                height += pageHeight;

                height += docsComponent.pageMarginTop;

                if (i === len - 1) {
                    height += docsComponent.pageMarginTop;
                }

                width = Math.max(width, pageWidth);
            } else if (docsComponent.pageLayoutType === PageLayoutType.HORIZONTAL) {
                width += pageWidth;

                if (i !== len - 1) {
                    width += docsComponent.pageMarginLeft;
                }
                height = Math.max(height, pageHeight);
            }
        }

        docsComponent.resize(width, height);
        docBackground.resize(width, height);

        if (!this._editorService.isEditor(unitId)) {
            scene.resize(width, height);
        }
    }
}
