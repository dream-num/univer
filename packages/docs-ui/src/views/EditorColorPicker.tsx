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

import type { IColorPickerProps } from '@univerjs/design';
import { COLOR_PICKER_COMPONENT, ComponentManager, useDependency } from '@univerjs/ui';
import { useEffect, useRef } from 'react';

export function EditorColorPicker(props: IColorPickerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const componentManager = useDependency(ComponentManager);
    const ColorPickerComponent = componentManager.get(COLOR_PICKER_COMPONENT);

    useEffect(() => {
        const container = containerRef.current;
        const view = container?.ownerDocument.defaultView;
        if (!container || !view) {
            return;
        }

        const preserveComposition = (event: KeyboardEvent) => {
            if (
                event.isComposing &&
                (event.key === 'Enter' || event.key === 'Escape') &&
                event.target instanceof view.HTMLInputElement &&
                container.contains(event.target)
            ) {
                // Popup dismissal captures on document; preserve the IME default before it reaches that listener.
                event.stopPropagation();
            }
        };
        view.addEventListener('keydown', preserveComposition, true);
        return () => view.removeEventListener('keydown', preserveComposition, true);
    }, []);

    return <div ref={containerRef}><ColorPickerComponent {...props} /></div>;
}

EditorColorPicker.componentKey = 'docs.editor-color-picker';
