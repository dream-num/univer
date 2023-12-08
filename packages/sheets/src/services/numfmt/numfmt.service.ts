import type { IRange, Nullable, ObjectMatrixPrimitiveType, Workbook } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    ILogService,
    IResourceManagerService,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    Range,
    RefAlias,
    toDisposable,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { Subject } from 'rxjs';

import type { FormatType, INumfmtItem, INumfmtService, IRefItem, ISnapshot } from './type';

const SHEET_NUMFMT_PLUGIN = 'SHEET_NUMFMT_PLUGIN';
@OnLifecycle(LifecycleStages.Starting, NumfmtService)
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
            const size = model.getSizeOf();
            if (!size) {
                const workbookModel = this._numfmtModel.get(workbookId);
                workbookModel?.delete(worksheetId);
            }
        }
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

    deleteValues(workbookId: string, worksheetId: string, values: IRange[]) {
        let refModel = this._refAliasModel.get(workbookId)!;
        const model = this.getModel(workbookId, worksheetId);
        if (!refModel) {
            refModel = new RefAlias<IRefItem, 'i' | 'pattern'>([], ['pattern', 'i']);
            this._refAliasModel.set(workbookId, refModel);
        }
        values.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const oldValue = this.getValue(workbookId, worksheetId, row, col, model);
                if (oldValue && oldValue.pattern) {
                    const oldRefPattern = refModel.getValue(oldValue.pattern);
                    if (oldRefPattern) {
                        oldRefPattern.count--;
                    }
                }
                this._setValue(workbookId, worksheetId, row, col, null);
            });
        });
    }

    setValues(
        workbookId: string,
        worksheetId: string,
        values: Array<{ ranges: IRange[]; pattern: string; type: FormatType }>
    ) {
        const model = this.getModel(workbookId, worksheetId);
        let refModel = this._refAliasModel.get(workbookId)!;
        if (!refModel) {
            refModel = new RefAlias<IRefItem, 'i' | 'pattern'>([], ['pattern', 'i']);
            this._refAliasModel.set(workbookId, refModel);
        }
        values.forEach((value) => {
            let refPattern = refModel.getValue(value.pattern);
            if (!refPattern) {
                refPattern = {
                    count: 0,
                    i: this._getUniqueRefId(workbookId),
                    pattern: value.pattern,
                    type: values[0].type,
                };
                refModel.addValue(refPattern);
            }

            value.ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    if (model) {
                        const oldValue = this.getValue(workbookId, worksheetId, row, col, model);
                        if (oldValue && oldValue.pattern) {
                            const oldRefPattern = refModel.getValue(oldValue.pattern);
                            if (oldRefPattern) {
                                oldRefPattern.count--;
                            }
                        }
                    }
                    this._setValue(workbookId, worksheetId, row, col, {
                        i: refPattern!.i,
                    });
                    refPattern!.count++;
                });
            });
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
