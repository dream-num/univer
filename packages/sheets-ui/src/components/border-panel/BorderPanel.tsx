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

import type { IBorderInfo } from '@univerjs/sheets';
import type { IBorderPanelProps } from './interface';
import { BorderStyleTypes } from '@univerjs/core';
import { clsx, ColorPicker, Dropdown, Separator } from '@univerjs/design';
import { MoreDownSingle, PaintBucket } from '@univerjs/icons';
import { BorderStyleManagerService } from '@univerjs/sheets';
import { ComponentManager, useDependency } from '@univerjs/ui';
import { BorderLine } from './border-line/BorderLine';
import { BORDER_LINE_CHILDREN } from './interface';

const BORDER_SIZE_CHILDREN = [
    {
        label: BorderStyleTypes.THIN,
        value: BorderStyleTypes.THIN,
    },
    {
        label: BorderStyleTypes.HAIR,
        value: BorderStyleTypes.HAIR,
    },
    {
        label: BorderStyleTypes.DOTTED,
        value: BorderStyleTypes.DOTTED,
    },
    {
        label: BorderStyleTypes.DASHED,
        value: BorderStyleTypes.DASHED,
    },
    {
        label: BorderStyleTypes.DASH_DOT,
        value: BorderStyleTypes.DASH_DOT,
    },
    {
        label: BorderStyleTypes.DASH_DOT_DOT,
        value: BorderStyleTypes.DASH_DOT_DOT,
    },
    {
        label: BorderStyleTypes.MEDIUM,
        value: BorderStyleTypes.MEDIUM,
    },
    {
        label: BorderStyleTypes.MEDIUM_DASHED,
        value: BorderStyleTypes.MEDIUM_DASHED,
    },
    {
        label: BorderStyleTypes.MEDIUM_DASH_DOT,
        value: BorderStyleTypes.MEDIUM_DASH_DOT,
    },
    {
        label: BorderStyleTypes.MEDIUM_DASH_DOT_DOT,
        value: BorderStyleTypes.MEDIUM_DASH_DOT_DOT,
    },
    {
        label: BorderStyleTypes.THICK,
        value: BorderStyleTypes.THICK,
    },
];

export function BorderPanel(props: IBorderPanelProps) {
    const componentManager = useDependency(ComponentManager);
    const borderStyleManagerService = useDependency(BorderStyleManagerService);

    const { onChange, value } = props;

    function handleClick(v: string | number, type: keyof IBorderInfo) {
        onChange?.({
            ...value,
            [type]: v,
        });
    }

    function renderIcon(icon: string) {
        const Icon = componentManager.get(icon);

        return Icon && <Icon extend={{ colorChannel1: '#2c53f1' }} />;
    }

    return (
        <section className="univer-box-border univer-grid univer-gap-2 univer-p-1.5">
            <div className="univer-box-border univer-grid univer-grid-cols-5 univer-gap-2">
                {BORDER_LINE_CHILDREN.map((item) => (
                    <a
                        key={item.value}
                        className={clsx(`
                          univer-flex univer-size-6 univer-cursor-pointer univer-items-center univer-justify-center
                          univer-justify-self-center univer-rounded
                          hover:univer-bg-gray-100
                        `, {
                            'univer-bg-gray-200': borderStyleManagerService.getBorderInfo().type === item.value,
                        })}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick(item.value, 'type');
                        }}
                    >
                        {renderIcon(item.icon)}
                    </a>
                ))}
            </div>

            <Separator />

            <div className="univer-flex univer-items-center univer-gap-2">
                <div>
                    <Dropdown
                        overlay={(
                            <div className="univer-rounded-lg univer-p-4">
                                <ColorPicker onChange={(value) => handleClick(value, 'color')} />
                            </div>
                        )}
                    >
                        <button
                            className={`
                              univer-flex univer-cursor-pointer univer-items-center univer-gap-2 univer-rounded
                              univer-border-none univer-bg-transparent univer-p-1
                              hover:univer-bg-gray-100
                            `}
                            type="button"
                        >
                            <PaintBucket extend={{ colorChannel1: value?.color ?? 'rgb(var(--primary-color))' }} />
                            <MoreDownSingle className="univer-text-gray-400" />
                        </button>
                    </Dropdown>
                </div>

                <div>
                    <Dropdown
                        overlay={(
                            <section className="univer-rounded-lg univer-p-1.5">
                                <ul className="univer-m-0 univer-grid univer-list-none univer-gap-1 univer-p-0">
                                    {BORDER_SIZE_CHILDREN.map((item) => (
                                        <li
                                            key={item.value}
                                            className={`
                                              univer-flex univer-cursor-pointer univer-items-center
                                              univer-justify-center univer-rounded univer-px-1 univer-py-2
                                              hover:univer-bg-gray-100
                                            `}
                                            onClick={() => handleClick(item.value, 'style')}
                                        >
                                            <BorderLine type={item.value} />
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    >
                        <button
                            className={`
                              univer-flex univer-cursor-pointer univer-items-center univer-gap-2 univer-rounded
                              univer-border-none univer-bg-transparent univer-p-1
                              hover:univer-bg-gray-100
                            `}
                            type="button"
                        >
                            <BorderLine type={BorderStyleTypes.THIN} />
                            <MoreDownSingle className="univer-text-gray-400" />
                        </button>
                    </Dropdown>
                </div>
            </div>
        </section>
    );
}
