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

import type { LocaleKey } from '../locale/types';
import { LocaleService } from '@univerjs/core';
import { useDependency, useObservable } from '@univerjs/ui';
import { DocLayoutProgressService } from '../services/doc-layout-progress.service';

export function DocLayoutProgress() {
    const localeService = useDependency(LocaleService);
    const progressState = useObservable(useDependency(DocLayoutProgressService).currentProgress$, null);
    if (progressState == null) {
        return null;
    }

    const { progress } = progressState;
    const label = localeService.t<LocaleKey>('docs-ui.layout.progress');

    return (
        <div
            className="
              univer-pointer-events-none univer-absolute univer-left-1/2 univer-top-1/2 univer-flex
              -univer-translate-x-1/2 -univer-translate-y-1/2 univer-items-center univer-gap-2 univer-text-xs
              univer-text-gray-600
              dark:univer-text-gray-300
            "
        >
            <span className="univer-whitespace-nowrap">{label}</span>
            <div
                aria-label={label}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={progress}
                className="
                  univer-h-1 univer-w-32 univer-overflow-hidden univer-rounded-full univer-bg-gray-200
                  dark:univer-bg-gray-700
                "
                role="progressbar"
            >
                <div
                    className="univer-h-full univer-rounded-full univer-bg-primary-600 univer-transition-[width]"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <span className="univer-w-8 univer-tabular-nums">
                {progress}
                %
            </span>
        </div>
    );
}
