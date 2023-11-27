import {
    Disposable,
    ICommandService,
    LifecycleStages,
    Nullable,
    ObjectMatrix,
    OnLifecycle,
    RefAlias,
    toDisposable,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { NumfmtItem } from '../base/types';
import { SetNumfmtMutation } from '../commands/mutations/set.numfmt.mutation';
import type { INumfmtService, NumfmtItemWithCache } from './type';

@OnLifecycle(LifecycleStages.Ready, NumfmtService)
export class NumfmtService extends Disposable implements INumfmtService {
    _numfmtModel: Map<string, ObjectMatrix<NumfmtItemWithCache>> = new Map();

    _refAliasModel = new RefAlias<{ count: number; numfmtId: string; pattern: string }>([], ['pattern', 'numfmtId']);

    constructor(@Inject(ICommandService) private _commandService: ICommandService) {
        super();
        this._initModel();
        this._initCommands();
        this.disposeWithMe(
            toDisposable(() => {
                this._numfmtModel.clear();
                this._refAliasModel.clear();
            })
        );
    }

    private _initModel() {
        // todo init model after resource-plugin finished.
    }

    private _initCommands() {
        [SetNumfmtMutation].forEach((config) => this.disposeWithMe(this._commandService.registerCommand(config)));
    }

    getValue(
        workbookId: string,
        worksheetId: string,
        row: number,
        col: number,
        model?: ObjectMatrix<NumfmtItemWithCache>
    ) {
        const _model: Nullable<ObjectMatrix<NumfmtItemWithCache>> = model || this.getModel(workbookId, worksheetId);
        if (!_model) {
            return null;
        }
        const value = _model.getValue(row, col);
        if (value) {
            const realPattern = this._refAliasModel.getValue(value?.pattern)?.pattern || value?.pattern;
            return value ? { ...value, pattern: realPattern } : null;
        }
        return null;
    }

    setValue(workbookId: string, worksheetId: string, row: number, col: number, value: Nullable<NumfmtItem>) {
        let model = this.getModel(workbookId, worksheetId);
        if (!model) {
            const key = getModelKey(workbookId, worksheetId);
            model = new ObjectMatrix();
            this._numfmtModel.set(key, model);
        }
        if (value) {
            model.setValue(row, col, value);
        } else {
            model.realDeleteValue(row, col);
        }
    }

    setValues(
        workbookId: string,
        worksheetId: string,
        values: Array<{ row: number; col: number; pattern?: string; type: NumfmtItem['type'] }>
    ) {
        const ___delete___ = '___delete___';
        const group = this._groupByKey(values, 'pattern', ___delete___);
        const model = this.getModel(workbookId, worksheetId);
        Object.keys(group).forEach((pattern: string) => {
            const values = group[pattern];
            const length = values.length;
            if (!length) {
                return;
            }
            let refPattern = this._refAliasModel.getValue(pattern);
            if (pattern === ___delete___) {
                values.forEach((item) => {
                    const { row, col } = item;
                    const oldValue = this.getValue(workbookId, worksheetId, row, col, model);
                    if (oldValue && oldValue.pattern) {
                        const oldRefPattern = this._refAliasModel.getValue(oldValue.pattern);
                        if (oldRefPattern) {
                            oldRefPattern.count--;
                            // if (oldRefPattern.count <= 0) {
                            // this._refAliasModel.deleteValue(oldValue.pattern);
                            // }
                        }
                    }
                    this.setValue(workbookId, worksheetId, row, col, null);
                });
                if (refPattern) {
                    const count = refPattern.count - length;
                    if (count > 0) {
                        this._refAliasModel.setValue(pattern, 'count', count);
                    }
                    //else {
                    // this._refAliasModel.deleteValue(pattern);
                    // }
                }
            } else {
                if (!refPattern) {
                    refPattern = { count: 0, numfmtId: this._getUniqueRefId(), pattern };
                    this._refAliasModel.addValue(refPattern);
                }
                values.forEach((item) => {
                    const { row, col, type } = item;
                    if (model) {
                        const oldValue = this.getValue(workbookId, worksheetId, row, col, model);
                        if (oldValue && oldValue.pattern) {
                            const oldRefPattern = this._refAliasModel.getValue(oldValue.pattern);
                            if (oldRefPattern) {
                                oldRefPattern.count--;
                                // if (oldRefPattern.count <= 0) {
                                //     this._refAliasModel.deleteValue(oldValue.pattern);
                                // }
                            }
                        }
                    }
                    this.setValue(workbookId, worksheetId, row, col, {
                        pattern: refPattern?.numfmtId || pattern!,
                        type,
                    });
                    refPattern!.count++;
                });
            }
        });
    }

    _groupByKey<T = Record<string, unknown>>(arr: T[], key: string, blankKey = '') {
        return arr.reduce(
            (result, current) => {
                const pattern = current && ((current as Record<string, unknown>)[key] as string);
                if (pattern) {
                    if (!result[pattern]) {
                        result[pattern] = [];
                    }
                    result[pattern].push(current);
                } else {
                    result[blankKey].push(current);
                }
                return result;
            },
            { [blankKey]: [] } as Record<string, T[]>
        );
    }

    _getUniqueRefId() {
        const keyList = this._refAliasModel.getKeyMap('numfmtId') as string[];
        const maxId = Math.max(...keyList.map(Number), 0);
        return `${maxId + 1}`;
    }

    getModel(workbookId: string, worksheetId: string) {
        const key = getModelKey(workbookId, worksheetId);
        return this._numfmtModel.get(key);
    }
}

const getModelKey = (workbookId: string, worksheetId: string) => `${workbookId}_${worksheetId}`;
