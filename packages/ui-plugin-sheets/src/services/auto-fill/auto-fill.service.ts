import { SelectionManagerService } from '@univerjs/base-sheets';
import {
    Disposable,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    SheetInterceptorService,
} from '@univerjs/core';
import { createIdentifier, Inject } from '@wendellhu/redi';

import { chnNumberRule, chnWeek2Rule, chnWeek3Rule, extendNumberRule, numberRule, otherRule } from './rules';
import { APPLY_TYPE, IAutoFillRule } from './type';

export interface IAutoFillService {
    getRules(): IAutoFillRule[];
    getApplyType(): APPLY_TYPE;
    isFillingStyle(): boolean;
}
@OnLifecycle(LifecycleStages.Rendered, AutoFillService)
export class AutoFillService extends Disposable implements IAutoFillService {
    private _rules: IAutoFillRule[];
    private _applyType: APPLY_TYPE;
    private _isFillingStyle: boolean;
    private _allApplyType: APPLY_TYPE[];
    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SelectionManagerService) private _selectionManagerService: SelectionManagerService
    ) {
        super();
        this._init();
    }

    private _init() {
        this._rules = [numberRule, extendNumberRule, chnNumberRule, chnWeek2Rule, chnWeek3Rule, otherRule];
        this._applyType = APPLY_TYPE.SERIES;
        this._isFillingStyle = true;
        this._allApplyType = [APPLY_TYPE.COPY, APPLY_TYPE.SERIES, APPLY_TYPE.ONLY_FORMAT];
    }

    getRules() {
        return this._rules;
    }

    getApplyType() {
        return this._applyType;
    }

    isFillingStyle(): boolean {
        return this._isFillingStyle;
    }
}

export const IAutoFillService = createIdentifier<AutoFillService>('univer.auto-fill-service');
