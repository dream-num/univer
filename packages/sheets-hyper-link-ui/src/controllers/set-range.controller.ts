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

import { BuildTextUtils, CustomRangeType, Disposable, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, generateRandomId, TextX, Tools } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IEditorBridgeService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';

export class SheetHyperLinkSetRangeController extends Disposable {
    constructor(
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._initAfterEditor();
    }

    private _initAfterEditor() {
        this.disposeWithMe(this._editorBridgeService.interceptor.intercept(this._editorBridgeService.interceptor.getInterceptPoints().AFTER_CELL_EDIT, {
            handler: (cell, context, next) => {
                if (!cell || cell.p) {
                    return next(cell);
                }

                if (typeof cell.v === 'string' && Tools.isLegalUrl(cell.v) && cell.v[cell.v.length - 1] !== ' ') {
                    const { unitId, subUnitId } = context;
                    const renderer = this._renderManagerService.getRenderById(unitId);
                    const skeleton = renderer?.with(SheetSkeletonManagerService).getWorksheetSkeleton(subUnitId);
                    if (!skeleton) {
                        return next(cell);
                    }
                    const doc = skeleton.skeleton.getBlankCellDocumentModel(cell);
                    if (!doc.documentModel) {
                        return next(cell);
                    }
                    const textX = BuildTextUtils.selection.replace({
                        selection: {
                            startOffset: 0,
                            endOffset: cell.v.length,
                            collapsed: false,
                        },
                        body: {
                            dataStream: `${cell.v}`,
                            customRanges: [{
                                startIndex: 0,
                                endIndex: cell.v.length - 1,
                                rangeId: generateRandomId(),
                                rangeType: CustomRangeType.HYPERLINK,
                                properties: {
                                    url: cell.v,
                                },
                            }],
                        },
                        doc: doc.documentModel,
                    });
                    if (!textX) {
                        return next(cell);
                    }
                    const body = doc.documentModel.getBody()!;
                    TextX.apply(body, textX.serialize());
                    return next({
                        ...cell,
                        p: {
                            id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                            body,
                            documentStyle: {
                                pageSize: {
                                    width: Infinity,
                                    height: Infinity,
                                },
                            },
                        },
                    });
                }
                return next(cell);
            },
        }));
    }
}
