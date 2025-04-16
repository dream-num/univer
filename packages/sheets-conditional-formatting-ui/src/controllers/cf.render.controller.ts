/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICellDataForSheetInterceptor, Workbook } from '@univerjs/core';
import type { IConditionalFormattingCellData, IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';
import { Disposable, Inject, InterceptorEffectEnum, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { ConditionalFormattingRuleModel, ConditionalFormattingService, ConditionalFormattingViewModel, DEFAULT_PADDING, DEFAULT_WIDTH } from '@univerjs/sheets-conditional-formatting';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { merge } from 'rxjs';
import { bufferTime, filter } from 'rxjs/operators';

export class SheetsCfRenderController extends Disposable {
    /**
     * When a set operation is triggered multiple times over a short period of time, it may result in some callbacks not being disposed,and caused a render cache exception.
     * The solution here is to store all the asynchronous tasks and focus on processing after the last callback
     */
    private _ruleChangeCacheMap: Map<string, Array<{ oldRule: IConditionFormattingRule; rule: IConditionFormattingRule; dispose: () => boolean }>> = new Map();
    constructor(@Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService, @Inject(ConditionalFormattingService) private _conditionalFormattingService: ConditionalFormattingService, @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService, @Inject(IRenderManagerService) private _renderManagerService: IRenderManagerService, @Inject(ConditionalFormattingViewModel) private _conditionalFormattingViewModel: ConditionalFormattingViewModel, @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel) {
        super();

        this._initViewModelInterceptor();
        this._initSkeleton();
        this.disposeWithMe(() => {
            this._ruleChangeCacheMap.clear();
        });
    }

    private _markDirtySkeleton() {
        const unitId = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
        this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).reCalculate();
        this._renderManagerService.getRenderById(unitId)?.mainComponent?.makeDirty();
    }

    private _initSkeleton() {
        this.disposeWithMe(merge(this._conditionalFormattingRuleModel.$ruleChange, this._conditionalFormattingViewModel.markDirty$)
            .pipe(
                bufferTime(16),
                filter((v) => !!v.length),
                filter((v) => {
                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                    if (!workbook) return false;

                    const worksheet = workbook.getActiveSheet();
                    if (!worksheet) return false;

                    return v.filter((item) => item.unitId === workbook.getUnitId() && item.subUnitId === worksheet.getSheetId()).length > 0;
                })
            ).subscribe(() => this._markDirtySkeleton()));
    }

    private _initViewModelInterceptor() {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            effect: InterceptorEffectEnum.Style,
            handler: (cell, context, next) => {
                const result = this._conditionalFormattingService.composeStyle(context.unitId, context.subUnitId, context.row, context.col);
                if (!result) {
                    return next(cell);
                }
                const styleMap = context.workbook.getStyles();
                const defaultStyle = (typeof cell?.s === 'string' ? styleMap.get(cell?.s) : cell?.s) || {};
                const s = { ...defaultStyle };
                const cloneCell = { ...cell, s } as IConditionalFormattingCellData & ICellDataForSheetInterceptor;
                if (result.style) {
                    Object.assign(s, result.style);
                }
                if (!cloneCell.fontRenderExtension) {
                    cloneCell.fontRenderExtension = {};
                    if (result.isShowValue !== undefined) {
                        cloneCell.fontRenderExtension.isSkip = !result.isShowValue;
                    }
                }
                if (result.dataBar) {
                    cloneCell.dataBar = result.dataBar;
                }
                if (result.iconSet) {
                    cloneCell.iconSet = result.iconSet;
                    cloneCell.fontRenderExtension.leftOffset = DEFAULT_PADDING + DEFAULT_WIDTH;
                }

                return next(cloneCell);
            },
            priority: 10,
        }));
    }
}
