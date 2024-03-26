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

import { ICommandService, LocaleService, Plugin, PluginType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { BasicWorksheetController } from './controllers/basic-worksheet.controller';
import { CalculateResultApplyController } from './controllers/calculate-result-apply.controller';
import { FeatureCalculationController } from './controllers/feature-calculation.controller';
import { MergeCellController } from './controllers/merge-cell.controller';
import { zhCN } from './locale';
import { BorderStyleManagerService } from './services/border-style-manager.service';
import { NumfmtService } from './services/numfmt/numfmt.service';
import { INumfmtService } from './services/numfmt/type';
import { SheetPermissionService } from './services/permission';
import { RefRangeService } from './services/ref-range/ref-range.service';
import { SelectionManagerService } from './services/selection-manager.service';
import { SheetInterceptorService } from './services/sheet-interceptor/sheet-interceptor.service';

const PLUGIN_NAME = 'sheet';

export interface IUniverSheetsConfig {
    notExecuteFormula?: boolean;
}

/**
 * The main sheet base, construct the sheet container and layout, mount the rendering engine
 */
export class UniverSheetsPlugin extends Plugin {
    static override type = PluginType.Sheet;

    constructor(
        private _config: IUniverSheetsConfig,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super(PLUGIN_NAME);

        this._initializeDependencies(_injector);
    }

    override onRendered(): void {
        this._localeService.load({
            zhCN,
        });
    }

    private _initializeDependencies(sheetInjector: Injector) {
        const dependencies: Dependency[] = [
            // services
            [BorderStyleManagerService],
            [SelectionManagerService],
            [RefRangeService],
            [SheetPermissionService],
            [INumfmtService, { useClass: NumfmtService }],
            [SheetInterceptorService],

            // controllers
            [BasicWorksheetController],
            [MergeCellController],
        ];

        if (!this._config?.notExecuteFormula) {
            dependencies.push([CalculateResultApplyController], [FeatureCalculationController]);
        }

        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });
    }
}
