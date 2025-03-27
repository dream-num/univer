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

import type { DocumentDataModel, IDocDrawingBase } from '@univerjs/core';
import type { IInnerPasteCommandParams } from '@univerjs/docs-ui';
import { BuildTextUtils, createDocumentModelWithStyle, Disposable, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_ZEN_EDITOR_UNIT_ID_KEY, ICommandService, Inject, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { InnerPasteCommand } from '@univerjs/docs-ui';
import { getCurrentTypeOfRenderer, IRenderManagerService } from '@univerjs/engine-render';
import { EditingRenderController, SetCellEditVisibleOperation } from '@univerjs/sheets-ui';
import { IDialogService } from '@univerjs/ui';

const DISABLE_UNITS = [
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_ZEN_EDITOR_UNIT_ID_KEY,
];
export class SheetCellImageCopyPasteController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IDialogService private readonly _dialogService: IDialogService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();
        this._initDocImageCopyPasteHooks();
    }

    private _setCellImage(drwaing: IDocDrawingBase) {
        const docDataModel = createDocumentModelWithStyle('', {});
        const editingRenderController = getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET, this._univerInstanceService, this._renderManagerService)?.with(EditingRenderController);
        const jsonXActions = BuildTextUtils.drawing.add({
            documentDataModel: docDataModel,
            drawings: [drwaing],
            selection: {
                collapsed: true,
                startOffset: 0,
                endOffset: 0,
            },
        });
        if (jsonXActions) {
            docDataModel.apply(jsonXActions);
            if (editingRenderController) {
                editingRenderController.submitCellData(docDataModel);
            }
        }
    }

    private _initDocImageCopyPasteHooks() {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === InnerPasteCommand.id) {
                    const params = commandInfo.params as IInnerPasteCommandParams;
                    const { doc } = params;
                    const currentDoc = this._univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
                    if (currentDoc == null || !Object.keys(doc.drawings ?? {}).length) {
                        return;
                    }
                    const docUnitId = currentDoc.getUnitId();
                    if (DISABLE_UNITS.includes(docUnitId)) {
                        if (docUnitId !== DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
                            const handleCloseDialog = () => {
                                this._dialogService.close('sheet-cell-image-copy-paste');
                                this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
                                    visible: false,
                                });
                            };
                            // empty
                            if (currentDoc.getBody()?.dataStream === '\r\n') {
                                this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
                                    visible: false,
                                });
                                this._setCellImage(Object.values(doc.drawings!)[0]);
                            } else {
                                this._dialogService.open({
                                    id: 'sheet-cell-image-copy-paste',
                                    title: {
                                        label: this._localeService.t('cell-image.pasteTitle'),
                                    },
                                    children: {
                                        label: this._localeService.t('cell-image.pasteContent'),
                                    },
                                    width: 320,
                                    destroyOnClose: true,
                                    onClose: handleCloseDialog,
                                    showOk: true,
                                    showCancel: true,
                                    onOk: () => {
                                        handleCloseDialog();
                                        this._setCellImage(Object.values(doc.drawings!)[0]);
                                    },
                                    onCancel: handleCloseDialog,
                                });
                            }
                        }
                        throw new Error('Sheet cell image copy paste is not supported in this unit');
                    }
                }
            })
        );
    }
}
