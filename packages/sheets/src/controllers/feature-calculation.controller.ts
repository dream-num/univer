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

import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
} from '@univerjs/core';
import { FormulaDataModel, IFeatureCalculationManagerService } from '@univerjs/engine-formula';
import { Inject } from '@wendellhu/redi';

@OnLifecycle(LifecycleStages.Ready, FeatureCalculationController)
export class FeatureCalculationController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IFeatureCalculationManagerService
        private readonly _featureCalculationManagerService: IFeatureCalculationManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
    ) {
        super();

        // this._initialize();
    }

    /**
     * Test function access to the formula system example , feature calculation ,
     * you can register a listening range and callback function ,
     * the range will be analyzed through the dependency after the callback function execution ,
     * the callback function to return to an execution result ,
     * you can continue to enter the formula dependency system , to get the final result .
     */
    private _initialize(): void {
        const featureId = 'test';

        const unitId = 'workbook-01';

        const subUnitId = 'sheet-0011';

        const runtimeCellData = {
            [unitId]: {
                [subUnitId]: new ObjectMatrix({
                    4: {
                        0: {
                            v: 10,
                            t: 2,
                        },
                    },
                }),
            },
        };

        const dirtyRanges = {
            [unitId]: {
                [subUnitId]: [
                    {
                        startRow: 4,
                        startColumn: 0,
                        endRow: 4,
                        endColumn: 0,
                    },
                ],
            },
        };

        this._featureCalculationManagerService.register(featureId, {
            unitId,
            subUnitId,
            dependencyRanges: [
                {
                    unitId,
                    sheetId: subUnitId,
                    range: {
                        startRow: 0,
                        endRow: 3,
                        startColumn: 0,
                        endColumn: 3,
                    },
                },
            ],
            getDirtyData: () => {
                return {
                    runtimeCellData,
                    dirtyRanges,
                };
            },
        });
    }
}
