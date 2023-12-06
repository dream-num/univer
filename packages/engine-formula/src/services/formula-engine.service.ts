import type { IUnitRange } from '@univerjs/core';
import {
    Disposable,
    IConfigService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    requestImmediateMacroTask,
} from '@univerjs/core';
import type { Ctor, Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { Subject } from 'rxjs';

import type {
    IArrayFormulaRangeType,
    IFeatureDirtyRangeType,
    IFormulaDatasetConfig,
    IRuntimeUnitDataType,
    IUnitExcludedCell,
} from '../basics/common';
import { ErrorType } from '../basics/error-type';
import type { IFunctionInfo } from '../basics/function';
import { FUNCTION_NAMES } from '../basics/function';
import { LexerTreeBuilder } from '../engine/analysis/lexer';
import type { LexerNode } from '../engine/analysis/lexer-node';
import { AstTreeBuilder } from '../engine/analysis/parser';
import { AstRootNodeFactory } from '../engine/ast-node/ast-root-node';
import { ErrorNode } from '../engine/ast-node/base-ast-node';
import { FunctionNodeFactory } from '../engine/ast-node/function-node';
import { LambdaNodeFactory } from '../engine/ast-node/lambda-node';
import { LambdaParameterNodeFactory } from '../engine/ast-node/lambda-parameter-node';
import { OperatorNodeFactory } from '../engine/ast-node/operator-node';
import { PrefixNodeFactory } from '../engine/ast-node/prefix-node';
import { ReferenceNodeFactory } from '../engine/ast-node/reference-node';
import { SuffixNodeFactory } from '../engine/ast-node/suffix-node';
import { UnionNodeFactory } from '../engine/ast-node/union-node';
import { ValueNodeFactory } from '../engine/ast-node/value-node';
import { FormulaDependencyGenerator } from '../engine/dependency/formula-dependency';
import { Interpreter } from '../engine/interpreter/interpreter';
import type { FunctionVariantType } from '../engine/reference-object/base-reference-object';
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
import type { BaseFunction } from '../functions/base-function';
import { FormulaCurrentConfigService, IFormulaCurrentConfigService } from './current-data.service';
import { DefinedNamesService, IDefinedNamesService } from './defined-names.service';
import { FunctionService, IFunctionService } from './function.service';
import type { IAllRuntimeData, IExecutionInProgressParams } from './runtime.service';
import { FormulaExecuteStageType, FormulaRuntimeService, IFormulaRuntimeService } from './runtime.service';
import { ISuperTableService, SuperTableService } from './super-table.service';

export const DEFAULT_CYCLE_REFERENCE_COUNT = 1;

export const CYCLE_REFERENCE_COUNT = 'cycleReferenceCount';

export const EVERY_N_FUNCTION_EXECUTION_PAUSE = 100;

@OnLifecycle(LifecycleStages.Rendered, FormulaEngineService)
export class FormulaEngineService extends Disposable {
    private readonly _executionStartListener$ = new Subject<boolean>();

    readonly executionStartListener$ = this._executionStartListener$.asObservable();

    private readonly _executionCompleteListener$ = new Subject<IAllRuntimeData>();

    readonly executionCompleteListener$ = this._executionCompleteListener$.asObservable();

    private readonly _executionInProgressListener$ = new Subject<IExecutionInProgressParams>();

    readonly executionInProgressListener$ = this._executionInProgressListener$.asObservable();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
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
     * Modify the formula text to offset the 'ref' text within it.
     * @param formulaString '=SUM(A1:B10)'
     * @param refOffsetX
     * @param refOffsetY
     * @returns
     */
    moveFormulaRefOffset(formulaString: string, refOffsetX: number, refOffsetY: number) {
        return this.lexerTreeBuilder.moveFormulaRefOffset(formulaString, refOffsetX, refOffsetY);
    }

    /**
     * Stop the execution of the formula.
     */
    stopFormulaExecution() {
        this.runtimeService.stopExecution();
    }

    /**
     * When the feature is loading,
     * the pre-calculated content needs to be input to the formula engine in advance,
     * so that the formula can read the correct values.
     * @param featureId
     * @param featureData
     */
    setRuntimeFeatureCellData(featureId: string, featureData: IRuntimeUnitDataType) {
        this.runtimeService.setRuntimeFeatureCellData(featureId, featureData);
    }

    setRuntimeFeatureRange(featureId: string, featureRange: IFeatureDirtyRangeType) {
        this.runtimeService.setRuntimeFeatureRange(featureId, featureRange);
    }

    /**
     *
     * @param unitId
     * @param formulaData
     * @param interpreterDatasetConfig
     * @param forceCalculate force calculate all formula, and ignore dependency relationship
     * @param dirtyRanges input external unit data for multi workbook
     * @returns
     */
    async execute(formulaDatasetConfig: IFormulaDatasetConfig) {
        this._executionStartListener$.next(true);

        this.currentConfigService.load(formulaDatasetConfig);

        this.runtimeService.reset();

        const cycleReferenceCount = (this._configService.getConfig('CYCLE_REFERENCE_COUNT') ||
            DEFAULT_CYCLE_REFERENCE_COUNT) as number;

        for (let i = 0; i < cycleReferenceCount; i++) {
            await this._execute();
            const isCycleDependency = this.runtimeService.isCycleDependency();
            if (!isCycleDependency) {
                break;
            }
        }

        this.runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.CALCULATION_COMPLETED);

        this._executionInProgressListener$.next(this.runtimeService.getRuntimeState());

        this._executionCompleteListener$.next(this.runtimeService.getAllRuntimeData());
    }

    private async _execute() {
        const executeState = await this._apply();

        if (executeState == null) {
            return;
        }

        const { arrayFormulaRange, runtimeFeatureRange } = executeState;

        const { dirtyRanges, excludedCell } = this._getArrayFormulaDirtyRangeAndExcludedRange(
            arrayFormulaRange,
            runtimeFeatureRange
        );

        if (dirtyRanges == null || dirtyRanges.length === 0) {
            return true;
        }

        this.currentConfigService.loadDirtyRangesAndExcludedCell(dirtyRanges, excludedCell);

        await this._apply(true);

        return true;
    }

    private _getArrayFormulaDirtyRangeAndExcludedRange(
        arrayFormulaRange: IArrayFormulaRangeType,
        runtimeFeatureRange: { [featureId: string]: IFeatureDirtyRangeType }
    ) {
        const dirtyRanges: IUnitRange[] = [];
        const excludedCell: IUnitExcludedCell = {};
        Object.keys(arrayFormulaRange).forEach((unitId) => {
            const sheetArrayFormulaRange = arrayFormulaRange[unitId];
            Object.keys(sheetArrayFormulaRange).forEach((sheetId) => {
                const cellValue = new ObjectMatrix(sheetArrayFormulaRange[sheetId]);

                if (cellValue == null) {
                    return true;
                }

                const newCellData = new ObjectMatrix<boolean>();

                cellValue.forValue((row, column, range) => {
                    newCellData.setValue(row, column, true);

                    dirtyRanges.push({ unitId, sheetId, range });
                });

                if (excludedCell[unitId] == null) {
                    excludedCell[unitId] = {};
                }

                excludedCell[unitId][sheetId] = newCellData;
            });
        });

        Object.keys(runtimeFeatureRange).forEach((featureId) => {
            const arrayRange = runtimeFeatureRange[featureId];
            Object.keys(arrayRange).forEach((unitId) => {
                const sheetArrayFormulaRange = arrayRange[unitId];
                Object.keys(sheetArrayFormulaRange).forEach((sheetId) => {
                    const ranges = sheetArrayFormulaRange[sheetId];

                    if (ranges == null) {
                        return true;
                    }

                    for (const range of ranges) {
                        dirtyRanges.push({ unitId, sheetId, range });
                    }
                });
            });
        });

        return { dirtyRanges, excludedCell };
    }

    private async _apply(isArrayFormulaState = false) {
        if (isArrayFormulaState) {
            this.runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.START_DEPENDENCY_ARRAY_FORMULA);
        } else {
            this.runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.START_DEPENDENCY);
        }

        this._executionInProgressListener$.next(this.runtimeService.getRuntimeState());

        const treeList = await this.formulaDependencyGenerator.generate();

        const interpreter = this.interpreter;

        if (isArrayFormulaState) {
            this.runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.START_CALCULATION_ARRAY_FORMULA);

            this.runtimeService.setTotalArrayFormulasToCalculate(treeList.length);
        } else {
            this.runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.START_CALCULATION);

            this.runtimeService.setTotalFormulasToCalculate(treeList.length);
        }

        this._executionInProgressListener$.next(this.runtimeService.getRuntimeState());

        for (let i = 0, len = treeList.length; i < len; i++) {
            /**
             * For every functions, execute a setTimeout to wait for external command input.
             */
            await new Promise((resolve) => {
                requestImmediateMacroTask(resolve);
            });

            if (this.runtimeService.isStopExecution()) {
                this.runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.IDLE);
                this.runtimeService.markedAsStopFunctionsExecuted();
                this._executionCompleteListener$.next(this.runtimeService.getAllRuntimeData());
                return;
            }

            const tree = treeList[i];
            const astNode = tree.node;
            const getDirtyData = tree.getDirtyData;
            let value: FunctionVariantType;

            if (astNode == null && getDirtyData == null) {
                throw new Error('AstNode or executor is null');
            }

            this.runtimeService.setCurrent(tree.row, tree.column, tree.subComponentId, tree.unitId);

            if (getDirtyData != null && tree.featureId != null) {
                /**
                 * Execute the dependencies registered by the feature,
                 * and return the dirty area marked by the feature,
                 * so as to allow the formulas depending on the dirty area to continue the calculation.
                 */
                const { runtimeCellData, dirtyRanges } = getDirtyData(tree);

                this.runtimeService.setRuntimeFeatureCellData(tree.featureId, runtimeCellData);

                this.runtimeService.setRuntimeFeatureRange(tree.featureId, dirtyRanges);
            } else if (astNode != null) {
                if (interpreter.checkAsyncNode(astNode)) {
                    value = await interpreter.executeAsync(astNode);
                } else {
                    value = interpreter.execute(astNode);
                }

                if (tree.formulaId != null) {
                    this.runtimeService.setRuntimeOtherData(tree.formulaId, value);
                } else {
                    this.runtimeService.setRuntimeData(value);
                }
            }

            if (isArrayFormulaState) {
                this.runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.CURRENTLY_CALCULATING_ARRAY_FORMULA);

                this.runtimeService.setCompletedArrayFormulasCount(i + 1);
            } else {
                this.runtimeService.setFormulaExecuteStage(FormulaExecuteStageType.CURRENTLY_CALCULATING);

                this.runtimeService.setCompletedFormulasCount(i + 1);
            }

            this._executionInProgressListener$.next(this.runtimeService.getRuntimeState());
        }

        if (treeList.length > 0) {
            this.runtimeService.markedAsSuccessfullyExecuted();
        } else if (!isArrayFormulaState) {
            this.runtimeService.markedAsNoFunctionsExecuted();
        }

        return this.runtimeService.getAllRuntimeData();
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

        // console.log('sequence', this.lexerTreeBuilder.sequenceNodesBuilder(formulaString));

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

            // [IPassiveDirtyManagerService, { useClass: PassiveDirtyManagerService }],

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
