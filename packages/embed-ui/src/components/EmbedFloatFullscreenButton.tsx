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

import type { MouseEvent } from 'react';
import { EmbedModelService } from '@univerjs/embed';
import { FullscreenIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { useCallback, useEffect, useRef } from 'react';
import { EmbedFullscreenService } from '../services/embed-fullscreen.service';

const EMBED_FLOAT_FULLSCREEN_BUTTON_STYLE_ID = 'univer-embed-float-fullscreen-button-styles';

export interface IEmbedFloatFullscreenButtonProps {
    hostUnitId?: string;
    embedId?: string;
    className?: string;
    title?: string;
}

export function EmbedFloatFullscreenButton(props: IEmbedFloatFullscreenButtonProps) {
    ensureEmbedFloatFullscreenButtonStyles();

    const { hostUnitId, embedId, className, title = 'Fullscreen' } = props;
    const buttonRef = useRef<HTMLButtonElement>(null);
    const embedModelService = useDependency(EmbedModelService);
    const fullscreenService = useDependency(EmbedFullscreenService);

    const enterFullscreen = useCallback((event: Event | MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!hostUnitId || !embedId) {
            return;
        }

        enterEmbedFullscreen({
            hostUnitId,
            embedId,
            embedModelService,
            fullscreenService,
        });
    }, [embedId, embedModelService, fullscreenService, hostUnitId]);

    useEffect(() => {
        const button = buttonRef.current;
        if (!button) {
            return undefined;
        }

        const stopPointerDown = (event: PointerEvent) => {
            event.preventDefault();
            event.stopPropagation();
        };

        button.addEventListener('pointerdown', stopPointerDown);
        button.addEventListener('click', enterFullscreen);
        return () => {
            button.removeEventListener('pointerdown', stopPointerDown);
            button.removeEventListener('click', enterFullscreen);
        };
    }, [enterFullscreen]);

    return (
        <button
            ref={buttonRef}
            type="button"
            className={['univer-embed-float-fullscreen-button', className].filter(Boolean).join(' ')}
            data-embed-float-fullscreen-button="true"
            aria-label="Fullscreen embed block"
            title={title}
        >
            <FullscreenIcon />
        </button>
    );
}

export function enterEmbedFullscreen(params: {
    hostUnitId: string;
    embedId: string;
    embedModelService: Pick<EmbedModelService, 'getDescriptor'>;
    fullscreenService: Pick<EmbedFullscreenService, 'enter'>;
}): boolean {
    const descriptor = params.embedModelService.getDescriptor(params.hostUnitId, params.embedId);
    if (!descriptor?.childUnitId || descriptor.childType == null) {
        return false;
    }

    params.fullscreenService.enter(descriptor);
    return true;
}

function ensureEmbedFloatFullscreenButtonStyles(): void {
    if (typeof document === 'undefined' || document.getElementById(EMBED_FLOAT_FULLSCREEN_BUTTON_STYLE_ID)) {
        return;
    }

    const style = document.createElement('style');
    style.id = EMBED_FLOAT_FULLSCREEN_BUTTON_STYLE_ID;
    style.textContent = `
.univer-embed-float-fullscreen-button {
    position: absolute;
    top: 6px;
    right: 16px;
    z-index: 10;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: 0;
    border-radius: 6px;
    background: rgba(15, 23, 42, 0.30);
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.10);
    color: #ffffff;
    cursor: pointer;
    opacity: 0.70;
    padding: 0;
    appearance: none;
    transition: background-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}
.univer-embed-float-fullscreen-button:hover {
    background: rgba(15, 23, 42, 0.60);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.16);
    opacity: 0.95;
}
.univer-embed-float-fullscreen-button svg {
    width: 14px;
    height: 14px;
}
`;
    document.head.appendChild(style);
}
