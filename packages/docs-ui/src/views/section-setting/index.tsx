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

import type { ISetTextSelectionsOperationParams } from '@univerjs/docs';
import { generateRandomId, ICommandService, LocaleService } from '@univerjs/core';
import { RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { SectionSetting } from './Setting';

export function SectionSettingIndex() {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    useObservable(localeService.currentLocale$);
    const [key, setKey] = useState(() => generateRandomId(4));

    useEffect(() => {
        const disposable = commandService.onCommandExecuted((info) => {
            if (info.id === SetTextSelectionsOperation.id) {
                const ranges = (info.params as ISetTextSelectionsOperationParams).ranges;
                if (ranges.length > 0) {
                    setKey(generateRandomId(4));
                }
            } else if (info.id === RichTextEditingMutation.id) {
                setKey(generateRandomId(4));
            }
        });
        return () => disposable.dispose();
    }, [commandService]);

    return <SectionSetting key={key} />;
}
