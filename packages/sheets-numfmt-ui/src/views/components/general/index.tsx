/**
 * Copyright 2023-present DreamNum Inc.
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

import type { FC } from 'react';
import type { IBusinessComponentProps } from '../interface';
import { LocaleService, useDependency } from '@univerjs/core';
import React from 'react';

export const isGeneralPanel = (pattern: string) => !pattern;

export const GeneralPanel: FC<IBusinessComponentProps> = (props) => {
    const localeService = useDependency(LocaleService);
    const t = localeService.t;

    props.action.current = () => '';

    return (
        <div>
            <div className="describe m-t-14">{t('sheet.numfmt.generalDes')}</div>
        </div>
    );
};
