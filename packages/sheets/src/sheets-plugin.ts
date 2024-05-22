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

import { ICommandService, IConfigService, LocaleService, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { BasicWorksheetController } from './controllers/basic-worksheet.controller';
import { CalculateResultApplyController } from './controllers/calculate-result-apply.controller';
import { FeatureCalculationController } from './controllers/feature-calculation.controller';
import { MergeCellController } from './controllers/merge-cell.controller';
import { BorderStyleManagerService } from './services/border-style-manager.service';
import { NumfmtService } from './services/numfmt/numfmt.service';
import { INumfmtService } from './services/numfmt/type';
import { SheetPermissionService } from './services/permission';
import { RefRangeService } from './services/ref-range/ref-range.service';
import { SelectionManagerService } from './services/selection-manager.service';
import { SheetInterceptorService } from './services/sheet-interceptor/sheet-interceptor.service';
import { DefinedNameDataController } from './controllers/defined-name-data.controller';
import { ISheetDrawingService, SheetDrawingService } from './services/sheet-drawing.service';
import { ONLY_REGISTER_FORMULA_RELATED_MUTATIONS_KEY } from './controllers/config';
import { SheetDrawingDataController } from './controllers/sheet-drawing-data.controller';

const PLUGIN_NAME = 'SHEET_PLUGIN';

export interface IUniverSheetsConfig {
    notExecuteFormula?: boolean;

    /**
     * Only register the mutations related to the formula calculation. Especially useful for the
     * web worker environment or server-side-calculation.
     */
    onlyRegisterFormulaRelatedMutations?: true;
}

/**
 * The main sheet base, construct the sheet container and layout, mount the rendering engine
 */
export class UniverSheetsPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private _config: IUniverSheetsConfig | undefined,
        @ICommandService private readonly _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
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

    private _initDependencies(sheetInjector: Injector) {
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
            [DefinedNameDataController],
        ];

        if (!this._config?.notExecuteFormula) {
            dependencies.push(
                [CalculateResultApplyController],
                [FeatureCalculationController],
            );
        } else {
            dependencies.push(
                [ISheetDrawingService, { useClass: SheetDrawingService }],
                [SheetDrawingDataController],
            );
        }

        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });
    }
}
