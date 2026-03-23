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

import type { Theme } from '@univerjs/themes';
import type { LoopColorKey, ThemeScaleKey, ThemeShadeKey } from '../types';
import { IntegrationExampleSection, ThemeLoopColorSection, ThemeRootColorsSection, ThemeScaleSection } from './theme-sections';

export function TokenEditorPanel(props: {
    copyLabel: string;
    theme: Theme;
    visibleScaleKeys: ThemeScaleKey[];
    onCopy: () => void;
    onLoopColorChange: (key: LoopColorKey, value: string) => void;
    onRootColorChange: (key: 'white' | 'black', value: string) => void;
    onScaleColorChange: (scale: ThemeScaleKey, shade: ThemeShadeKey, value: string) => void;
}) {
    const { copyLabel, theme, visibleScaleKeys, onCopy, onLoopColorChange, onRootColorChange, onScaleColorChange } = props;

    return (
        <div className="univer-flex univer-flex-col univer-gap-4">
            <ThemeRootColorsSection theme={theme} onChange={onRootColorChange} />

            {visibleScaleKeys.map((scale, index) => (
                <ThemeScaleSection
                    key={scale}
                    title={scale}
                    scale={scale}
                    theme={theme}
                    defaultExpanded={index < 2}
                    onChange={onScaleColorChange}
                />
            ))}

            <ThemeLoopColorSection theme={theme} onChange={onLoopColorChange} />
            <IntegrationExampleSection copyLabel={copyLabel} onCopy={onCopy} />
        </div>
    );
}
