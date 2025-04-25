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
import { useDependency } from '@univerjs/ui';

export const QuickInsertPlaceholderComponentKey = 'docs.quick.insert.placeholder';

export const QuickInsertPlaceholder = () => {
    const localeService = useDependency(LocaleService);
    return (
        <div
            className={`
              univer-flex univer-h-full univer-items-center univer-justify-center univer-rounded-lg univer-bg-white
              univer-px-12 univer-py-6 univer-text-gray-400 univer-shadow-lg
            `}
        >
            <span>{localeService.t('docQuickInsert.placeholder')}</span>
        </div>
    );
};

QuickInsertPlaceholder.componentKey = QuickInsertPlaceholderComponentKey;
