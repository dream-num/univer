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

import type { DocumentDataModel } from '@univerjs/core';
import { Disposable, ICommandService, IUniverInstanceService } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule, RenderComponentType } from '@univerjs/engine-render';
import { PageLayoutType, Vector2 } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';

import { IEditorService } from '@univerjs/ui';
import { DocSkeletonManagerService, neoGetDocObject } from '@univerjs/docs';

export class DocHeaderFooterController extends Disposable implements IRenderModule {
    private _loadedMap = new WeakSet<RenderComponentType>();

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorService private readonly _editorService: IEditorService,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._init();
    }

    private _init() {
        const { unitId } = this._context;
        const docObject = neoGetDocObject(this._context);
        if (docObject == null || docObject.document == null) {
            return;
        }

        if (!this._loadedMap.has(docObject.document)) {
            this._initialMain(unitId);
            this._loadedMap.add(docObject.document);
        }
    }

    private _initialMain(unitId: string) {
        const docObject = neoGetDocObject(this._context);
        const { document } = docObject;

        this.disposeWithMe(document.onDblclickObserver.add((evt: IPointerEvent | IMouseEvent) => {
            if (this._isEditorReadOnly(unitId)) {
                return;
            }

            const { offsetX, offsetY } = evt;

            const {
                pageLayoutType = PageLayoutType.VERTICAL,
                pageMarginLeft,
                pageMarginTop,
            } = document.getOffsetConfig();

            const coord = this._getTransformCoordForDocumentOffset(offsetX, offsetY);

            if (coord == null) {
                return;
            }

            const viewModel = this._docSkeletonManagerService.getViewModel();
            const skeleton = this._docSkeletonManagerService.getSkeleton();
            const preEditArea = viewModel.getEditArea();
            const editArea = skeleton.findEditAreaByCoord(
                coord,
                pageLayoutType,
                pageMarginLeft,
                pageMarginTop
            );

            if (preEditArea !== editArea) {
                viewModel.setEditArea(editArea);
            }
        }));
    }

    private _getTransformCoordForDocumentOffset(evtOffsetX: number, evtOffsetY: number) {
        const docObject = neoGetDocObject(this._context);
        const { document, scene } = docObject;
        const { documentTransform } = document.getOffsetConfig();
        const activeViewport = scene.getViewports()[0];

        if (activeViewport == null) {
            return;
        }

        const originCoord = activeViewport.getRelativeVector(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        return documentTransform.clone().invert().applyPoint(originCoord);
    }

    private _isEditorReadOnly(unitId: string) {
        const editor = this._editorService.getEditor(unitId);
        if (!editor) {
            return false;
        }

        return editor.isReadOnly();
    }
}
