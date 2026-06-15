import type { IDisposable } from '@univerjs/core';
import type { EmbedFloatingMenuContribution, EmbedFloatingMenuMountContext } from '../types/embed-ui';
import { toDisposable, UniverInstanceType } from '@univerjs/core';
import { EmbedFloatingActiveService } from './embed-floating-active.service';
import { EmbedFullscreenService } from './embed-fullscreen.service';

export function createDefaultEmbedFloatingMenuContributions(): EmbedFloatingMenuContribution[] {
    return [
        {
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            mount: mountDefaultEmbedFloatingMenu,
        },
        {
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-floating-object',
            mount: mountDefaultEmbedFloatingMenu,
        },
        {
            hostType: UniverInstanceType.UNIVER_SLIDE,
            entry: 'slides-floating-object',
            mount: mountDefaultEmbedFloatingMenu,
        },
    ];
}

export function mountDefaultEmbedFloatingMenu(context: EmbedFloatingMenuMountContext): IDisposable {
    ensureDefaultEmbedFloatingMenuStyles();

    const root = context.renderScope.overlayRoot ?? context.renderScope.rootElement;
    const menu = document.createElement('div');
    menu.className = 'univer-embed-floating-menu';
    menu.dataset.embedFloatingMenu = 'true';
    menu.dataset.embedId = context.embedId;
    menu.dataset.embedHostEntry = context.descriptor.entry;
    menu.dataset.embedChildType = String(context.childType);

    const fullscreenButton = document.createElement('button');
    fullscreenButton.type = 'button';
    fullscreenButton.className = 'univer-embed-floating-menu__button';
    fullscreenButton.dataset.embedFloatingMenuFullscreen = 'true';
    fullscreenButton.title = 'Fullscreen';
    fullscreenButton.setAttribute('aria-label', 'Fullscreen');

    menu.append(fullscreenButton);
    root.appendChild(menu);

    const floatingActiveService = context.injector.get(EmbedFloatingActiveService);
    const fullscreenService = context.injector.get(EmbedFullscreenService);
    const activate = () => {
        floatingActiveService.activate({
            hostUnitId: context.hostUnitId,
            embedId: context.embedId,
            childUnitId: context.childUnitId,
        });
    };
    const syncActive = () => {
        const active = floatingActiveService.getActive();
        const isActive = active?.embedId === context.embedId;
        root.dataset.embedFloatingActive = isActive ? 'true' : 'false';
        menu.dataset.embedFloatingActive = isActive ? 'true' : 'false';
    };
    const stopPropagation = (event: Event) => event.stopPropagation();
    const enterFullscreen = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        activate();
        fullscreenService.enter(context.descriptor);
    };
    const activeSubscription = floatingActiveService.active$.subscribe(syncActive);

    root.addEventListener('pointerdown', activate);
    menu.addEventListener('pointerdown', stopPropagation);
    fullscreenButton.addEventListener('click', enterFullscreen);
    syncActive();

    return toDisposable(() => {
        root.removeEventListener('pointerdown', activate);
        menu.removeEventListener('pointerdown', stopPropagation);
        fullscreenButton.removeEventListener('click', enterFullscreen);
        activeSubscription.unsubscribe();
        menu.remove();
        if (root.dataset.embedFloatingActive) {
            delete root.dataset.embedFloatingActive;
        }
        floatingActiveService.clear(context.embedId);
    });
}

function ensureDefaultEmbedFloatingMenuStyles(): void {
    if (typeof document === 'undefined' || document.getElementById('univer-embed-floating-menu-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'univer-embed-floating-menu-styles';
    style.textContent = `
.univer-embed-floating-menu {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 30;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: calc(100% - 16px);
    min-height: 28px;
    border: 1px solid rgba(148, 163, 184, 0.8);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.16);
    color: #334155;
    line-height: 1;
    padding: 0 3px;
}
.univer-embed-floating-menu[data-embed-floating-active="true"] {
    border-color: #4f46e5;
    color: #312e81;
}
.univer-embed-floating-menu__button {
    box-sizing: border-box;
    position: relative;
    width: 22px;
    height: 22px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    background: #ffffff;
    color: #334155;
    cursor: pointer;
    padding: 0;
}
.univer-embed-floating-menu__button:hover {
    background: #f8fafc;
    color: #0f172a;
}
.univer-embed-floating-menu__button::before,
.univer-embed-floating-menu__button::after {
    position: absolute;
    width: 7px;
    height: 7px;
    content: '';
}
.univer-embed-floating-menu__button::before {
    top: 4px;
    right: 4px;
    border-top: 1.5px solid currentColor;
    border-right: 1.5px solid currentColor;
}
.univer-embed-floating-menu__button::after {
    bottom: 4px;
    left: 4px;
    border-bottom: 1.5px solid currentColor;
    border-left: 1.5px solid currentColor;
}
`;
    document.head.appendChild(style);
}
