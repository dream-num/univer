import { Disposable, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Ctor, Dependency, Inject, Injector } from '@wendellhu/redi';

import { LexerTreeBuilder } from '../analysis/lexer';
import { LexerNode } from '../analysis/lexer-node';
import { AstTreeBuilder } from '../analysis/parser';
import { AstRootNodeFactory } from '../ast-node/ast-root-node';
import { ErrorNode } from '../ast-node/base-ast-node';
import { FunctionNodeFactory } from '../ast-node/function-node';
import { LambdaNodeFactory } from '../ast-node/lambda-node';
import { LambdaParameterNodeFactory } from '../ast-node/lambda-parameter-node';
import { OperatorNodeFactory } from '../ast-node/operator-node';
import { PrefixNodeFactory } from '../ast-node/prefix-node';
import { ReferenceNodeFactory } from '../ast-node/reference-node';
import { SuffixNodeFactory } from '../ast-node/suffix-node';
import { UnionNodeFactory } from '../ast-node/union-node';
import { ValueNodeFactory } from '../ast-node/value-node';
import { IFormulaDatasetConfig } from '../basics/common';
import { ErrorType } from '../basics/error-type';
import { FUNCTION_NAMES, IFunctionInfo } from '../basics/function';
import { FormulaDependencyGenerator } from '../dependency/formula-dependency';
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
} from '../functions';
import { BaseFunction } from '../functions/base-function';
import { Interpreter } from '../interpreter/interpreter';
import { FunctionVariantType } from '../reference-object/base-reference-object';
import { FormulaCurrentConfigService, IFormulaCurrentConfigService } from './current-data.service';
import { DefinedNamesService, IDefinedNamesService } from './defined-names.service';
import { FunctionService, IFunctionService } from './function.service';
import { FormulaRuntimeService, IFormulaRuntimeService } from './runtime.service';
import { ISuperTableService, SuperTableService } from './super-table.service';

@OnLifecycle(LifecycleStages.Rendered, FormulaEngineService)
export class FormulaEngineService extends Disposable {
    constructor(@Inject(Injector) private readonly _injector: Injector) {
        super();
        this._initializeDependencies();
        this._initializeFunctions();
    }

    override dispose(): void {}

    get currentConfigService() {
        return this._injector.get(IFormulaCurrentConfigService);
    }

    get runtimeService() {
        return this._injector.get(IFormulaRuntimeService);
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

    get astTreeBuilder() {
        return this._injector.get(AstTreeBuilder);
    }

    get functionService() {
        return this._injector.get(IFunctionService);
    }

    get lexerTreeBuilder() {
        return this._injector.get(LexerTreeBuilder);
    }

    /**
     * Use register to register a function, new CustomFunction(inject, name)
     */
    registerFunction(...functions: BaseFunction[]) {
        this.functionService.registerExecutors(...functions);
    }

    /**
     * Obtain the operator of the function to reuse the calculation logic.
     * The argument type accepted by the function is: FunctionVariantType.
     * For instance, the sum formula capability is needed for the statistics bar.
     * You can obtain the calculation result by using
     * const sum = formulaService.getExecutor(FUNCTION_NAMES.SUM);
     * sum.calculate(new RangeReferenceObject(range, sheetId, unitId), ref2, re3).
     * @param functionName Function name, which can be obtained through the FUNCTION_NAMES enumeration.
     * @returns
     */
    getExecutor(functionName: FUNCTION_NAMES) {
        return this.functionService.getExecutor(functionName);
    }

    /**
     * Use register to register function description
     */
    registerDescription(...descriptions: IFunctionInfo[]) {
        this.functionService.registerDescriptions(...descriptions);
    }

    /**
     * Obtain all function descriptions registered to the formulaEngineService.
     * @returns
     */
    getDescriptions() {
        return this.functionService.getDescriptions();
    }

    getRunTimeData(unitId: string) {
        return {
            sheetData: this.runtimeService.getSheetData(unitId),
            arrayFormulaData: this.runtimeService.getSheetArrayFormula(unitId),
        };
    }

    builderLexerTree(formulaString: string) {
        const lexerNode = this.lexerTreeBuilder.treeBuilder(formulaString, false);

        if (Object.values(ErrorType).includes(lexerNode as ErrorType)) {
            return ErrorNode.create(lexerNode as ErrorType);
        }
        return lexerNode as LexerNode;
    }

    buildSequenceNodes(formulaString: string) {
        return this.lexerTreeBuilder.sequenceNodesBuilder(formulaString);
    }

    checkIfAddBracket(formulaString: string) {
        return this.lexerTreeBuilder.checkIfAddBracket(formulaString);
    }

    getFunctionAndParameter(formulaString: string, strIndex: number) {
        return this.lexerTreeBuilder.getFunctionAndParameter(formulaString, strIndex);
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

    calculate(formulaString: string, transformSuffix: boolean = true) {
        // TODO how to observe @alex
        // this.getObserver('onBeforeFormulaCalculateObservable')?.notifyObservers(formulaString);
        const lexerNode = this.lexerTreeBuilder.treeBuilder(formulaString, transformSuffix);

        if (Object.values(ErrorType).includes(lexerNode as ErrorType)) {
            return ErrorNode.create(lexerNode as ErrorType);
        }

        // this.lexerTreeBuilder.suffixExpressionHandler(lexerNode); // suffix Express, 1+(3*4=4)*5+1 convert to 134*4=5*1++
        console.log('lexerNode', (lexerNode as LexerNode).serialize());

        console.log('sequence', this.lexerTreeBuilder.sequenceNodesBuilder(formulaString));

        // this.getObserver('onAfterFormulaLexerObservable')?.notifyObservers(lexerNode);

        // const astTreeBuilder = new AstTreeBuilder();

        const astNode = this.astTreeBuilder.parse(lexerNode as LexerNode);

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
            [IFormulaCurrentConfigService, { useClass: FormulaCurrentConfigService }],
            [IFormulaRuntimeService, { useClass: FormulaRuntimeService }],

            [ISuperTableService, { useClass: SuperTableService }],
            [IDefinedNamesService, { useClass: DefinedNamesService }],
            [IFunctionService, { useClass: FunctionService }],

            // Calculation engine
            [FormulaDependencyGenerator],
            [Interpreter],
            [LexerTreeBuilder],
            [AstTreeBuilder],

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

    private _initializeFunctions() {
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
