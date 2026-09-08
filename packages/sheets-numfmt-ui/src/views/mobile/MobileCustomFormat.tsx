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

import type { LocaleKey } from '../../locale/types';
import { LocaleService } from '@univerjs/core';
import { Button, clsx, Input, MobileActionRow, MobileActionRowGroup, scrollbarClassName } from '@univerjs/design';
import { CheckMarkIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { useState } from 'react';

export interface IMobileCustomFormatProps {
    patterns: string[];
    onConfirm: (pattern: string) => void;
}

export function MobileCustomFormat(props: IMobileCustomFormatProps) {
    const { patterns, onConfirm } = props;
    const localeService = useDependency(LocaleService);
    const [pattern, setPattern] = useState('');
    const title = localeService.t<LocaleKey>('sheets-numfmt-ui.customFormat');

    return (
        <div
            data-u-comp="mobile-custom-format"
            className="univer-flex univer-h-full univer-min-h-0 univer-flex-col univer-gap-4"
        >
            <Input
                className="univer-shrink-0"
                size="large"
                aria-label={title}
                value={pattern}
                placeholder={title}
                onChange={setPattern}
            />
            <div
                data-u-comp="mobile-custom-format-scroller"
                className={clsx('univer-min-h-0 univer-flex-1 univer-overflow-y-auto', scrollbarClassName)}
            >
                <div
                    className="
                      univer-overflow-hidden univer-rounded-xl univer-bg-gray-0
                      dark:!univer-bg-gray-800
                    "
                >
                    {patterns.map((item, index) => (
                        <MobileActionRow
                            key={item}
                            aria-label={item}
                            aria-pressed={pattern === item}
                            title={<span className="univer-break-all univer-font-mono univer-text-sm">{item}</span>}
                            trailing={pattern === item
                                ? <CheckMarkIcon className="univer-shrink-0 univer-text-primary-600" />
                                : undefined}
                            bordered={index !== patterns.length - 1}
                            className="!univer-rounded-none !univer-font-normal"
                            onClick={() => setPattern(item)}
                        />
                    ))}
                </div>
                <div
                    className="
                      univer-mt-4 univer-px-1 univer-text-sm univer-text-gray-600
                      dark:!univer-text-gray-200
                    "
                >
                    {localeService.t<LocaleKey>('sheets-numfmt-ui.customFormatDes')}
                </div>
            </div>
            <MobileActionRowGroup className="univer-shrink-0">
                <Button variant="primary" disabled={!pattern.trim()} onClick={() => onConfirm(pattern.trim())}>
                    {localeService.t<LocaleKey>('sheets-numfmt-ui.confirm')}
                </Button>
            </MobileActionRowGroup>
        </div>
    );
}
