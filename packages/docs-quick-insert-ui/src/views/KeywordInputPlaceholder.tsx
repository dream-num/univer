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

export const KeywordInputPlaceholderComponentKey = 'docs.quick.insert.keyword-input-placeholder';

export const KeywordInputPlaceholder = () => {
    const localeService = useDependency(LocaleService);
    // TODO: 需要根据fontSize来计算高度跟偏移
    return (
        <div className="univer-translate-y-1.5 univer-text-sm univer-text-gray-500">
            {localeService.t('docQuickInsert.keywordInputPlaceholder')}
        </div>
    );
};

KeywordInputPlaceholder.componentKey = KeywordInputPlaceholderComponentKey;
