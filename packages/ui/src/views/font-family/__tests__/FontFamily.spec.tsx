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

import type { ICommand } from '@univerjs/core';
import type { ReactElement } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { CommandType, ICommandService, LocaleService, LocaleType, Univer } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { FontService, IFontService } from '../../../services/font.service';
import { RediProvider } from '../../../utils/di';
import { FontSize } from '../../font-size/FontSize';
import { FontFamily } from '../FontFamily';
import { FontFamilyItem } from '../FontFamilyItem';

class TestState {
    static commandParams: unknown[] = [];
    static familyChanges: string[] = [];
    static sizeChanges: number[] = [];

    static reset(): void {
        this.commandParams = [];
        this.familyChanges = [];
        this.sizeChanges = [];
    }
}

const SetFontFamilyCommand: ICommand<{ value: string }> = {
    id: 'test.command.set-font-family',
    type: CommandType.COMMAND,
    handler(_accessor, params) {
        TestState.commandParams.push(params);
        return true;
    },
};

function renderWithDependencies(element: ReactElement, direction: 'ltr' | 'rtl' = 'ltr') {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([IFontService, { useClass: FontService }]);
    injector.get(LocaleService).setDirection(direction);
    injector.get(LocaleService).load({
        [LocaleType.ZH_CN]: {
            ui: {
                fontFamily: {
                    arial: 'Arial',
                    'times-new-roman': 'Times New Roman',
                    tahoma: 'Tahoma',
                    verdana: 'Verdana',
                    'microsoft-yahei': 'Microsoft YaHei',
                    simsun: 'SimSun',
                    simhei: 'SimHei',
                    kaiti: 'Kaiti',
                    fangsong: 'FangSong',
                    nsimsun: 'NSimSun',
                    stxinwei: 'STXinwei',
                    stxingkai: 'STXingkai',
                    stliti: 'STLiti',
                },
            },
        },
    });
    injector.get(ICommandService).registerCommand(SetFontFamilyCommand);

    const result = render(
        <RediProvider value={{ injector }}>
            {element}
        </RediProvider>
    );

    return {
        ...result,
        dispose: () => {
            result.unmount();
            univer.dispose();
        },
    };
}

describe('font input views', () => {
    afterEach(() => {
        TestState.reset();
    });

    it('emits onChange when the typed text matches a known font', () => {
        const rendered = renderWithDependencies(
            <FontFamily
                value="Arial"
                onChange={(value) => TestState.familyChanges.push(value)}
            />
        );
        const input = rendered.container.querySelector('input') as HTMLInputElement;

        fireEvent.change(input, { target: { value: 'times' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(TestState.commandParams).toEqual([]);
        expect(TestState.familyChanges).toEqual(['Times New Roman']);
        rendered.dispose();
    });

    it('restores the displayed font when the typed text does not match any font', () => {
        const rendered = renderWithDependencies(
            <FontFamily
                value="Arial"
                onChange={(value) => TestState.familyChanges.push(value)}
            />
        );
        const input = rendered.container.querySelector('input') as HTMLInputElement;

        fireEvent.change(input, { target: { value: 'Unknown Family' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(TestState.commandParams).toEqual([]);
        expect(TestState.familyChanges).toEqual([]);
        expect(input.value).toBe('Arial');
        rendered.dispose();
    });

    it('emits onChange when a font-family menu item is selected', () => {
        const rendered = renderWithDependencies(
            <FontFamilyItem
                value="Arial"
                onChange={(value) => TestState.familyChanges.push(value)}
            />
        );

        fireEvent.click(rendered.getByText('Times New Roman'));

        expect(TestState.commandParams).toEqual([]);
        expect(TestState.familyChanges).toEqual(['Times New Roman']);
        rendered.dispose();
    });

    it('applies locale direction to the font-family menu list', () => {
        const rendered = renderWithDependencies(
            <FontFamilyItem
                value="Arial"
                onChange={(value) => TestState.familyChanges.push(value)}
            />,
            'rtl'
        );

        expect(rendered.container.querySelector('ul')?.getAttribute('dir')).toBe('rtl');
        rendered.dispose();
    });

    it('commits font size only when Enter is pressed', () => {
        const disabled$ = new BehaviorSubject(false);
        const rendered = render(
            <FontSize
                value={11}
                min={1}
                max={99}
                disabled$={disabled$}
                onChange={(value) => TestState.sizeChanges.push(value)}
            />
        );
        const input = rendered.container.querySelector('input') as HTMLInputElement;

        fireEvent.change(input, { target: { value: '16' } });
        expect(TestState.sizeChanges).toEqual([]);

        fireEvent.keyDown(input, { code: 'Enter' });

        expect(TestState.sizeChanges).toEqual([16]);
    });
});
