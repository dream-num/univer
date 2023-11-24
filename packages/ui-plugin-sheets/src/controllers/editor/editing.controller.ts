import { DocSkeletonManagerService, getDocObject, TextSelectionManagerService } from '@univerjs/base-docs';
import { FormulaEngineService, ISheetData } from '@univerjs/base-formula-engine';
import { IRenderManagerService, ITextSelectionRenderManager } from '@univerjs/base-render';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    ObjectMatrix,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { Subscription } from 'rxjs';

import { IEditorBridgeService } from '../../services/editor-bridge.service';

@OnLifecycle(LifecycleStages.Steady, EditingController)
export class EditingController extends Disposable {
    private _onInputSubscription: Nullable<Subscription>;

    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    override dispose(): void {
        this._onInputSubscription?.unsubscribe();
    }

    private _initialize() {
        this._initialNormalInput();
    }

    private _initialNormalInput() {
        /**
         * const formulaEngine = this.getPluginByName<FormulaPlugin>('formula')?.getFormulaEngine();
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
        this._currentUniverService
            .getCurrentUniverSheetInstance()
            .getSheets()
            .forEach((sheet) => {
                const sheetConfig = sheet.getConfig();
                sheetData[sheet.getSheetId()] = {
                    cellData: new ObjectMatrix(sheetConfig.cellData),
                    rowCount: sheetConfig.rowCount,
                    columnCount: sheetConfig.columnCount,
                };
            });

        const formulaData = {
            'workbook-01': {
                'sheet-0011': {
                    9: {
                        8: {
                            f: '=sum(A1:C3)',
                        },
                    },
                    20: {
                        8: {
                            f: '=1+(3*4=4)*5+1',
                        },
                    },
                    22: {
                        8: {
                            f: '=1--1',
                        },
                    },
                    23: {
                        8: {
                            f: '=1--1%',
                        },
                    },
                },
            },
        };

        // this._formulaEngineService
        //     .execute('workbook-01', {
        //         unitData: {
        //             'workbook-01': sheetData,
        //         },
        //         formulaData,
        //         sheetNameMap: {},
        //         forceCalculate: true,
        //         dirtyRanges: [],
        //     })
        //     .then((res) => {
        //         console.log(res.sheetData, res.arrayFormulaData);
        //     });

        console.log(
            'calculate',
            this._formulaEngineService.calculate(`=REDUCE(1, 'sheeASDF%#@ASDFt-1'!A:B1, LAMBDA(a,b,a+b^2))`, false)
        );
    }

    private _commandExecutedListener() {}

    private _getDocObject() {
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }
}
