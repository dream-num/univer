import { DocSkeletonManagerService, getDocObject, TextSelectionManagerService } from '@univerjs/base-docs';
import { FormulaEngineService } from '@univerjs/base-formula-engine';
import { IRenderManagerService, ITextSelectionRenderManager } from '@univerjs/base-render';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
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
        // const formulaEngine = this.getPluginByName<FormulaPlugin>('formula')?.getFormulaEngine();
        // =(sum(max(B1:C10,10)*5-100,((1+1)*2+5)/2,10)+count(B1:C10,10*5-100))*5-100
        // =(sum(max(B1:C10,10)*5-100,((1+1)*2+5)/2,10, lambda(x,y, x*y*x)(sum(1,(1+2)*3),2))+lambda(x,y, x*y*x)(sum(1,(1+2)*3),2)+count(B1:C10,10*5-100))*5-100
        // =((1+2)-A1:B2 + 5)/2 + sum(indirect("A5"):B10 + A1:offset("C5", 1, 1), 100)
        // =1+(3*4=4)*5+1
        // =(-(1+2)--@A1:B2 + 5)/2 + -sum(indirect("A5"):B10# + B6# + A1:offset("C5", 1, 1)  ,  100) + {1,2,3;4,5,6;7,8,10} + lambda(x,y,z, x*y*z)(sum(1,(1+2)*3),2,lambda(x,y, @offset(A1:B0,x#*y#))(1,2):C20) & "美国人才" + sum((1+2%)*30%, 1+2)%
        // formulaEngine?.calculate(`=lambda(x,y, x*y*x)(sum(1,(1+2)*3),2)+1-max(100,200)`);
        console.log('calculate', this._formulaEngineService.calculate('=lambda(x,y, x*y*x)+1-max(100,200)'));
    }

    private _commandExecutedListener() {}

    private _getDocObject() {
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }
}
