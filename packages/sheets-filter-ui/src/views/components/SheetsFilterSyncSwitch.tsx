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
import { MessageType, Switch, Tooltip } from '@univerjs/design';
import { InfoIcon } from '@univerjs/icons';
import { SheetsFilterSyncController } from '@univerjs/sheets-filter';
import { IMessageService, useDependency, useObservable } from '@univerjs/ui';

export function FilterSyncSwitch() {
    const sheetsFilterSyncController = useDependency(SheetsFilterSyncController);
    const visible = useObservable(sheetsFilterSyncController.visible$, undefined, true);
    if (!visible) return null;

    const localeService = useDependency(LocaleService);
    const messageService = useDependency(IMessageService);
    const enabled = useObservable(sheetsFilterSyncController.enabled$, undefined, true);

    return (
        <div
            className={`
              univer-mt-2 univer-flex univer-items-center univer-justify-between univer-text-sm univer-text-gray-900
              dark:univer-text-gray-200
            `}
        >
            <div className="univer-flex univer-items-center univer-gap-1">
                <span>{localeService.t('sheets-filter.sync.title')}</span>
                <Tooltip
                    title={enabled
                        ? localeService.t('sheets-filter.sync.statusTips.off')
                        : localeService.t('sheets-filter.sync.statusTips.on')}
                    asChild
                >
                    <InfoIcon />
                </Tooltip>
            </div>
            <Switch
                defaultChecked={enabled}
                onChange={(checked) => {
                    const message = checked
                        ? localeService.t('sheets-filter.sync.switchTips.on')
                        : localeService.t('sheets-filter.sync.switchTips.off');
                    sheetsFilterSyncController.setEnabled(checked);
                    messageService.show({
                        content: message,
                        type: MessageType.Success,
                        duration: 2000,
                    });
                }}
            />
        </div>
    );
}
