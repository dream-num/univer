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

import type { IDisposable } from '@univerjs/core';
import { Quantity } from '@univerjs/core';
import { useCallback, useLayoutEffect, useRef } from 'react';
import type { ContextMenuEvent } from '../../services/contextmenu/contextmenu.service';
import { IContextMenuShortcutService } from '../../services/contextmenu/contextmenu-shortcut.service';
import { useDependency } from '../../utils/di';

/** Binds a component's keyboard menu to its mounted element and focusable descendants. */
export function useContextMenuShortcutRef(open?: (element: HTMLElement, anchor: ContextMenuEvent) => void) {
    const service = useDependency(IContextMenuShortcutService, Quantity.OPTIONAL);
    const openRef = useRef(open);
    const registrationRef = useRef<IDisposable | undefined>(undefined);
    useLayoutEffect(() => {
        openRef.current = open;
    }, [open]);

    const ref = useCallback((element: HTMLElement | null) => {
        registrationRef.current?.dispose();
        registrationRef.current = undefined;
        if (element && service) {
            registrationRef.current = service.registerElement(element, () => {
                const rect = element.getBoundingClientRect();
                openRef.current?.(element, {
                    clientX: rect.left + Math.min(8, rect.width / 2),
                    clientY: rect.top + Math.min(8, rect.height / 2),
                    stopPropagation() {},
                });
            });
        }
    }, [service]);

    return open ? ref : undefined;
}
