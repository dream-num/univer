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

import type { IDisposable, IDocumentBody, IDocumentData, IDocumentStyle, IRectXYWH, Workbook } from '@univerjs/core';
import { DisposableCollection, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DocumentDataModel, FOCUSING_EDITOR_BUT_HIDDEN, ICommandService, IContextService, Inject, IUniverInstanceService, Nullable, RxDisposable } from '@univerjs/core';
import { type IDocumentLayoutObject, type IRenderContext, type IRenderModule, ITextSelectionRenderManager } from '@univerjs/engine-render';
import { IRangeSelectorService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import {
    VIEWPORT_KEY as DOC_VIEWPORT_KEY,
    DOCS_COMPONENT_MAIN_LAYER_INDEX,
    DocSkeletonManagerService,
    MoveCursorOperation,
    MoveSelectionOperation,
    RichTextEditingMutation,
    TextSelectionManagerService,
} from '@univerjs/docs';
import { ISlideEditorBridgeService } from '../services/slide-editor-bridge.service';

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

    textRect$: Subject<IRectXYWH> = new Subject();
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IContextService private readonly _contextService: IContextService,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @ISlideEditorBridgeService private readonly _editorBridgeService: ISlideEditorBridgeService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager
    ) {
        super();
        this._init();
    }

    private _init(): IDisposable {
        const d = new DisposableCollection();
        this._initSubjectListener(d);

        return d;
    }

    private _initSubjectListener(d: DisposableCollection) {
        d.add(this.textRect$.subscribe((rect: IRectXYWH) => {
            this._updateEditorPosition(rect);
        }));
    }

    private _updateEditorPosition(rect: IRectXYWH) {
      // editor bridge set pos
        // this._editorBridgeService.setEditorRect(rect);
        const editorUnitId = DOCS_NORMAL_EDITOR_UNIT_ID_KEY;
        const unitId = 'slide_test';

        const docData: IDocumentData = {
            id: unitId,
            body: {
                dataStream: 'A Text !!!!',
            } as IDocumentBody,
            documentStyle: {} as IDocumentStyle,
        };
        const docDataModel = new DocumentDataModel(docData);
        const documentLayoutObject: IDocumentLayoutObject = {
            documentModel: docDataModel,
            fontString: 'document',
            textRotation: { a: 0, v: 0 },
            wrapStrategy: 0,
            verticalAlign: 0,
            horizontalAlign: 0,
            paddingData: { t: 0, b: 1, l: 2, r: 2 },
        };

        // same concept as editCellState in sheets-ui/src/controllers/editor/editing.render-controller.ts
        const _editRectState = {
            position: rect,
            scaleX: 1,
            scaleY: 1,
            canvasOffset: {
                left: 0,
                top: 0,
            },
            unitId,
            editorUnitId,
            documentLayoutObject,
        };

        const { documentModel } = documentLayoutObject;
        documentModel!.updateDocumentId(editorUnitId);
        this._instanceSrv.changeDoc(editorUnitId, documentModel!);
        this._contextService.setContextValue(FOCUSING_EDITOR_BUT_HIDDEN, true); // ???
        this._textSelectionManagerService.replaceTextRanges([{
            startOffset: 0,
            endOffset: 0,
        }]);
        this._textSelectionRenderManager.activate(HIDDEN_EDITOR_POSITION, HIDDEN_EDITOR_POSITION);
    }

    setTextRectXYWH(rect: IRectXYWH) {
        this.textRect$.next(rect);
    }
}
