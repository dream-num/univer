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

import { useLayoutEffect, useState } from 'react';

export function useWorkbenchPortal(mountContainer: HTMLElement, direction: string) {
    const [portal] = useState(() => mountContainer.ownerDocument.createElement('div'));

    useLayoutEffect(() => {
        const ownerDocument = mountContainer.ownerDocument;
        const ownerWindow = ownerDocument.defaultView!;
        const syncFont = () => {
            const family = ownerWindow.getComputedStyle(mountContainer).fontFamily;
            const customFamily = family !== ownerWindow.getComputedStyle(ownerDocument.body).fontFamily;
            const portalFamily = customFamily ? family : '';
            if (portal.style.fontFamily !== portalFamily) {
                portal.style.setProperty('font-family', portalFamily);
            }
            mountContainer.classList.toggle('univer-scoped-ui-font', customFamily);
            portal.classList.toggle('univer-scoped-ui-font', customFamily);
        };

        syncFont();
        ownerDocument.body.appendChild(portal);

        // Body-level overlays escape clipping. Follow font changes scoped to this embed.
        const observer = new MutationObserver(syncFont);
        for (let element: HTMLElement | null = mountContainer; element; element = element.parentElement) {
            observer.observe(element, { attributes: true, attributeFilter: ['class', 'style', 'dir', 'lang'] });
        }
        observer.observe(portal, { childList: true });
        ownerWindow.addEventListener('resize', syncFont);

        return () => {
            observer.disconnect();
            ownerWindow.removeEventListener('resize', syncFont);
            mountContainer.classList.remove('univer-scoped-ui-font');
            portal.remove();
        };
    }, [mountContainer, portal]);

    useLayoutEffect(() => {
        portal.setAttribute('dir', direction);
    }, [direction, portal]);

    return portal;
}
