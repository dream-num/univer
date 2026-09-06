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

import type { IDrawingParam } from '@univerjs/core';
import type { LocaleKey } from '../../locale/types';
import { ICommandService, LocaleService } from '@univerjs/core';
import { MobileActionRow } from '@univerjs/design';
import { DrawingCommonPanel } from '@univerjs/drawing-ui';
import { useDependency } from '@univerjs/ui';
import { useState } from 'react';
import { SidebarDocDrawingOperation } from '../../commands/operations/open-drawing-panel.operation';
import { DocDrawingPosition } from './DocDrawingPosition';
import { DocDrawingTextWrap } from './DocDrawingTextWrap';

const tabs: { value: 'image' | 'wrap' | 'position'; label: LocaleKey }[] = [
    { value: 'image', label: 'docs-drawing-ui.title' },
    { value: 'wrap', label: 'docs-drawing-ui.image-text-wrap.title' },
    { value: 'position', label: 'docs-drawing-ui.image-position.title' },
];

export function MobileDocDrawingPanel({ drawings }: { drawings: IDrawingParam[] }) {
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const [tab, setTab] = useState<'image' | 'wrap' | 'position'>('image');

    return (
        <div className="univer-flex univer-min-w-0 univer-flex-col univer-gap-4 univer-pb-2">
            <div className="univer-grid univer-grid-cols-3 univer-gap-2" role="group">
                {tabs.map((item) => (
                    <MobileActionRow
                        key={item.value}
                        aria-pressed={tab === item.value}
                        title={localeService.t<LocaleKey>(item.label)}
                        variant="subtle"
                        className="
                          univer-min-w-0 univer-px-2 univer-text-center univer-text-sm
                          aria-pressed:!univer-bg-primary-50 aria-pressed:!univer-text-primary-600
                        "
                        onClick={() => setTab(item.value)}
                    />
                ))}
            </div>
            <div>
                {tab === 'image' && (
                    <DrawingCommonPanel
                        drawings={drawings}
                        hasAlign={false}
                        hasCropper
                        hasGroup={false}
                        hasTransform={false}
                        onCropStart={() => commandService.executeCommand(SidebarDocDrawingOperation.id, { value: 'close' })}
                    />
                )}
                {tab === 'wrap' && <DocDrawingTextWrap drawings={drawings} />}
                {tab === 'position' && <DocDrawingPosition drawings={drawings} />}
            </div>
        </div>
    );
}
