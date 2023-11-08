import { Disposable, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Ctor, Dependency, Inject, Injector } from '@wendellhu/redi';

import { LexerTreeMaker } from '../Analysis/Lexer';
import { AstTreeMaker } from '../Analysis/Parser';
import { AstRootNodeFactory } from '../AstNode/AstRootNode';
import { FunctionNodeFactory } from '../AstNode/FunctionNode';
import { LambdaNodeFactory } from '../AstNode/LambdaNode';
import { LambdaParameterNodeFactory } from '../AstNode/LambdaParameterNode';
import { OperatorNodeFactory } from '../AstNode/OperatorNode';
import { PrefixNodeFactory } from '../AstNode/PrefixNode';
import { ReferenceNodeFactory } from '../AstNode/ReferenceNode';
import { SuffixNodeFactory } from '../AstNode/SuffixNode';
import { UnionNodeFactory } from '../AstNode/UnionNode';
import { ValueNodeFactory } from '../AstNode/ValueNode';
import { IFormulaDatasetConfig } from '../Basics/Common';
import { FUNCTION_NAMES } from '../Basics/Function';
import { FormulaDependencyGenerator } from '../Dependency/FormulaDependency';
import {
    Average,
    Compare,
    Concatenate,
    Count,
    Divided,
    Indirect,
    Max,
    Min,
    Minus,
    Multiply,
    Offset,
    Plus,
    Power,
    Sum,
    Union,
} from '../Functions';
import { BaseFunction } from '../Functions/BaseFunction';
import { Interpreter } from '../Interpreter/Interpreter';
import { FunctionVariantType } from '../ReferenceObject/BaseReferenceObject';
import { CurrentConfigService, ICurrentConfigService } from './current-data.service';
import { DefinedNamesService, IDefinedNamesService } from './defined-names.service';
import { FunctionService, IFunctionService } from './function.service';
import { IRuntimeService, RuntimeService } from './runtime.service';
import { ISuperTableService, SuperTableService } from './super-table.service';

@OnLifecycle(LifecycleStages.Rendered, FormulaEngineService)
export class FormulaEngineService extends Disposable {
    constructor(@Inject(Injector) private readonly _injector: Injector) {
        super();
        this._initializeDependencies();

        this.initializeFunctions();
    }

    override dispose(): void {}

    get currentConfigService() {
        return this._injector.get(ICurrentConfigService);
    }

    get runtimeService() {
        return this._injector.get(IRuntimeService);
    }

    get superTableService() {
        return this._injector.get(ISuperTableService);
    }

    get definedNamesService() {
        return this._injector.get(IDefinedNamesService);
    }

    get formulaDependencyGenerator() {
        return this._injector.get(FormulaDependencyGenerator);
    }

    get interpreter() {
        return this._injector.get(Interpreter);
    }

    get astTreeMaker() {
        return this._injector.get(AstTreeMaker);
    }

    get functionService() {
        return this._injector.get(IFunctionService);
    }

    get lexerTreeMaker() {
        return this._injector.get(LexerTreeMaker);
    }

    /**
     * Use register to register a function, new CustomFunction(inject, name)
     */
    registerFunction(...functions: BaseFunction[]) {
        this.functionService.registerExecutors(...functions);
    }

    /**
     *
     * @param unitId
     * @param formulaData
     * @param interpreterDatasetConfig
     * @param forceCalculate force calculate all formula, and ignore dependency relationship
     * @param updateRangeList input external unit data for multi workbook
     * @returns
     */
    async execute(unitId: string, formulaDatasetConfig: IFormulaDatasetConfig) {
        this.currentConfigService.load(formulaDatasetConfig);

        this.runtimeService.reset();

        // const dependencyGenerator = FormulaDependencyGenerator.create(formulaData, forceCalculate);

        const treeList = await this.formulaDependencyGenerator.generate();

        const interpreter = this.interpreter;

        for (let i = 0, len = treeList.length; i < len; i++) {
            const tree = treeList[i];
            const astNode = tree.node;
            let value: FunctionVariantType;

            if (astNode == null) {
                throw new Error('astNode is null');
            }

            this.runtimeService.setCurrent(tree.row, tree.column, tree.sheetId, tree.unitId);

            if (interpreter.checkAsyncNode(astNode)) {
                value = await interpreter.executeAsync(astNode);
            } else {
                value = interpreter.execute(astNode);
            }
            this.runtimeService.setRuntimeData(value);
        }

        return {
            sheetData: this.runtimeService.getSheetData(unitId),
            arrayFormulaData: this.runtimeService.getSheetArrayFormula(unitId),
        };
    }

    calculate(formulaString: string) {
        // TODO how to observe @alex
        // this.getObserver('onBeforeFormulaCalculateObservable')?.notifyObservers(formulaString);
        const lexerNode = this.lexerTreeMaker.treeMaker(formulaString);
        // this.lexerTreeMaker.suffixExpressionHandler(lexerNode); // suffix Express, 1+(3*4=4)*5+1 convert to 134*4=5*1++
        console.log('lexerNode', lexerNode.serialize());

        // this.getObserver('onAfterFormulaLexerObservable')?.notifyObservers(lexerNode);

        // const astTreeMaker = new AstTreeMaker();

        const astNode = this.astTreeMaker.parse(lexerNode);

        console.log('astNode', astNode?.serialize());

        // const interpreter = Interpreter.create();

        // if (astNode == null) {
        //     return;
        // }

        // if (interpreter.checkAsyncNode(astNode)) {
        //     const resultPromise = interpreter.executeAsync(astNode);

        //     resultPromise.then((value) => {
        //         console.log('formulaResult', value);
        //     });
        // } else {
        //     console.log(interpreter.execute(astNode));
        // }
    }

    private _initializeDependencies() {
        const dependencies: Dependency[] = [
            // Config or data services
            [ICurrentConfigService, { useClass: CurrentConfigService }],
            [IRuntimeService, { useClass: RuntimeService }],

            [ISuperTableService, { useClass: SuperTableService }],
            [IDefinedNamesService, { useClass: DefinedNamesService }],
            [IFunctionService, { useClass: FunctionService }],

            // Calculation engine
            [FormulaDependencyGenerator],
            [Interpreter],
            [LexerTreeMaker],
            [AstTreeMaker],

            // AstNode factory
            [AstRootNodeFactory],
            [FunctionNodeFactory],
            [LambdaNodeFactory],
            [LambdaParameterNodeFactory],
            [OperatorNodeFactory],
            [PrefixNodeFactory],
            [ReferenceNodeFactory],
            [SuffixNodeFactory],
            [UnionNodeFactory],
            [ValueNodeFactory],
        ];

        dependencies.forEach((d) => {
            this._injector.add(d);
        });
    }

    private initializeFunctions() {
        // new Sum(this._injector, FUNCTION_NAMES.SUM)
        const functions: BaseFunction[] = [
            // base function
            [Compare, FUNCTION_NAMES.COMPARE],
            [Divided, FUNCTION_NAMES.DIVIDED],
            [Minus, FUNCTION_NAMES.MINUS],
            [Multiply, FUNCTION_NAMES.MULTIPLY],
            [Plus, FUNCTION_NAMES.PLUS],
            [Union, FUNCTION_NAMES.UNION],

            // static
            [Average, FUNCTION_NAMES.AVERAGE],
            [Concatenate, FUNCTION_NAMES.CONCATENATE],
            [Count, FUNCTION_NAMES.COUNT],
            [Indirect, FUNCTION_NAMES.INDIRECT],
            [Max, FUNCTION_NAMES.MAX],
            [Min, FUNCTION_NAMES.MIN],
            [Offset, FUNCTION_NAMES.OFFSET],
            [Power, FUNCTION_NAMES.POWER],
            [Sum, FUNCTION_NAMES.SUM],
        ].map((registerObject) => {
            const Func = registerObject[0] as Ctor<BaseFunction>;
            const name = registerObject[1] as string;

            return new Func(this._injector, name);
        });

        this.functionService.registerExecutors(...functions);
    }
}
