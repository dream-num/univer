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

import React, { useEffect, useState } from 'react';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { ISheetDataValidationRule } from '@univerjs/core';
import { DataValidationOperator, DataValidationType, ICommandService, IUniverInstanceService } from '@univerjs/core';
import type { IAddDataValidationCommandParams } from '@univerjs/data-validation';
import { AddDataValidationCommand, DataValidationModel, RemoveAllDataValidationCommand } from '@univerjs/data-validation';
import { Button } from '@univerjs/design';
import { SelectionManagerService } from '@univerjs/sheets';
import { DataValidationDetail } from './DataValidationDetail';

export const DataValidationPanel = () => {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const dataValidationModel = useDependency(DataValidationModel);
    const commandService = useDependency(ICommandService);
    const selectionManagerService = useDependency(SelectionManagerService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();
    const worksheet = workbook.getActiveSheet();
    const unitId = workbook.getUnitId();
    const subUnitId = worksheet.getSheetId();
    const manager = dataValidationModel.getOrCreateManager(unitId, subUnitId);
    const [rules, setRules] = useState<ISheetDataValidationRule[]>(manager.getDataValidations());

    useEffect(() => {
        const subscription = manager.dataValidations$.subscribe((currentRules) => {
            setRules([...currentRules]);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [manager.dataValidations$]);

    const handleAddRule = () => {
        const currentRanges = selectionManagerService.getSelectionRanges();
        const params: IAddDataValidationCommandParams = {
            unitId,
            subUnitId,
            rule: {
                type: DataValidationType.DECIMAL,
                operator: DataValidationOperator.EQUAL,
                formula1: '100',
                range: currentRanges ? currentRanges[0] : { startColumn: 0, endColumn: 0, startRow: 0, endRow: 0 },
            },
        };
        commandService.executeCommand(AddDataValidationCommand.id, params);
    };

    const handleRemoveAll = () => {
        commandService.executeCommand(RemoveAllDataValidationCommand.id);
    };

    return (
        <div>
            DataValidationPanel
            {rules.map((rule) => <DataValidationDetail rule={rule} key={rule.uid} />)}
            <div>
                <Button type="primary" onClick={handleRemoveAll}>
                    Remove All
                </Button>
                <Button onClick={handleAddRule}>
                    Add Rule
                </Button>
            </div>
        </div>
    );
};
