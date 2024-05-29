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
import { Injector } from '@wendellhu/redi';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { ISheetDataValidationRule, Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { createDefaultNewRule, DataValidationModel, RemoveAllDataValidationCommand } from '@univerjs/data-validation';
import { Button } from '@univerjs/design';
import { useObservable } from '@univerjs/ui';
import { DataValidationItem } from '../item';
import type { IAddSheetDataValidationCommandParams } from '../../commands/commands/data-validation.command';
import { AddSheetDataValidationCommand } from '../../commands/commands/data-validation.command';
import { DataValidationPanelService } from '../../services/data-validation-panel.service';
import { DATA_VALIDATION_PERMISSION_CHECK, DataValidationController } from '../../controllers/dv.controller';
import styles from './index.module.less';

export function DataValidationList() {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = useObservable(
        () => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET),
        undefined,
        undefined,
        []
    );

    if (!workbook) return null;
    return <DataValidationListWithWorkbook workbook={workbook} />;
}

function DataValidationListWithWorkbook(props: { workbook: Workbook }) {
    const dataValidationModel = useDependency(DataValidationModel);
    const commandService = useDependency(ICommandService);
    const injector = useDependency(Injector);
    const dataValidationPanelService = useDependency(DataValidationPanelService);
    const dataValidationController = useDependency(DataValidationController);

    const localeService = useDependency(LocaleService);
    const [rules, setRules] = useState<ISheetDataValidationRule[]>([]);

    const { workbook } = props;
    const worksheet = useObservable(workbook.activeSheet$, undefined, true)!;
    const unitId = workbook.getUnitId();
    const subUnitId = worksheet?.getSheetId();
    const manager = dataValidationModel.ensureManager(unitId, subUnitId);

    useEffect(() => {
        setRules(manager.getDataValidations());

        const subscription = manager.dataValidations$.subscribe((currentRules) => {
            setRules([...currentRules]);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [manager]);

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
        commandService.executeCommand(RemoveAllDataValidationCommand.id, {
            unitId,
            subUnitId,
        });
    };

    const rulesByPermissionCheck = dataValidationController.interceptor.fetchThroughInterceptors(DATA_VALIDATION_PERMISSION_CHECK)(rules, rules);
    const hasDisableRule = rulesByPermissionCheck?.some((rule) => rule.disable);

    return (
        <div>
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
            <div className={styles.dataValidationListButtons}>
                {(rules.length && !hasDisableRule)
                    ? (
                        <Button className={styles.dataValidationListButton} onClick={handleRemoveAll}>
                            {localeService.t('dataValidation.panel.removeAll')}
                        </Button>
                    )
                    : null}
                <Button className={styles.dataValidationListButton} type="primary" onClick={handleAddRule}>
                    {localeService.t('dataValidation.panel.add')}
                </Button>
            </div>
        </div>
    );
};
