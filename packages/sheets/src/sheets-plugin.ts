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

import type { Dependency, DependencyOverride } from '@univerjs/core';
import { DependentOn, IConfigService, Inject, Injector, mergeOverrideWithDependencies, Plugin, UniverInstanceType } from '@univerjs/core';

import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { BasicWorksheetController } from './controllers/basic-worksheet.controller';
import { CalculateResultApplyController } from './controllers/calculate-result-apply.controller';
import { MergeCellController } from './controllers/merge-cell.controller';
import { BorderStyleManagerService } from './services/border-style-manager.service';
import { NumfmtService } from './services/numfmt/numfmt.service';
import { INumfmtService } from './services/numfmt/type';
import { WorkbookPermissionService } from './services/permission/workbook-permission/workbook-permission.service';

import { RefRangeService } from './services/ref-range/ref-range.service';
import { SheetInterceptorService } from './services/sheet-interceptor/sheet-interceptor.service';
import { DefinedNameDataController } from './controllers/defined-name-data.controller';
import { WorksheetPermissionService, WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from './services/permission/worksheet-permission';
import { RangeProtectionRenderModel } from './model/range-protection-render.model';
import { RangeProtectionRuleModel } from './model/range-protection-rule.model';

import { RangeProtectionRefRangeService } from './services/permission/range-permission/range-protection.ref-range';
import { RangeProtectionService } from './services/permission/range-permission/range-protection.service';
import { ONLY_REGISTER_FORMULA_RELATED_MUTATIONS_KEY } from './controllers/config';
import { NumberCellDisplayController } from './controllers/number-cell.controller';
import { SheetsSelectionsService } from './services/selections/selection-manager.service';

const PLUGIN_NAME = 'SHEET_PLUGIN';

export interface IUniverSheetsConfig {
    notExecuteFormula?: boolean;
    override?: DependencyOverride;

    /**
     * Only register the mutations related to the formula calculation. Especially useful for the
     * web worker environment or server-side-calculation.
     */
    onlyRegisterFormulaRelatedMutations?: true;
}

@DependentOn(UniverFormulaEnginePlugin)
export class UniverSheetsPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private _config: IUniverSheetsConfig | undefined,
        @IConfigService private readonly _configService: IConfigService,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super();

        this._initConfig();
        this._initDependencies(_injector);
    }

    override onRendered(): void {
    }

    private _initConfig(): void {
        if (this._config?.onlyRegisterFormulaRelatedMutations) {
            this._configService.setConfig(ONLY_REGISTER_FORMULA_RELATED_MUTATIONS_KEY, true);
        }
    }

    private _initDependencies(sheetInjector: Injector): void {
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
            [RangeProtectionRefRangeService],
            [RangeProtectionService],
        ];

        if (!this._config?.notExecuteFormula) {
            dependencies.push([CalculateResultApplyController]);
        }

        mergeOverrideWithDependencies(dependencies, this._config?.override).forEach((d) => {
            sheetInjector.add(d);
        });

        this._injector.get(SheetInterceptorService);
        this._injector.get(RangeProtectionService);
    }
}
