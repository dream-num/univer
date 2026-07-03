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

import type { IFontConfig } from '../../services/font.service';
import { useEffect, useState } from 'react';
import { IFontService } from '../../services/font.service';
import { useDependency } from '../../utils/di';

export function useFontList() {
    const fontService = useDependency(IFontService);
    const [fonts, setFonts] = useState<IFontConfig[]>(() => fontService.getFonts());

    useEffect(() => {
        const subscription = fontService.fonts$.subscribe((fonts) => {
            setFonts(fonts);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fontService]);

    return { fonts, fontService };
}
