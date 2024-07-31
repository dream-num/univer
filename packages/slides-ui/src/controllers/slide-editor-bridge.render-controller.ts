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

import type { IDisposable, IPageElement, IRectXYWH, SlideDataModel, UnitModel } from '@univerjs/core';
import { DisposableCollection, ICommandService, IContextService, Inject, IUniverInstanceService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import {
    TextSelectionManagerService,
} from '@univerjs/docs';
import type { IChangeObserverConfig, IRenderContext, IRenderModule, RichText } from '@univerjs/engine-render';
import { ITextSelectionRenderManager, ObjectType } from '@univerjs/engine-render';
import { CanvasView } from '@univerjs/slides';
import { Subject } from 'rxjs';
import type { ISetEditorInfo } from '../services/slide-editor-bridge.service';
import { ISlideEditorBridgeService } from '../services/slide-editor-bridge.service';
import type { ISlideRichTextProps } from '../type';

const HIDDEN_EDITOR_POSITION = -1000;

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

    private _updateEditor(targetObject: RichText, startEditingParam: ISlideRichTextProps) {
        const { scene, engine } = this._renderContext;
        const unitId = this._renderContext.unitId;

        const setEditorRect: ISetEditorInfo = {
            scene,
            engine,
            unitId,
            pageId: '',
            startEditingText: targetObject,
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
            const transformer = scene?.getTransformer();

            if (!transformer) return;

            // calling twice when add an object.
            transformer.changeStart$.subscribe((param: IChangeObserverConfig) => {
                // console.log('activeObject', page.id, transformer == window.trans, param);
                const target = param.target;
                if (!target) return;
                if (target.objectType !== ObjectType.RICH_TEXT) {
                    // rm other text editor
                    this.changeVisible(false);
                } else {
                    const elementData = (target as RichText).toJson();
                    this.startEditing(target as RichText, {
                        top: elementData.top,
                        left: elementData.left,
                        width: elementData.width,
                        height: elementData.height,
                        scaleX: elementData.scaleX,
                        scaleY: elementData.scaleY,
                        text: elementData.text,
                        fs: elementData.fs,
                    });
                }
            });
        }
    }

    /**
     * TODO calling twice ？？？？
     * editingParam derives from RichText object.
     *
     * TODO @lumixraku need scale param
     * @param editingParam
     */
    startEditing(target: RichText, editingParam: ISlideRichTextProps) {
        // this.setSlideTextEditor$.next({ content, rect });
        this._updateEditor(target, editingParam);
        this.changeVisible(true);
    }

    changeVisible(visible: boolean) {
        const { unitId } = this._renderContext;
        this._editorBridgeService.changeVisible({ visible, eventType: 3, unitId });
    }
}
