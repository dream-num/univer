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

import type { DependencyOverride } from '@univerjs/core';
import { ICommandService, LocaleService, mergeOverrideWithDependencies, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { BasicWorksheetController } from './controllers/basic-worksheet.controller';
import { CalculateResultApplyController } from './controllers/calculate-result-apply.controller';
import { FeatureCalculationController } from './controllers/feature-calculation.controller';
import { MergeCellController } from './controllers/merge-cell.controller';
import { BorderStyleManagerService } from './services/border-style-manager.service';
import { NumfmtService } from './services/numfmt/numfmt.service';
import { INumfmtService } from './services/numfmt/type';
import { WorkbookPermissionService } from './services/permission/workbook-permission/workbook-permission.service';

import { RefRangeService } from './services/ref-range/ref-range.service';
import { SelectionManagerService } from './services/selection-manager.service';
import { SheetInterceptorService } from './services/sheet-interceptor/sheet-interceptor.service';
import { DefinedNameDataController } from './controllers/defined-name-data.controller';
import { WorksheetPermissionService, WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from './services/permission/worksheet-permission';
import { RangeProtectionRenderModel } from './model/range-protection-render.model';
import { RangeProtectionRuleModel } from './model/range-protection-rule.model';

import { RangeProtectionRefRangeService } from './services/permission/range-permission/range-protection.ref-range';
import { RangeProtectionService } from './services/permission/range-permission/range-protection.service';

const PLUGIN_NAME = 'SHEET_PLUGIN';

export interface IUniverSheetsConfig {
    notExecuteFormula?: boolean;
    override?: DependencyOverride;
}

/**
 * The main sheet base, construct the sheet container and layout, mount the rendering engine
 */
export class UniverSheetsPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private _config: IUniverSheetsConfig,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super();

        this._initializeDependencies(_injector);
    }

    override onRendered(): void {
    }

    private _initializeDependencies(sheetInjector: Injector) {
        const dependencies: Dependency[] = [
            // services
            [BorderStyleManagerService],
            [SelectionManagerService],
            [RefRangeService],
            [WorkbookPermissionService],
            [INumfmtService, { useClass: NumfmtService }],
            [SheetInterceptorService],

            // controllers
            [BasicWorksheetController],
            [MergeCellController],
            [DefinedNameDataController],

            // permission
            [WorksheetPermissionService],
            [WorksheetProtectionRuleModel],
            [WorksheetProtectionPointModel],

            // range protection
            [RangeProtectionRenderModel],
            [RangeProtectionRuleModel],
            [RangeProtectionRefRangeService],
            [RangeProtectionService],
        ];

        if (!this._config?.notExecuteFormula) {
            dependencies.push(
                [CalculateResultApplyController],
                [FeatureCalculationController]
            );
        }

        mergeOverrideWithDependencies(dependencies, this._config?.override).forEach((d) => {
            sheetInjector.add(d);
        });
    }
}
