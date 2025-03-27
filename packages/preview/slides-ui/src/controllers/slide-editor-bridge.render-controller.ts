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

import type { IDisposable, Nullable, SlideDataModel, UnitModel } from '@univerjs/core';
import type { BaseObject, IRenderContext, IRenderModule, RichText, Scene, Slide } from '@univerjs/engine-render';

import type { ISetEditorInfo } from '../services/slide-editor-bridge.service';
import type { ISlideRichTextProps } from '../type';
import { DisposableCollection, ICommandService, IUniverInstanceService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { DeviceInputEventType, ObjectType } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { UpdateSlideElementOperation } from '../commands/operations/update-element.operation';
import { ISlideEditorBridgeService } from '../services/slide-editor-bridge.service';

// interface ICanvasOffset {
//     left: number;
//     top: number;
// }

// enum CursorChange {
//     InitialState,
//     StartEditor,
//     CursorChange,
// }

export class SlideEditorBridgeRenderController extends RxDisposable implements IRenderModule {
    /**
     * It is used to distinguish whether the user has actively moved the cursor in the editor, mainly through mouse clicks.
     */
    // private _cursorChange: CursorChange = CursorChange.InitialState;

    /** If the corresponding unit is active and prepared for editing. */
    // private _isUnitEditing = false;

    setSlideTextEditor$: Subject<ISlideRichTextProps> = new Subject();

    private _curRichText = null as RichText | null;

    private _d: Nullable<IDisposable>;

    constructor(
        private readonly _renderContext: IRenderContext<UnitModel>,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @ISlideEditorBridgeService private readonly _editorBridgeService: ISlideEditorBridgeService
    ) {
        super();

        this.disposeWithMe(this._instanceSrv.getCurrentTypeOfUnit$<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE).subscribe((slideDataModel) => {
            if (slideDataModel && slideDataModel.getUnitId() === this._renderContext.unitId) {
                this._d = this._init();
            } else {
                this._disposeCurrent();
            }
        }));
    }

    private _init(): IDisposable {
        const d = new DisposableCollection();
        this._initEventListener(d);
        return d;
    }

    private _disposeCurrent(): void {
        this._d?.dispose();
        this._d = null;
    }

    private _setEditorRect(pageId: string, targetObject: RichText) {
        this._curRichText = targetObject as RichText;
        const { scene, engine } = this._renderContext;
        const unitId = this._renderContext.unitId;

        const setEditorRect: ISetEditorInfo = {
            scene,
            engine,
            unitId,
            pageId,
            richTextObj: targetObject,
        };

        this._editorBridgeService.setEditorRect(setEditorRect);
    }

    private _initEventListener(d: DisposableCollection) {
        const listenersForPageScene = (scene: Scene) => {
            const transformer = scene.getTransformer();
            if (!transformer) return;

            d.add(transformer.clearControl$.subscribe(() => {
                this.setEditorVisible(false);
                this.pickOtherObjects();
            }));
            d.add(transformer.createControl$.subscribe(() => {
                this.setEditorVisible(false);
            }));

            // d.add(transformer.changeStart$.subscribe((param: IChangeObserverConfig) => {
            //     const target = param.target;
            //     if (!target) return;
            //     if (target === this._curRichText) {
            //         // do nothing
            //     } else {
            //         this.pickOtherObjects();
            //     }
            // }));

            d.add(scene.onDblclick$.subscribeEvent(() => {
                transformer.clearControls();
                const selectedObjects = transformer.getSelectedObjectMap();
                const object = selectedObjects.values().next().value as Nullable<BaseObject>;
                if (!object) return;

                if (object.objectType !== ObjectType.RICH_TEXT) {
                    this.pickOtherObjects();
                } else {
                    this.startEditing(scene.sceneKey, object as RichText);
                }
            }));

            d.add(this._instanceSrv.focused$.subscribe((fc: Nullable<string>) => {
                this.endEditing();
            }));
        };

        // const model = this._instanceSrv.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE);
        // const pagesMap = model?.getPages() ?? {};
        // const pages = Object.values(pagesMap);

        const { mainComponent } = this._renderContext;
        const slide = mainComponent as Slide;

        // for new pages created by user
        // TODO: better only one pageScene listener. but how?
        // TODO: this controller is in render stage. but default page created in ready stage.
        slide.subSceneChanged$.subscribeEvent((pageScene: Scene) => {
            listenersForPageScene(pageScene);
        });

        // for default pages that already exist
        const pageSceneList = Array.from((mainComponent as Slide).getSubScenes().values());
        for (let i = 0; i < pageSceneList.length; i++) {
            const pageScene = pageSceneList[i] as Scene;
            listenersForPageScene(pageScene);
        }
    }

    pickOtherObjects() {
        this.endEditing();
    }

    /**
     * invoked when picking other object.
     *
     * save editing state to curr richText.
     */
    endEditing() {
        if (!this._curRichText) return;
        this.setEditorVisible(false);
        const curRichText = this._curRichText;

        const slideData = this._instanceSrv.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE);
        if (!slideData) return false;
        curRichText.refreshDocumentByDocData();
        curRichText.resizeToContentSize();

        this._editorBridgeService.endEditing$.next(curRichText);

        const richText: Record<string, any> = {
            bl: 1,
            fs: curRichText.fs,
            text: curRichText.text,
        };
        const textRuns = curRichText.documentData.body?.textRuns;
        if (textRuns && textRuns.length) {
            const textRun = textRuns[0];
            const ts = textRun.ts;

            richText.cl = ts?.cl;
        }

        this._commandService.executeCommand(UpdateSlideElementOperation.id, {
            unitId: this._renderContext.unitId,
            oKey: curRichText?.oKey,
            props: {
                richText,
            },
        });
        this._curRichText = null;
    }

    /**
     * TODO calling twice ？？？？
     * editingParam derives from RichText object.
     *
     * TODO @lumixraku need scale param
     * @param target
     */
    startEditing(pageId: string, target: RichText) {
        // this.setSlideTextEditor$.next({ content, rect });

        this._setEditorRect(pageId, target);
        this.setEditorVisible(true);
    }

    setEditorVisible(visible: boolean) {
        // if editor is visible, hide curr RichTerxtObject
        if (visible) {
            this._curRichText?.hide();
        } else {
            this._curRichText?.show();
        }
        const { unitId } = this._renderContext;
        this._editorBridgeService.changeVisible({ visible, eventType: DeviceInputEventType.PointerDown, unitId });
    }
}
