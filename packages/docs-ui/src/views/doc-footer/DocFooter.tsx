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
import type { IUniverDocsUIConfig } from '../../controllers/config.schema';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { useConfigValue, useDependency, useObservable } from '@univerjs/ui';
import { DOCS_UI_PLUGIN_CONFIG_KEY } from '../../controllers/config.schema';
import { CountBar } from '../count-bar';

export function DocFooter() {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const config = useConfigValue<IUniverDocsUIConfig>(DOCS_UI_PLUGIN_CONFIG_KEY);
    const workbook = useObservable(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), undefined, undefined, []);
    const isShow = config?.layout?.docContainerConfig?.footer ?? true;

    return workbook
        ? null
        : isShow && (
            <div className="univer-box-border univer-flex univer-items-center univer-justify-between univer-px-5">
                <div />
                <CountBar />
            </div>
        );
};
