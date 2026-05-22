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
import { Panel, PanelField, PanelSection } from './Panel';

const meta: Meta<typeof Panel> = {
    title: 'Components / Panel',
    component: Panel,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const PanelBasic = {
    render() {
        return (
            <div className="univer-w-80">
                <Panel>
                    <PanelSection title="Section A">
                        <PanelField label="Field 1">
                            <input
                                className="
                                  univer-w-full univer-rounded univer-border univer-border-gray-300 univer-px-2
                                  univer-py-1
                                "
                            />
                        </PanelField>
                        <PanelField label="Field 2" required>
                            <input
                                className="
                                  univer-w-full univer-rounded univer-border univer-border-gray-300 univer-px-2
                                  univer-py-1
                                "
                            />
                        </PanelField>
                    </PanelSection>
                    <PanelSection title="Section B" defaultExpanded={false}>
                        <PanelField label="Field 3">
                            <input
                                className="
                                  univer-w-full univer-rounded univer-border univer-border-gray-300 univer-px-2
                                  univer-py-1
                                "
                            />
                        </PanelField>
                    </PanelSection>
                    <PanelSection title="Section C (not collapsible)" collapsible={false}>
                        <PanelField label="Field 4" error="This field has an error">
                            <input
                                className="
                                  univer-w-full univer-rounded univer-border univer-border-red-300 univer-px-2
                                  univer-py-1
                                "
                            />
                        </PanelField>
                    </PanelSection>
                </Panel>
            </div>
        );
    },
};
