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

import type { IUniverDocsUIConfig } from '../../config/config';
import { UniverInstanceType } from '@univerjs/core';
import { IWorkbenchService, useConfigValue, useDependency, useObservable } from '@univerjs/ui';
import { DOCS_UI_PLUGIN_CONFIG_KEY } from '../../config/config';
import { CountBar } from '../count-bar';
import { DocStatistics } from '../doc-statistics/DocStatistics';

function DocFooterContent() {
    const config = useConfigValue<IUniverDocsUIConfig>(DOCS_UI_PLUGIN_CONFIG_KEY);
    const isShow = config?.footer ?? true;

    return isShow && (
        <div
            className={`
              univer-box-border univer-flex univer-items-center univer-justify-between univer-px-5 univer-py-1.5
            `}
        >
            {config?.wordCount !== false && <DocStatistics />}
            <CountBar />
        </div>
    );
}

export function DocFooter() {
    const workbenchService = useDependency(IWorkbenchService);
    const rootUnitType = useObservable(workbenchService.rootUnitType$, null, true);

    if (rootUnitType !== UniverInstanceType.UNIVER_DOC) {
        return null;
    }

    return <DocFooterContent />;
}
