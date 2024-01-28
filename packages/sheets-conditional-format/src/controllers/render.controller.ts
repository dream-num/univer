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

import { ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { Inject } from '@wendellhu/redi';
import { IRenderManagerService } from '@univerjs/engine-render';

import { ConditionalFormatService } from '../services/conditional-format.service';
import { addCfRule } from '../commands/commands/command';

@OnLifecycle(LifecycleStages.Rendered, RenderController)
export class RenderController {
    constructor(@Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ConditionalFormatService) private _conditionalFormatService: ConditionalFormatService,
        @Inject(ICommandService) private _commandService: ICommandService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(IRenderManagerService) private _renderManagerService: IRenderManagerService,

        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService) {
        window.commandService = _commandService;
        this._initHighlightCell();
        this._initSkeleton();
    }

    _initSkeleton() {
        this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === addCfRule.id) {
                this._sheetSkeletonManagerService.reCalculate();
                const unitId = this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
                this._renderManagerService.getRenderById(unitId)?.mainComponent?.makeDirty();
            }
        });
    }

    _initHighlightCell() {
        this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, { priority: 99, handler: (cell, context, next) => {
            const result = this._conditionalFormatService.composeStyle(context.unitId, context.subUnitId, context.row, context.col);

            if (!result) {
                return next(cell);
            }
            const style = result.style;
            if (style) {
                const s = (typeof cell?.s === 'object' && cell.s !== null) ? { ...cell.s } : { ...style };
                return next({ ...cell, s });
            }

            return next(cell);
        },
        });
    }
}
