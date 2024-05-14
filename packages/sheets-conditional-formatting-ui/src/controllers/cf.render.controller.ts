/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Workbook } from '@univerjs/core';
import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { Inject } from '@wendellhu/redi';
import { bufferTime, filter } from 'rxjs/operators';
import type { ISheetFontRenderExtension } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';

import { ConditionalFormattingRuleModel, ConditionalFormattingService, ConditionalFormattingViewModel, DEFAULT_PADDING, DEFAULT_WIDTH } from '@univerjs/sheets-conditional-formatting';

import type { IConditionalFormattingCellData } from '@univerjs/sheets-conditional-formatting';

/**
 * @todo RenderUnit
 */
@OnLifecycle(LifecycleStages.Rendered, RenderController)
export class RenderController extends Disposable {
    constructor(@Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ConditionalFormattingService) private _conditionalFormattingService: ConditionalFormattingService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(IRenderManagerService) private _renderManagerService: IRenderManagerService,
        @Inject(ConditionalFormattingViewModel) private _conditionalFormattingViewModel: ConditionalFormattingViewModel,
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService) {
        super();
        this._initViewModelInterceptor();
        this._initSkeleton();
    }

    _initSkeleton() {
        const markDirtySkeleton = () => {
            this._sheetSkeletonManagerService.reCalculate();
            const unitId = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
            this._renderManagerService.getRenderById(unitId)?.mainComponent?.makeDirty();
        };

        // After the conditional formatting is marked dirty to drive a rendering, to trigger the window within the conditional formatting recalculation
        this.disposeWithMe(this._conditionalFormattingViewModel.markDirty$.pipe(bufferTime(16), filter((v) => {
            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            if (!workbook) return false;

            const worksheet = workbook.getActiveSheet();
            return v.filter((item) => item.unitId === workbook.getUnitId() && item.subUnitId === worksheet.getSheetId()).length > 0;
        })).subscribe(markDirtySkeleton));

        // Sort and delete does not mark dirty.
        this.disposeWithMe(this._conditionalFormattingRuleModel.$ruleChange.pipe(bufferTime(16), filter((v) => {
            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            if (!workbook) return false;

            const worksheet = workbook.getActiveSheet();
            return v.filter((item) => ['sort', 'delete'].includes(item.type) && item.unitId === workbook.getUnitId() && item.subUnitId === worksheet.getSheetId()).length > 0;
        })).subscribe(markDirtySkeleton));

        // Once the calculation is complete, a view update is triggered
        // This rendering does not trigger conditional formatting recalculation,because the rule is not mark dirty
        this.disposeWithMe(this._conditionalFormattingService.ruleComputeStatus$.pipe(bufferTime(16), filter((v) => {
            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            if (!workbook) return false;

            const worksheet = workbook.getActiveSheet();
            return v.filter((item) => item.unitId === workbook.getUnitId() && item.subUnitId === worksheet.getSheetId()).length > 0;
        })).subscribe(markDirtySkeleton));
    }

    _initViewModelInterceptor() {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            handler: (cell, context, next) => {
                const result = this._conditionalFormattingService.composeStyle(context.unitId, context.subUnitId, context.row, context.col);
                if (!result) {
                    return next(cell);
                }
                const styleMap = context.workbook.getStyles();
                const defaultStyle = (typeof cell?.s === 'string' ? styleMap.get(cell?.s) : cell?.s) || {};
                const s = { ...defaultStyle };
                const cloneCell = { ...cell, s } as IConditionalFormattingCellData & ISheetFontRenderExtension;
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
        }));
    }
}
