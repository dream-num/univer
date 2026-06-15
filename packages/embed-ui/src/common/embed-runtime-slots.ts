import type { IDisposable } from '@univerjs/core';
import { toDisposable } from '@univerjs/core';

export const EMBED_CANVAS_ROOT_ATTRIBUTE = 'data-embed-canvas-root';
export const EMBED_OVERLAY_ROOT_ATTRIBUTE = 'data-embed-overlay-root';
export const EMBED_POPUP_ROOT_ATTRIBUTE = 'data-embed-popup-root';
export const EMBED_MENU_SLOT_ATTRIBUTE = 'data-embed-menu-slot';
export const EMBED_FOOTER_SLOT_ATTRIBUTE = 'data-embed-footer-slot';

export function findEmbedRuntimeSlot(root: HTMLElement, attribute: string): HTMLElement | undefined {
    if (root.matches(`[${attribute}]`)) {
        return root;
    }

    return root.querySelector<HTMLElement>(`[${attribute}]`) ?? undefined;
}

export function ensureEmbedDefaultRuntimeSlots(root: HTMLElement): IDisposable {
    const added: string[] = [];
    [
        EMBED_CANVAS_ROOT_ATTRIBUTE,
        EMBED_OVERLAY_ROOT_ATTRIBUTE,
        EMBED_POPUP_ROOT_ATTRIBUTE,
    ].forEach((attribute) => {
        if (findEmbedRuntimeSlot(root, attribute)) {
            return;
        }

        root.setAttribute(attribute, 'true');
        added.push(attribute);
    });

    return toDisposable(() => {
        added.forEach((attribute) => {
            if (root.getAttribute(attribute) === 'true') {
                root.removeAttribute(attribute);
            }
        });
    });
}
