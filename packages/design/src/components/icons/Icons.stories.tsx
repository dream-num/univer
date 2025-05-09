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

import type { Meta } from '@storybook/react';

import * as Icons from '@univerjs/icons';
import * as manifest from '@univerjs/icons/esm/manifest';
import { useState } from 'react';
import { Segmented } from '../segmented/Segmented';

const meta: Meta = {
    title: 'Components / Icons',
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

interface IManifest {
    stem: string;
    icon: string;
}

export const InputBasic = {
    render() {
        const group = Object.keys(manifest).reduce(
            (acc, key) => {
                const item: IManifest[] = manifest[key as keyof typeof manifest];

                if (key.startsWith('single')) {
                    acc[0] = acc[0].concat(item);
                } else if (key.startsWith('binary')) {
                    acc[1] = acc[1].concat(item);
                } else {
                    acc[2] = acc[2].concat(item);
                }
                return acc;
            },
            [[], [], []] as IManifest[][]
        );

        const [active, setActive] = useState(0);

        function getIcon(icon: string) {
            const Icon = Icons[icon as keyof typeof Icons] as any;
            return <Icon className="univer-size-5 univer-fill-gray-200 univer-text-primary-600" />;
        }

        function pascalCase(str: string) {
            return str
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join('');
        }

        return (
            <div className="univer-w-[720px]">
                <div className="univer-mx-auto univer-w-96">
                    <Segmented
                        items={[{
                            label: 'Single',
                            value: 0,
                        }, {
                            label: 'Double',
                            value: 1,
                        }, {
                            label: 'Others',
                            value: 2,
                        }]}
                        value={active}
                        onChange={setActive}
                    />
                </div>

                <div className="univer-grid univer-grid-cols-5 univer-gap-2">
                    {group[active].map((item, index) => (
                        <div
                            key={index}
                            className={`
                              univer-relative univer-flex univer-size-36 univer-flex-col univer-items-center
                              univer-justify-center
                            `}
                        >
                            <span>{getIcon(item.icon)}</span>

                            <span
                                className={`
                                  univer-absolute univer-bottom-2 univer-left-1/2 -univer-translate-x-1/2 univer-text-xs
                                  univer-text-gray-600
                                `}
                            >
                                {pascalCase(item.stem)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    },
};
