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

import type { IDisposable, Nullable, SlideDataModel, UnitModel } from '@univerjs/core';
import { DisposableCollection, ICommandService, IContextService, Inject, IUniverInstanceService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import {
    TextSelectionManagerService,
} from '@univerjs/docs';
import type { BaseObject, IChangeObserverConfig, IRenderContext, IRenderModule, RichText } from '@univerjs/engine-render';
import { ITextSelectionRenderManager, ObjectType } from '@univerjs/engine-render';
import { CanvasView } from '@univerjs/slides';
import { Subject } from 'rxjs';
import type { ISetEditorInfo } from '../services/slide-editor-bridge.service';
import { ISlideEditorBridgeService } from '../services/slide-editor-bridge.service';
import type { ISlideRichTextProps } from '../type';

// interface ICanvasOffset {
//     left: number;
//     top: number;
// }

enum CursorChange {
    InitialState,
    StartEditor,
    CursorChange,
}

export class SlideEditorBridgeRenderController extends RxDisposable implements IRenderModule {
    /**
     * It is used to distinguish whether the user has actively moved the cursor in the editor, mainly through mouse clicks.
     */
    private _cursorChange: CursorChange = CursorChange.InitialState;

    /** If the corresponding unit is active and prepared for editing. */
    private _isUnitEditing = false;

    setSlideTextEditor$: Subject<ISlideRichTextProps> = new Subject();

    private _curRichText = null as RichText | null;
    constructor(
        private readonly _renderContext: IRenderContext<UnitModel>,
        @IContextService private readonly _contextService: IContextService,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(ISlideEditorBridgeService) private readonly _editorBridgeService: ISlideEditorBridgeService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(CanvasView) private readonly _canvasView: CanvasView
    ) {
        super();
        this._init();
    }

    private _init(): IDisposable {
        const d = new DisposableCollection();
        this._initSubjectListener(d);
        this._initEventListener(d);
        return d;
    }

    private _initSubjectListener(d: DisposableCollection) {
        // d.add(this.setSlideTextEditor$.subscribe((param: ISlideTextEditorParam) => {
        //     this._updateEditor(param);
        // }));
    }

    private _updateEditor(targetObject: RichText) {
        const { scene, engine } = this._renderContext;
        const unitId = this._renderContext.unitId;

        const setEditorRect: ISetEditorInfo = {
            scene,
            engine,
            unitId,
            pageId: '',
            richTextObj: targetObject,
        };

        // editorBridgeRenderController@startEditing ---> editorBridgeRenderController@_updateEditor
        this._editorBridgeService.setEditorRect(setEditorRect);
    }

    private _initEventListener(d: DisposableCollection) {
        const model = this._instanceSrv.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE);
        const pagesMap = model?.getPages() ?? {};
        const pages = Object.values(pagesMap);
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const { scene } = this._canvasView.getRenderUnitByPageId(page.id);
            if (!scene) break;

            const transformer = scene.getTransformer();
            if (!transformer) break;

            d.add(transformer.clearControl$.subscribe(() => {
                this.setEditorVisible(false);
            }));
            d.add(transformer.createControl$.subscribe(() => {
                this.setEditorVisible(false);
            }));

            d.add(transformer.changeStart$.subscribe((param: IChangeObserverConfig) => {
                const target = param.target;
                if (!target) return;
                if (target.objectType !== ObjectType.RICH_TEXT) {
                    this.pickOtherObjects();
                } else if (target === this._curRichText) {
                    // do nothing
                }
            }));

            d.add(scene.onDblclick$.subscribeEvent(() => {
                transformer.clearControls();
                const selectedObjects = transformer.getSelectedObjectMap();
                const object = selectedObjects.values().next().value as Nullable<BaseObject>;
                if (!object) return;

                if (object.objectType !== ObjectType.RICH_TEXT) {
                    this.pickOtherObjects();
                } else {
                    this.startEditing(object as RichText);
                }
            }));
        }
    }

    pickOtherObjects() {
        this.setEditorVisible(false);
        this.endEditing();
    }

    /**
     * invoked when picking other object.
     *
     * save editing state to curr richText.
     */
    endEditing() {
        if (!this._curRichText) return;
        const curRichText = this._curRichText;

        const slideData = this._instanceSrv.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE);
        if (!slideData) return false;
        curRichText.refreshDocumentByDocData();
        this._curRichText = null;
    }

    /**
     * TODO calling twice ？？？？
     * editingParam derives from RichText object.
     *
     * TODO @lumixraku need scale param
     * @param target
     */
    startEditing(target: RichText) {
        // this.setSlideTextEditor$.next({ content, rect });
        this._curRichText = target as RichText;
        this._updateEditor(target);
        this.setEditorVisible(true);
    }

    setEditorVisible(visible: boolean) {
        if (visible) {
            this._curRichText?.hide();
        } else {
            this._curRichText?.show();
        }
        const { unitId } = this._renderContext;
        this._editorBridgeService.changeVisible({ visible, eventType: 3, unitId });
    }
}
