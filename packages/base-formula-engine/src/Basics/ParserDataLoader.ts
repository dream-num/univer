import { sortRules } from '@univer/core';
import { BaseAstNodeFactory } from '../AstNode/BaseAstNode';
import { FORMULA_AST_NODE_REGISTRY, FORMULA_FUNCTION_REGISTRY } from '../Basics/Registry';
import { BaseFunction } from '../Functions/BaseFunction';
import { ISuperTable, TableOptionType } from './Common';
import { LambdaRuntime } from './LambdaRuntime';
import '../Functions';
export class ParserDataLoader {
    private _astNodeFactoryArray: BaseAstNodeFactory[] = [];

    private _functionMap: Map<string, BaseFunction> = new Map();

    // 18.5.1.2 table (Table)
    private _tableMap: Map<string, ISuperTable> = new Map();

    // 18.5.1.2 table (Table)
    private _tableOptionMap: Map<string, TableOptionType> = new Map();

    // 18.2.6 definedNames (Defined Names)
    private _definedNameMap: Map<string, string> = new Map();

    private _lambdaRuntime: LambdaRuntime;

    private _initialNode() {
        this.registerNode(...FORMULA_AST_NODE_REGISTRY.getData().sort(sortRules));
    }

    private _initialFunction() {
        this._functionMap = FORMULA_FUNCTION_REGISTRY.getData();
    }

    registerNode(...nodeFactories: BaseAstNodeFactory[]) {
        this._astNodeFactoryArray.push(...nodeFactories);
    }

    registerFunction(...functions: BaseFunction[]) {
        for (let i = 0; i < functions.length; i++) {
            const func = functions[i];
            this._functionMap.set(func.name, func);
        }
    }

    registerTable(tableName: string, reference: ISuperTable) {
        this._tableMap.set(tableName, reference);
    }

    registerDefinedName(name: string, reference: string) {
        this._definedNameMap.set(name, reference);
    }

    registerTableOptionMap(tableOption: string, tableOptionType: TableOptionType) {
        this._tableOptionMap.set(tableOption, tableOptionType);
    }

    getTableOptionMap() {
        return this._tableOptionMap;
    }

    getFunctionMap() {
        return this._functionMap;
    }

    getAstNodeFactoryArray() {
        return this._astNodeFactoryArray;
    }

    getTableMap() {
        return this._tableMap;
    }

    getDefinedNameMap() {
        return this._definedNameMap;
    }

    getExecutor(functionToken: string) {
        return this._functionMap.get(functionToken);
    }

    getLambdaRuntime() {
        return this._lambdaRuntime;
    }

    setLambdaRuntime(lambdaRuntime: LambdaRuntime) {
        this._lambdaRuntime = lambdaRuntime;
    }

    hasLambdaRuntime() {
        return this._lambdaRuntime != null;
    }

    hasExecutor(functionToken: string) {
        return this._functionMap.has(functionToken);
    }

    initialize() {
        this._initialNode();
        this._initialFunction();
    }
}
