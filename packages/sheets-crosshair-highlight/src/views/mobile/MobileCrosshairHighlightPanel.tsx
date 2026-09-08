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

import type { LocaleKey } from '../../locale/types';
import { ICommandService, LocaleService, ThemeService } from '@univerjs/core';
import { clsx, resetButtonClassName, Switch } from '@univerjs/design';
import { useDependency, useObservable } from '@univerjs/ui';
import { map } from 'rxjs';
import {
    DisableCrosshairHighlightOperation,
    EnableCrosshairHighlightOperation,
    SetCrosshairHighlightColorOperation,
} from '../../commands/operations/operation';
import {
    CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS,
    resolveCrosshairHighlightColors,
    SheetsCrosshairHighlightService,
} from '../../services/crosshair.service';

export function MobileCrosshairHighlightPanel() {
    const commandService = useDependency(ICommandService);
    const crosshairHighlightService = useDependency(SheetsCrosshairHighlightService);
    const localeService = useDependency(LocaleService);
    const themeService = useDependency(ThemeService);
    const enabled = useObservable(crosshairHighlightService.enabled$, false);
    const currentColor = useObservable(crosshairHighlightService.color$);
    const colors = useObservable(
        () => themeService.currentTheme$.pipe(map(() => resolveCrosshairHighlightColors(themeService))),
        resolveCrosshairHighlightColors(themeService),
        false,
        [themeService]
    );

    return (
        <div className="univer-grid univer-w-full univer-gap-4 univer-p-4">
            <div className="univer-flex univer-min-h-8 univer-items-center univer-gap-4">
                <span
                    className="
                      univer-min-w-0 univer-flex-1 univer-text-base univer-font-medium univer-text-gray-900
                      dark:!univer-text-gray-100
                    "
                >
                    {localeService.t<LocaleKey>('sheets-crosshair-highlight.button.tooltip')}
                </span>
                <Switch
                    defaultChecked={enabled}
                    onChange={(checked) => {
                        const operation = checked
                            ? EnableCrosshairHighlightOperation
                            : DisableCrosshairHighlightOperation;
                        commandService.executeCommand(operation.id).catch(() => undefined);
                    }}
                />
            </div>
            <div className="univer-grid univer-grid-cols-8 univer-gap-3">
                {colors.map((color, index) => {
                    const tokenPath = CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS[index];
                    const selected = color === currentColor;

                    return (
                        <button
                            key={tokenPath}
                            type="button"
                            data-color-token={tokenPath}
                            title={color}
                            aria-pressed={selected}
                            className={clsx(resetButtonClassName, `
                              univer-box-border univer-size-8 univer-rounded-lg univer-border univer-border-solid
                              univer-border-gray-200 univer-ring-offset-2
                              active:univer-opacity-70
                              dark:!univer-border-gray-600
                            `, {
                                'univer-ring-2 univer-ring-primary-600': selected,
                            })}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                commandService.executeCommand(SetCrosshairHighlightColorOperation.id, {
                                    value: tokenPath,
                                }).catch(() => undefined);
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
