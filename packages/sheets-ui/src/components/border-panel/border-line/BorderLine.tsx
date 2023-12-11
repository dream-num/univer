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

import { BorderStyleTypes } from '@univerjs/core';
import React from 'react';

import { BorderDashDot } from './icons/BorderDashDot';
import { BorderDashDotDot } from './icons/BorderDashDotDot';
import { BorderDashed } from './icons/BorderDashed';
import { BorderHair } from './icons/BorderHair';
import { BorderMedium } from './icons/BorderMedium';
import { BorderMediumDashDot } from './icons/BorderMediumDashDot';
import { BorderMediumDashDotDot } from './icons/BorderMediumDashDotDot';
import { BorderMediumDashed } from './icons/BorderMediumDashed';
import { BorderThick } from './icons/BorderThick';
import { BorderThin } from './icons/BorderThin';

interface IBorderLineProps {
    type: BorderStyleTypes;
}

export function BorderLine(props: IBorderLineProps) {
    const { type = BorderStyleTypes.THIN } = props;

    switch (type) {
        case BorderStyleTypes.DASH_DOT:
            return <BorderDashDot />;
        case BorderStyleTypes.DASH_DOT_DOT:
            return <BorderDashDotDot />;
        case BorderStyleTypes.DASHED:
            return <BorderDashed />;
        case BorderStyleTypes.HAIR:
            return <BorderHair />;
        case BorderStyleTypes.MEDIUM:
            return <BorderMedium />;
        case BorderStyleTypes.MEDIUM_DASH_DOT:
            return <BorderMediumDashDot />;
        case BorderStyleTypes.MEDIUM_DASH_DOT_DOT:
            return <BorderMediumDashDotDot />;
        case BorderStyleTypes.MEDIUM_DASHED:
            return <BorderMediumDashed />;
        case BorderStyleTypes.THICK:
            return <BorderThick />;
        case BorderStyleTypes.THIN:
            return <BorderThin />;
        default:
            return <BorderThin />;
    }
}
