import type { Nullable, ObjectMatrixPrimitiveType, Workbook } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    ILogService,
    IResourceManagerService,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    RefAlias,
    toDisposable,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { Subject } from 'rxjs';

import { SetNumfmtMutation } from '../../commands/mutations/set-numfmt-mutation';
import type { FormatType, INumfmtItem, INumfmtService, IRefItem, ISnapshot } from './type';

const SHEET_NUMFMT_PLUGIN = 'SHEET_NUMFMT_PLUGIN';
@OnLifecycle(LifecycleStages.Ready, NumfmtService)
export class NumfmtService extends Disposable implements INumfmtService {
    /**
     * Map<unitID ,<sheetId ,ObjectMatrix>>
     * @type {Map<string, Map<string, ObjectMatrix<INumfmtItemWithCache>>>}
     * @memberof NumfmtService
     */
    private _numfmtModel: Map<string, Map<string, ObjectMatrix<INumfmtItem>>> = new Map();

    private _refAliasModel: Map<string, RefAlias<IRefItem, 'pattern' | 'i'>> = new Map();

    private _modelReplace$ = new Subject<string>();
    modelReplace$ = this._modelReplace$.asObservable();

    constructor(
        @Inject(ICommandService) private _commandService: ICommandService,
        @Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(ILogService) private _logService: ILogService
    ) {
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
        const handleWorkbookAdd = (workbook: Workbook) => {
            const unitID = workbook.getUnitId();
            this._resourceManagerService.registerPluginResource<ISnapshot>(unitID, SHEET_NUMFMT_PLUGIN, {
                toJson: (unitID) => this._toJson(unitID),
                parseJson: (json) => this._parseJson(json),
                onChange: (unitID, value) => {
                    const { model, refModel } = value;

                    if (model) {
                        const parseModel = Object.keys(model).reduce((result, sheetId) => {
                            result.set(sheetId, new ObjectMatrix<INumfmtItem>(model[sheetId]));
                            return result;
                        }, new Map<string, ObjectMatrix<INumfmtItem>>());
                        this._numfmtModel.set(unitID, parseModel);
                    }
                    if (refModel) {
                        this._refAliasModel.set(
                            unitID,
                            new RefAlias<IRefItem, 'pattern' | 'i'>(refModel, ['pattern', 'i'])
                        );
                    }
                    this._modelReplace$.next(unitID);
                },
            });
        };
        this.disposeWithMe(toDisposable(this._univerInstanceService.sheetAdded$.subscribe(handleWorkbookAdd)));
        this.disposeWithMe(
            toDisposable(
                this._univerInstanceService.sheetDisposed$.subscribe((workbook) => {
                    const unitID = workbook.getUnitId();
                    const model = this._numfmtModel.get(unitID);
                    if (model) {
                        this._numfmtModel.delete(unitID);
                    }
                    const refModel = this._refAliasModel.get(unitID);
                    if (refModel) {
                        this._refAliasModel.delete(unitID);
                    }
                })
            )
        );
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        handleWorkbookAdd(workbook);
    }

    private _toJson(unitID: string) {
        const workbookModel = this._numfmtModel.get(unitID);
        const workbookRefModel = this._refAliasModel.get(unitID);
        if (!workbookModel || !workbookRefModel) {
            return '';
        }
        const model = [...workbookModel.keys()].reduce(
            (result, key) => {
                const object = workbookModel.get(key)!;
                result[key] = object.toJSON();
                return result;
            },
            {} as Record<string, ObjectMatrixPrimitiveType<INumfmtItem>>
        );
        // Filter the count equal 0 when snapshot save.
        // It is typically cleaned up once every 100 versions.

        const refModel = workbookRefModel.getValues().filter((item) => item.count > 0);
        const obj: ISnapshot = { model, refModel };
        return JSON.stringify(obj);
    }

    private _parseJson(json: string): ISnapshot {
        try {
            const obj = JSON.parse(json);
            return obj;
        } catch (err) {
            return { model: {}, refModel: [] };
        }
    }

    private _initCommands() {
        [SetNumfmtMutation].forEach((config) => this.disposeWithMe(this._commandService.registerCommand(config)));
    }

    private _setValue(workbookId: string, worksheetId: string, row: number, col: number, value: Nullable<INumfmtItem>) {
        let model = this.getModel(workbookId, worksheetId);
        if (!model) {
            const worksheetMap = this._numfmtModel.get(workbookId) || new Map<string, ObjectMatrix<INumfmtItem>>();
            const worksheetModel = worksheetMap.get(worksheetId) || new ObjectMatrix<INumfmtItem>();
            worksheetMap.set(worksheetId, worksheetModel);
            this._numfmtModel.set(workbookId, worksheetMap);
            model = worksheetModel;
        }
        if (value) {
            model.setValue(row, col, value);
        } else {
            model.realDeleteValue(row, col);
        }
    }

    private _groupByKey<T = Record<string, unknown>>(arr: T[], key: string, blankKey = '') {
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

    private _getUniqueRefId(unitID: string) {
        const refModel = this._refAliasModel.get(unitID);
        if (!refModel) {
            return '0';
        }
        const keyList = refModel.getKeyMap('i') as string[];
        const maxId = Math.max(...keyList.map((item) => Number(item || 0)), 0);
        return `${maxId + 1}`;
    }

    getValue(workbookId: string, worksheetId: string, row: number, col: number, model?: ObjectMatrix<INumfmtItem>) {
        const _model: Nullable<ObjectMatrix<INumfmtItem>> = model || this.getModel(workbookId, worksheetId);
        if (!_model) {
            return null;
        }
        const refMode = this._refAliasModel.get(workbookId);
        const value = _model.getValue(row, col);
        if (value && refMode) {
            const refValue = refMode.getValue(value?.i);
            if (!refValue) {
                this._logService.error('[Numfmt Service]:', 'RefAliasModel is not match model');
                return null;
            }
            return {
                pattern: refValue.pattern,
                type: refValue.type,
            };
        }
        return null;
    }

    setValues(
        workbookId: string,
        worksheetId: string,
        values: Array<{ row: number; col: number; pattern?: string; type: FormatType }>
    ) {
        const ___delete___ = '___delete___';
        const group = this._groupByKey(values, 'pattern', ___delete___);
        const model = this.getModel(workbookId, worksheetId);
        let refModel = this._refAliasModel.get(workbookId)!;
        if (!refModel) {
            refModel = new RefAlias<IRefItem, 'i' | 'pattern'>([], ['pattern', 'i']);
            this._refAliasModel.set(workbookId, refModel);
        }
        Object.keys(group).forEach((pattern: string) => {
            const values = group[pattern];
            const length = values.length;
            if (!length) {
                return;
            }
            let refPattern = refModel.getValue(pattern);
            if (pattern === ___delete___) {
                values.forEach((item) => {
                    const { row, col } = item;
                    const oldValue = this.getValue(workbookId, worksheetId, row, col, model);
                    if (oldValue && oldValue.pattern) {
                        const oldRefPattern = refModel.getValue(oldValue.pattern);
                        if (oldRefPattern) {
                            oldRefPattern.count--;
                            // if (oldRefPattern.count <= 0) {
                            // this._refAliasModel.deleteValue(oldValue.pattern);
                            // }
                        }
                    }
                    this._setValue(workbookId, worksheetId, row, col, null);
                });
                if (refPattern) {
                    const count = refPattern.count - length;
                    if (count > 0) {
                        refModel.setValue(pattern, 'count', count);
                    }
                    //else {
                    // this._refAliasModel.deleteValue(pattern);
                    // }
                }
            } else {
                if (!refPattern) {
                    refPattern = {
                        count: 0,
                        i: this._getUniqueRefId(workbookId),
                        pattern,
                        type: values[0].type,
                    };
                    refModel.addValue(refPattern);
                }
                values.forEach((item) => {
                    const { row, col } = item;
                    if (model) {
                        const oldValue = this.getValue(workbookId, worksheetId, row, col, model);
                        if (oldValue && oldValue.pattern) {
                            const oldRefPattern = refModel.getValue(oldValue.pattern);
                            if (oldRefPattern) {
                                oldRefPattern.count--;
                                // if (oldRefPattern.count <= 0) {
                                //     this._refAliasModel.deleteValue(oldValue.pattern);
                                // }
                            }
                        }
                    }
                    this._setValue(workbookId, worksheetId, row, col, {
                        i: refPattern!.i,
                    });
                    refPattern!.count++;
                });
            }
        });
    }

    getModel(workbookId: string, worksheetId: string) {
        const workbookModel = this._numfmtModel.get(workbookId);
        const sheetModel = workbookModel?.get(worksheetId);
        return sheetModel;
    }

    getRefModel(workbookId: string) {
        const refModel = this._refAliasModel.get(workbookId);
        return refModel;
    }
}
