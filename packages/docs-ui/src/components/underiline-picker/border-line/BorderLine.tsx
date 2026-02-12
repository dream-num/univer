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

import { TextDecoration } from '@univerjs/core';

import { BorderDashed } from './icons/BorderDashed';
import { BorderDashedDotHeavy } from './icons/BorderDashedDotHeavy';
import { BorderDashedHeavy } from './icons/BorderDashedHeavy';
import { BorderDotted } from './icons/BorderDotted';
import { BorderDouble } from './icons/BorderDouble';
import { BorderThick } from './icons/BorderThick';
import { BorderThin } from './icons/BorderThin';
import { BorderWave } from './icons/BorderWave';
import { BorderWaveDouble } from './icons/BorderWavyDouble';

interface IUnderlineProps {
    className: string;
    type: TextDecoration;
}

export function BorderLine(props: IUnderlineProps) {
    const { type = TextDecoration.SINGLE, className } = props;

    switch (type) {
        case TextDecoration.DOUBLE:
            return <BorderDouble className={className} />;
        case TextDecoration.DOTTED:
            return <BorderDotted className={className} />;
        case TextDecoration.DASH:
            return <BorderDashed className={className} />;
        case TextDecoration.DASHED_HEAVY:
            return <BorderDashedHeavy className={className} />;
        case TextDecoration.DASH_DOT_HEAVY:
            return <BorderDashedDotHeavy className={className} />;
        case TextDecoration.THICK:
            return <BorderThick className={className} />;
        case TextDecoration.WAVE:
            return <BorderWave className={className} />;
        case TextDecoration.WAVY_DOUBLE:
            return <BorderWaveDouble className={className} />;
        case TextDecoration.SINGLE:
        default:
            return <BorderThin className={className} />;
    }
}
