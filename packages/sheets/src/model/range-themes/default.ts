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

import { RangeThemeStyle } from '../range-theme-util';

const defaultRangeThemeStyle = new RangeThemeStyle('default');

defaultRangeThemeStyle.setWholeStyle({
    ol: {
        s: 1,
        cl: {
            rgb: 'rgb(0,0,0)',
        },
    },
});

defaultRangeThemeStyle.setHeaderColumnStyle({
    bg: {
        rgb: 'rgb(119,159,205)',
    },
});

defaultRangeThemeStyle.setHeaderRowStyle({
    bg: {
        rgb: 'rgb(184,216,235)',
    },
});

defaultRangeThemeStyle.setFirstRowStyle({
    bg: {
        rgb: 'rgb(256,256,256)',
    },
});

defaultRangeThemeStyle.setSecondRowStyle({
    bg: {
        rgb: 'rgb(184,216,235)',
    },
});

export default defaultRangeThemeStyle;
