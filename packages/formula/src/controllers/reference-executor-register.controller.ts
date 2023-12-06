import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
} from '@univerjs/core';
import { IActiveDirtyManagerService, IPassiveDirtyManagerService } from '@univerjs/engine-formula';
import { Inject } from '@wendellhu/redi';

import { FormulaDataModel } from '../models/formula-data.model';

@OnLifecycle(LifecycleStages.Ready, ReferenceExecutorRegisterController)
export class ReferenceExecutorRegisterController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IPassiveDirtyManagerService
        private readonly _PassiveDirtyManagerService: IPassiveDirtyManagerService,
        @IActiveDirtyManagerService private readonly _ActiveDirtyManagerService: IActiveDirtyManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        const featureId = 'test';

        const unitId = 'workbook-01';

        const subComponentId = 'sheet-0011';

        const runtimeCellData = {
            [unitId]: {
                [subComponentId]: new ObjectMatrix({
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
                [subComponentId]: [
                    {
                        startRow: 4,
                        startColumn: 0,
                        endRow: 4,
                        endColumn: 0,
                    },
                ],
            },
        };

        this._PassiveDirtyManagerService.register(featureId, {
            unitId,
            subComponentId,
            dependencyRanges: [
                {
                    unitId,
                    sheetId: subComponentId,
                    range: {
                        startRow: 0,
                        endRow: 3,
                        startColumn: 0,
                        endColumn: 3,
                    },
                },
            ],
            getDirtyData: () => {
                console.log('test reference executor register');
                return {
                    runtimeCellData,
                    dirtyRanges,
                };
            },
        });
    }
}
