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
import { EmbedActivationService } from '../services/embed-activation.service';
import { EmbedFullscreenService } from '../services/embed-fullscreen.service';

export interface IEmbedFloatFullscreenButtonProps {
    hostUnitId?: string;
    embedId?: string;
    className?: string;
    title?: string;
}

export function EmbedFloatFullscreenButton(props: IEmbedFloatFullscreenButtonProps) {
    const { hostUnitId, embedId, className, title = 'Fullscreen' } = props;
    const buttonRef = useRef<HTMLButtonElement>(null);
    const embedModelService = useDependency(EmbedModelService);
    const activationService = useDependency(EmbedActivationService);
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
            activationService,
            embedModelService,
            fullscreenService,
        });
    }, [activationService, embedId, embedModelService, fullscreenService, hostUnitId]);

    useEffect(() => {
        const button = buttonRef.current;
        if (!button) {
            return undefined;
        }

        const stopPointerDown = (event: PointerEvent) => {
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
            className={[
                `univer-absolute univer-right-2 univer-top-2 univer-z-10 univer-inline-flex univer-size-6
                univer-cursor-pointer univer-appearance-none univer-items-center univer-justify-center
                univer-rounded-md univer-border-0 univer-bg-[rgba(0,0,0,0.15)] univer-p-0 univer-text-white
                univer-opacity-100 univer-shadow-sm univer-transition univer-duration-150
                hover:univer-bg-[rgba(0,0,0,0.4)] hover:univer-opacity-100 hover:univer-shadow-md
                dark:!univer-bg-[rgba(243,244,246,0.22)] dark:!univer-text-gray-900 dark:!univer-shadow-none
                dark:hover:!univer-bg-[rgba(243,244,246,0.4)]`,
                className,
            ].filter(Boolean).join(' ')}
            data-embed-float-fullscreen-button="true"
            aria-label="Fullscreen embed block"
            title={title}
        >
            <FullscreenIcon className="univer-size-3.5" />
        </button>
    );
}

export function enterEmbedFullscreen(params: {
    hostUnitId: string;
    embedId: string;
    activationService?: Pick<EmbedActivationService, 'clearFloating'>;
    embedModelService: Pick<EmbedModelService, 'getDescriptor'>;
    fullscreenService: Pick<EmbedFullscreenService, 'enter'>;
}): boolean {
    const descriptor = params.embedModelService.getDescriptor(params.hostUnitId, params.embedId);
    if (!descriptor?.childUnitId || descriptor.childType == null) {
        return false;
    }

    params.activationService?.clearFloating(params.embedId, params.hostUnitId);
    params.fullscreenService.enter(descriptor);
    return true;
}
