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

import type { Dependency } from '@univerjs/core';
import type { IUniverSheetsConfig } from './controllers/config.schema';
import { AUTO_HEIGHT_FOR_MERGED_CELLS, DependentOn, IConfigService, Inject, Injector, IS_ROW_STYLE_PRECEDE_COLUMN_STYLE, merge, mergeOverrideWithDependencies, Plugin, registerDependencies, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { BasicWorksheetController } from './controllers/basic-worksheet.controller';
import { CalculateResultApplyController } from './controllers/calculate-result-apply.controller';
import { ONLY_REGISTER_FORMULA_RELATED_MUTATIONS_KEY } from './controllers/config';
import { defaultPluginConfig, SHEETS_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { DefinedNameDataController } from './controllers/defined-name-data.controller';
import { MergeCellController } from './controllers/merge-cell.controller';
import { NumberCellDisplayController } from './controllers/number-cell.controller';
import { SheetPermissionCheckController } from './controllers/permission/sheet-permission-check.controller';
import { SheetPermissionInitController } from './controllers/permission/sheet-permission-init.controller';
import { SheetPermissionViewModelController } from './controllers/permission/sheet-permission-view-model.controller';

import { RangeProtectionRenderModel } from './model/range-protection-render.model';
import { RangeProtectionRuleModel } from './model/range-protection-rule.model';
import { RangeProtectionCache } from './model/range-protection.cache';

import { SheetRangeThemeModel } from './model/range-theme-model';
import { BorderStyleManagerService } from './services/border-style-manager.service';
import { ExclusiveRangeService, IExclusiveRangeService } from './services/exclusive-range/exclusive-range-service';
import { NumfmtService } from './services/numfmt/numfmt.service';
import { INumfmtService } from './services/numfmt/type';
import { RangeProtectionRefRangeService } from './services/permission/range-permission/range-protection.ref-range';
import { RangeProtectionService } from './services/permission/range-permission/range-protection.service';
import { WorkbookPermissionService } from './services/permission/workbook-permission/workbook-permission.service';
import { WorksheetPermissionService, WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from './services/permission/worksheet-permission';
import { SheetRangeThemeService } from './services/range-theme-service';
import { RefRangeService } from './services/ref-range/ref-range.service';
import { SheetsSelectionsService } from './services/selections/selection.service';
import { SheetInterceptorService } from './services/sheet-interceptor/sheet-interceptor.service';
import { SheetSkeletonService } from './skeleton/skeleton.service';

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
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(SHEETS_PLUGIN_CONFIG_KEY, rest);

        this._initConfig();
        this._initDependencies();
    }

    private _initConfig(): void {
        if (this._config?.onlyRegisterFormulaRelatedMutations) {
            this._configService.setConfig(ONLY_REGISTER_FORMULA_RELATED_MUTATIONS_KEY, true);
        }
        if (this._config?.isRowStylePrecedeColumnStyle) {
            this._configService.setConfig(IS_ROW_STYLE_PRECEDE_COLUMN_STYLE, true);
        }
        if (this._config?.autoHeightForMergedCells) {
            this._configService.setConfig(AUTO_HEIGHT_FOR_MERGED_CELLS, true);
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
            [SheetRangeThemeService],
            [SheetSkeletonService],

            // controllers
            [BasicWorksheetController],
            [MergeCellController],
            [NumberCellDisplayController],
            [DefinedNameDataController],

            // permission
            [WorksheetPermissionService],
            [WorksheetProtectionRuleModel],
            [WorksheetProtectionPointModel],
            [SheetPermissionViewModelController],
            [SheetPermissionInitController],
            [SheetPermissionCheckController],

            // range theme
            [SheetRangeThemeModel],

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

        registerDependencies(this._injector, mergeOverrideWithDependencies(dependencies, this._config.override));

        touchDependencies(this._injector, [
            [SheetInterceptorService],
            [RangeProtectionService],
            [IExclusiveRangeService],
            [SheetPermissionInitController],
        ]);
    }

    override onStarting(): void {
        touchDependencies(this._injector, [
            [BasicWorksheetController],
            [MergeCellController],
            [WorkbookPermissionService],
            [WorksheetPermissionService],
            [SheetPermissionViewModelController],
            [SheetSkeletonService],
        ]);
    }

    override onRendered(): void {
        touchDependencies(this._injector, [
            [INumfmtService],
        ]);
    }

    override onReady(): void {
        touchDependencies(this._injector, [
            [CalculateResultApplyController],
            [DefinedNameDataController],
            [SheetRangeThemeModel],
            [NumberCellDisplayController],
            [RangeProtectionRenderModel],
            [RangeProtectionRefRangeService],
            [RefRangeService],
            [SheetPermissionCheckController],
        ]);
    }
}
