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

import type { Workbook } from '@univerjs/core';
import type { LocaleKey } from '../../locale/types';
import {
    ICommandService,
    IPermissionService,
    IUniverInstanceService,
    LocaleService,
    MAX_ITERATION_COUNT,
    normalizeWorkbookCalculationSettings,
    UniverInstanceType,
} from '@univerjs/core';
import { Button, Checkbox, Input } from '@univerjs/design';
import { SetWorkbookCalculationSettingsCommand, WorkbookEditablePermission } from '@univerjs/sheets';
import { IDialogService, useDependency, useObservable } from '@univerjs/ui';
import { useState } from 'react';
import { CALCULATION_OPTIONS_DIALOG } from './interface';

export interface ICalculationOptionsProps {
    unitId: string;
}

export function CalculationOptions({ unitId }: ICalculationOptionsProps) {
    const instanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const permissionService = useDependency(IPermissionService);
    const dialogService = useDependency(IDialogService);
    const localeService = useDependency(LocaleService);
    const workbook = instanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
    const permissionId = new WorkbookEditablePermission(unitId).id;
    const permission = useObservable(permissionService.getPermissionPoint$(permissionId), undefined, false);
    const readOnly = !workbook || (permission?.value ?? permissionService.getPermissionPoint(permissionId)?.value) === false;
    const [draft, setDraft] = useState(() => {
        const settings = normalizeWorkbookCalculationSettings(workbook?.getCalculationSettings());
        return {
            enabled: settings.iterativeCalculation,
            count: String(settings.maxIterations),
            change: String(settings.maxChange),
        };
    });
    const [submitted, setSubmitted] = useState(false);
    const settings = {
        iterativeCalculation: draft.enabled,
        maxIterations: draft.count.trim() ? Number(draft.count) : NaN,
        maxChange: draft.change.trim() ? Number(draft.change) : NaN,
    };
    const validCount = Number.isInteger(settings.maxIterations) && settings.maxIterations >= 1 &&
        settings.maxIterations <= MAX_ITERATION_COUNT;
    const validChange = Number.isFinite(settings.maxChange) && settings.maxChange > 0;
    const showCountError = submitted && draft.enabled && !validCount;
    const showChangeError = submitted && draft.enabled && !validChange;

    function close() {
        dialogService.close(CALCULATION_OPTIONS_DIALOG);
    }

    function submit() {
        if (readOnly) {
            return;
        }
        setSubmitted(true);
        if (draft.enabled && (!validCount || !validChange)) {
            return;
        }
        const nextSettings = draft.enabled
            ? settings
            : { ...workbook!.getCalculationSettings(), iterativeCalculation: false };
        if (commandService.syncExecuteCommand(SetWorkbookCalculationSettingsCommand.id, { unitId, settings: nextSettings })) {
            close();
        }
    }

    return (
        <div className="univer-flex univer-flex-col univer-gap-4 univer-p-4">
            <p className="univer-m-0 univer-text-sm">
                {localeService.t<LocaleKey>('sheets-formula-ui.calculation.workbook')}
            </p>
            <Checkbox
                checked={draft.enabled}
                disabled={readOnly}
                onChange={(enabled) => setDraft((previous) => ({ ...previous, enabled: Boolean(enabled) }))}
            >
                {localeService.t<LocaleKey>('sheets-formula-ui.calculation.enable')}
            </Checkbox>
            <label className="univer-flex univer-flex-col univer-gap-2 univer-text-sm">
                {localeService.t<LocaleKey>('sheets-formula-ui.calculation.iterations', String(MAX_ITERATION_COUNT))}
                <Input
                    value={draft.count}
                    inputClass={showCountError ? 'univer-border-red-500' : undefined}
                    disabled={readOnly || !draft.enabled}
                    onChange={(count) => setDraft((previous) => ({ ...previous, count }))}
                />
                {showCountError && (
                    <span role="alert" className="univer-text-red-500">
                        {localeService.t<LocaleKey>('sheets-formula-ui.calculation.invalidIterations', String(MAX_ITERATION_COUNT))}
                    </span>
                )}
            </label>
            <label className="univer-flex univer-flex-col univer-gap-2 univer-text-sm">
                {localeService.t<LocaleKey>('sheets-formula-ui.calculation.change')}
                <Input
                    value={draft.change}
                    inputClass={showChangeError ? 'univer-border-red-500' : undefined}
                    disabled={readOnly || !draft.enabled}
                    onChange={(change) => setDraft((previous) => ({ ...previous, change }))}
                />
                {showChangeError && (
                    <span role="alert" className="univer-text-red-500">
                        {localeService.t<LocaleKey>('sheets-formula-ui.calculation.invalidChange')}
                    </span>
                )}
            </label>
            <div className="univer-flex univer-justify-end univer-gap-2">
                <Button onClick={close}>{localeService.t<LocaleKey>('sheets-formula-ui.calculation.cancel')}</Button>
                <Button variant="primary" disabled={readOnly} onClick={submit}>
                    {localeService.t<LocaleKey>('sheets-formula-ui.calculation.confirm')}
                </Button>
            </div>
        </div>
    );
}
