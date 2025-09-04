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
import { LocaleService } from '@univerjs/core';
import { Switch, Tooltip } from '@univerjs/design';
import { InfoIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { SheetsFilterSyncController } from '@univerjs/sheets-filter';

export function FilterSyncSwitch() {
    const sheetsFilterSyncController = useDependency(SheetsFilterSyncController);
    if (!sheetsFilterSyncController.visible) return null;

    const localeService = useDependency(LocaleService);

    return (
        <div
            className={`
              univer-mt-2 univer-flex univer-items-center univer-justify-between univer-text-sm univer-text-gray-900
              dark:univer-text-gray-200
            `}
        >
            <div className="univer-flex univer-items-center univer-gap-1">
                <span>{localeService.t('sheets-filter.sync.title')}</span>
                <Tooltip title={localeService.t('sheets-filter.sync.statusTips.on')} asChild>
                    <InfoIcon />
                </Tooltip>
            </div>
            <Switch
                defaultChecked={sheetsFilterSyncController.enabled}
                onChange={(checked) => sheetsFilterSyncController.setEnabled(checked)}
            />
        </div>
    );
}
