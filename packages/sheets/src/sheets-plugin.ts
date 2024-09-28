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

import type { Dependency } from '@univerjs/core';
import type { IUniverSheetsConfig } from './controllers/config.schema';

import { DependentOn, IConfigService, Inject, Injector, mergeOverrideWithDependencies, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { BasicWorksheetController } from './controllers/basic-worksheet.controller';
import { CalculateResultApplyController } from './controllers/calculate-result-apply.controller';
import { ONLY_REGISTER_FORMULA_RELATED_MUTATIONS_KEY } from './controllers/config';
import { defaultPluginConfig, PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { DefinedNameDataController } from './controllers/defined-name-data.controller';
import { MergeCellController } from './controllers/merge-cell.controller';

import { NumberCellDisplayController } from './controllers/number-cell.controller';
import { RangeProtectionCache } from './model/range-protection.cache';
import { RangeProtectionRenderModel } from './model/range-protection-render.model';
import { RangeProtectionRuleModel } from './model/range-protection-rule.model';
import { BorderStyleManagerService } from './services/border-style-manager.service';
import { ExclusiveRangeService, IExclusiveRangeService } from './services/exclusive-range/exclusive-range-service';

import { NumfmtService } from './services/numfmt/numfmt.service';
import { INumfmtService } from './services/numfmt/type';
import { RangeProtectionRefRangeService } from './services/permission/range-permission/range-protection.ref-range';
import { RangeProtectionService } from './services/permission/range-permission/range-protection.service';
import { WorkbookPermissionService } from './services/permission/workbook-permission/workbook-permission.service';
import { WorksheetPermissionService, WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from './services/permission/worksheet-permission';
import { RefRangeService } from './services/ref-range/ref-range.service';
import { SheetsSelectionsService } from './services/selections/selection-manager.service';
import { SheetInterceptorService } from './services/sheet-interceptor/sheet-interceptor.service';

const PLUGIN_NAME = 'SHEET_PLUGIN';

@DependentOn(UniverFormulaEnginePlugin)
export class UniverSheetsPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsConfig> = defaultPluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = this._config;
        this._configService.setConfig(PLUGIN_CONFIG_KEY, rest);

        this._initConfig();
        this._initDependencies();
    }

    private _initConfig(): void {
        if (this._config?.onlyRegisterFormulaRelatedMutations) {
            this._configService.setConfig(ONLY_REGISTER_FORMULA_RELATED_MUTATIONS_KEY, true);
        }
    }

    private _initDependencies(): void {
        const dependencies: Dependency[] = [
            // services
            [BorderStyleManagerService],
            [SheetsSelectionsService],
            [RefRangeService],
            [WorkbookPermissionService],
            [INumfmtService, { useClass: NumfmtService }],
            [SheetInterceptorService],

            // controllers
            [BasicWorksheetController],
            [MergeCellController],
            [NumberCellDisplayController],
            [DefinedNameDataController],

            // permission
            [WorksheetPermissionService],
            [WorksheetProtectionRuleModel],
            [WorksheetProtectionPointModel],

            // range protection
            [RangeProtectionRenderModel],
            [RangeProtectionRuleModel],
            [RangeProtectionCache],
            [RangeProtectionRefRangeService],
            [RangeProtectionService],
            [IExclusiveRangeService, {
                useClass: ExclusiveRangeService,
                deps: [SheetsSelectionsService],
            }],
        ];

        if (!this._config?.notExecuteFormula) {
            dependencies.push([CalculateResultApplyController]);
        }

        mergeOverrideWithDependencies(dependencies, this._config?.override).forEach((d) => {
            this._injector.add(d);
        });

        this._injector.get(SheetInterceptorService);
        this._injector.get(RangeProtectionService);
        this._injector.get(IExclusiveRangeService);
    }

    override onStarting(_injector?: Injector): void {
        this._injector.get(MergeCellController);
    }
}
