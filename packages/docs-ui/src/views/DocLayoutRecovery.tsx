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
import { LoadingMultiIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';

export const DOC_LAYOUT_RECOVERY_COMPONENT = 'DOC_LAYOUT_RECOVERY_COMPONENT';

export function DocLayoutRecovery() {
    const localeService = useDependency(LocaleService);

    return (
        <div
            aria-live="polite"
            className="
              univer-flex univer-items-center univer-gap-2 univer-rounded-lg univer-bg-white univer-px-4 univer-py-3
              univer-text-sm univer-text-gray-700 univer-shadow-lg
              dark:univer-bg-gray-800 dark:univer-text-gray-200
            "
            role="status"
        >
            <LoadingMultiIcon
                aria-hidden
                className="univer-size-5 univer-animate-spin univer-text-violet-500"
            />
            <span>{localeService.t<LocaleKey>('docs-ui.layout.recovering')}</span>
        </div>
    );
}
