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

import type { DocumentDataModel, IDisposable, ITextRangeParam, Nullable } from '@univerjs/core';
import { Disposable, Inject, isInternalEditorID, IUniverInstanceService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { ComponentManager } from '@univerjs/ui';
import { FloatToolbar } from '../components/float-toolbar/FloatToolbar';
import { DocCanvasPopManagerService } from '../services/doc-popup-manager.service';

const FLOAT_MENU_COMPONENT_KEY = 'univer.doc.float-menu';

export class FloatMenuController extends Disposable {
    private _floatMenu: Nullable<IDisposable> = null;

    constructor(
        @Inject(DocSelectionManagerService) private readonly _docSelectionManagerService: DocSelectionManagerService,
        @Inject(DocCanvasPopManagerService) private readonly _docCanvasPopManagerService: DocCanvasPopManagerService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._registerFloatMenu();
        this._initSelectionChange();
    }

    private _registerFloatMenu() {
        this.disposeWithMe(this._componentManager.register(FLOAT_MENU_COMPONENT_KEY, FloatToolbar));
    }

    private _initSelectionChange() {
        this.disposeWithMe(this._docSelectionManagerService.textSelection$.subscribe((selection) => {
            const { unitId, textRanges } = selection;
            if (isInternalEditorID(unitId)) {
                this.hideFloatMenu();
                return;
            }

            if ((textRanges.length > 0) && textRanges.some((range) => !range.collapsed)) {
                this.hideFloatMenu();
                this.showFloatMenu(unitId, textRanges.find((range) => !range.collapsed)!);
            } else {
                this.hideFloatMenu();
            }
        }));
    }

    hideFloatMenu() {
        this._floatMenu?.dispose();
        this._floatMenu = null;
    }

    showFloatMenu(unitId: string, range: ITextRangeParam) {
        const documentDataModel = this._univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        if (!documentDataModel || documentDataModel.getDisabled()) {
            return;
        }
        this._floatMenu = this._docCanvasPopManagerService.attachPopupToRange(
            range,
            {
                componentKey: FLOAT_MENU_COMPONENT_KEY,
                direction: range.direction === 'backward' ? 'top-center' : 'bottom-center',
                offset: [0, 4],
            },
            unitId
        );

        return toDisposable(() => this.hideFloatMenu());
    }
}
