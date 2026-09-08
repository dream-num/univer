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

import type { IFontFamilyDropdownProps } from './FontFamilyDropdown';
import { LocaleService } from '@univerjs/core';
import { clsx, MobileSelect } from '@univerjs/design';
import { useDependency, useObservable } from '../../utils/di';
import { useFontList } from './use-font-list';

export function MobileFontFamilyDropdown(props: IFontFamilyDropdownProps) {
    const localeService = useDependency(LocaleService);
    const disabled = useObservable(props.disabled$);
    const { fonts } = useFontList();
    return (
        <MobileSelect
            aria-label={props.ariaLabel}
            className={clsx('univer-h-12 univer-w-full univer-min-w-0 univer-text-base', props.className)}
            value={props.value}
            disabled={!!(props.disabled || disabled)}
            options={fonts.map((font) => ({ value: font.value, label: localeService.t(font.label) }))}
            onChange={props.onChange}
        />
    );
}
