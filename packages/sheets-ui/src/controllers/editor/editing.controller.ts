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

import type { Workbook } from '@univerjs/core';
import {
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    IUndoRedoService,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    RxDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import type { ISheetData } from '@univerjs/engine-formula';
import { Inject } from '@wendellhu/redi';
import { takeUntil } from 'rxjs';

@OnLifecycle(LifecycleStages.Rendered, EditingController)
export class EditingController extends RxDisposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(IUndoRedoService) private readonly _undoRedoService: IUndoRedoService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._initialNormalInput();
        this._listenEditorBlur();
    }

    private _listenEditorBlur() {
        this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_DOC)
            .pipe(takeUntil(this.dispose$))
            .subscribe((docDataModel) => {
                if (docDataModel == null) {
                    return;
                }

                const unitId = docDataModel.getUnitId();

                // Clear undo redo stack of cell editor when lose focus.
                if (unitId !== DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
                    this._undoRedoService.clearUndoRedo(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
                }
            });
    }

    private _initialNormalInput() {
        /**
         * const formulaEngine = this.getPluginByName<FormulaPlugin>('formula')?.getUniverFormulaEngine();
         * =(sum(max(B1:C10,10)*5-100,((1+1)*2+5)/2,10)+count(B1:C10,10*5-100))*5-100
         * =(sum(max(B1:C10,10)*5-100,((1+1)*2+5)/2,10, lambda(x,y, x*y*x)(sum(1,(1+2)*3),2))+lambda(x,y, x*y*x)(sum(1,(1+2)*3),2)+count(B1:C10,10*5-100))*5-100
         * =((1+2)-A1:B2 + 5)/2 + sum(indirect("A5"):B10 + A1:offset("C5", 1, 1), 100)
         * =1+(3*4=4)*5+1
         * =(-(1+2)--@A1:B2 + 5)/2 + -sum(indirect("A5"):B10# + B6# + A1:offset("C5", 1, 1)  ,  100) + {1,2,3;4,5,6;7,8,10} + lambda(x,y,z, x*y*z)(sum(1,(1+2)*3),2,lambda(x,y, @offset(A1:B0,x#*y#))(1,2):C20) & "美国人才" + sum((1+2%)*30%, 1+2)%
         * =lambda(x, y, lambda(x,y, x*lambda(x,y, x*y*x)(x,y))(x,y))(sum(1,2,3), 2)
         * =let(x,5,y,4,sum(x,y)+x))
         * =REDUCE(1, A1:C2, LAMBDA(a,b,a+b^2))
         * =sum(, A1:B1)
         * formulaEngine?.calculate(`=lambda(x,y, x*y*x)(sum(1,(1+2)*3),2)+1-max(100,200)`);
         */
        const sheetData: ISheetData = {};
        this._univerInstanceService
            .getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!
            .getSheets()
            .forEach((sheet) => {
                const sheetConfig = sheet.getConfig();
                sheetData[sheet.getSheetId()] = {
                    cellData: new ObjectMatrix(sheetConfig.cellData),
                    rowCount: sheetConfig.rowCount,
                    columnCount: sheetConfig.columnCount,
                    rowData: sheetConfig.rowData,
                    columnData: sheetConfig.columnData,
                };
            });
    }
}
