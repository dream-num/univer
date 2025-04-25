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

import type { ISheetDataValidationRule, Workbook } from '@univerjs/core';
import type { IAddSheetDataValidationCommandParams } from '@univerjs/sheets-data-validation';
import { ICommandService, Injector, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { checkRangesEditablePermission } from '@univerjs/sheets';
import { AddSheetDataValidationCommand, createDefaultNewRule, RemoveSheetAllDataValidationCommand, SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { useDependency, useObservable } from '@univerjs/ui';
import React, { useEffect, useState } from 'react';
import { DataValidationPanelService } from '../../../services/data-validation-panel.service';
import { DataValidationItem } from '../item';

export function DataValidationList(props: { workbook: Workbook }) {
    const sheetDataValidationModel = useDependency(SheetDataValidationModel);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const injector = useDependency(Injector);
    const dataValidationPanelService = useDependency(DataValidationPanelService);
    const localeService = useDependency(LocaleService);
    const [rules, setRules] = useState<ISheetDataValidationRule[]>([]);

    const { workbook } = props;
    const worksheet = useObservable(workbook.activeSheet$, undefined, true)!;
    const unitId = workbook.getUnitId();
    const subUnitId = worksheet?.getSheetId();

    useEffect(() => {
        setRules(sheetDataValidationModel.getRules(unitId, subUnitId));

        const subscription = sheetDataValidationModel.ruleChange$.subscribe((change) => {
            if (change.unitId === unitId && change.subUnitId === subUnitId) {
                setRules(sheetDataValidationModel.getRules(unitId, subUnitId));
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [unitId, subUnitId, sheetDataValidationModel]);

    const handleAddRule = async () => {
        const rule = createDefaultNewRule(injector);
        const params: IAddSheetDataValidationCommandParams = {
            unitId,
            subUnitId,
            rule,
        };
        await commandService.executeCommand(AddSheetDataValidationCommand.id, params);
        dataValidationPanelService.setActiveRule({
            unitId,
            subUnitId,
            rule,
        });
    };

    const handleRemoveAll = () => {
        commandService.executeCommand(RemoveSheetAllDataValidationCommand.id, {
            unitId,
            subUnitId,
        });
    };

    const getDvRulesByPermissionCorrect = (rules: ISheetDataValidationRule[]) => {
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const rulesByPermissionCheck = rules.map((rule) => {
            const hasPermission = checkRangesEditablePermission(injector, unitId, subUnitId, rule.ranges);
            if (hasPermission) {
                return { ...rule };
            } else {
                return { ...rule, disable: true };
            }
        });

        return rulesByPermissionCheck;
    };

    const rulesByPermissionCheck: (ISheetDataValidationRule & { disable?: boolean })[] = getDvRulesByPermissionCorrect(rules);
    const hasDisableRule = rulesByPermissionCheck?.some((rule) => rule.disable);

    return (
        <div className="univer-pb-4">
            {rulesByPermissionCheck?.map((rule) => (
                <DataValidationItem
                    unitId={unitId}
                    subUnitId={subUnitId}
                    onClick={() => {
                        if (rule.disable) return;
                        dataValidationPanelService.setActiveRule({
                            unitId,
                            subUnitId,
                            rule,
                        });
                    }}
                    rule={rule}
                    key={rule.uid}
                    disable={rule.disable ?? false}
                />
            ))}
            <div className="univer-mt-4 univer-flex univer-flex-row univer-justify-end univer-gap-2">

                {(rules.length && !hasDisableRule)
                    ? (
                        <Button onClick={handleRemoveAll}>
                            {localeService.t('dataValidation.panel.removeAll')}
                        </Button>
                    )
                    : null}
                <Button variant="primary" onClick={handleAddRule}>
                    {localeService.t('dataValidation.panel.add')}
                </Button>
            </div>
        </div>
    );
};
