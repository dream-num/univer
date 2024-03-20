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

import { IUniverInstanceService } from '@univerjs/core';
import { DataValidatorRegistryService } from '@univerjs/data-validation';
import { DropdownManagerService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { Inject } from '@wendellhu/redi';

export class DataValidationDropdownService {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidatorRegistryService) private readonly _dataValidatorRegistryService: DataValidatorRegistryService,
        @Inject(DropdownManagerService) private readonly _dropdownManagerService: DropdownManagerService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {}

    showDropdown(unitId: string, subUnitId: string, row: number, col: number, onHide?: () => void) {
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) {
            return;
        }
        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return;
        }

        const cell = worksheet.getCell(row, col);
        const rule = cell?.dataValidation?.rule;
        const skeleton = this._sheetSkeletonManagerService.getOrCreateSkeleton({
            unitId,
            sheetId: subUnitId,
        });

        if (!skeleton) {
            return;
        }
        if (!rule) {
            return;
        }
        const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
        if (!validator || !validator.dropdown) {
            this._dropdownManagerService.hideDropdown();
            return;
        }

        this._dropdownManagerService.showDropdown({
            position: state.position,
            location: {
                workbook,
                worksheet,
                row,
                col,
                unitId,
                subUnitId,
            },
            componentKey: validator.dropdown,
            width: 200,
            height: 200,
            onHide: () => {

            },
        });
    }
}
