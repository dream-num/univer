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

import type { Univer } from '@univerjs/core';
import { ICommandService, Injector, RANGE_TYPE } from '@univerjs/core';
import { SetRangeValuesMutation, SetSelectionsOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { firstValueFrom, take } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    BackgroundColorSelectorMenuItemFactory,
    FontFamilySelectorMenuItemFactory,
    HorizontalAlignMenuItemFactory,
    ItalicMenuItemFactory,
    StrikeThroughMenuItemFactory,
    TextColorSelectorMenuItemFactory,
    TextRotateMenuItemFactory,
    UnderlineMenuItemFactory,
    VerticalAlignMenuItemFactory,
    WrapTextMenuItemFactory,
} from '../menu';
import { createMenuTestBed } from './create-menu-test-bed';

describe('advanced menu state streams', () => {
    let univer: Univer;
    let get: any;
    let commandService: ICommandService;
    let selectionService: SheetsSelectionsService;

    beforeEach(() => {
        const testBed = createMenuTestBed();
        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        selectionService = get(SheetsSelectionsService);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(SetRangeValuesMutation);
        selectionService.setSelections([
            {
                range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                primary: {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 0,
                    endColumn: 0,
                    actualRow: 0,
                    actualColumn: 0,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('resolves formatting menu states from current cell', async () => {
        const injector = get(Injector);
        const italic = injector.invoke(ItalicMenuItemFactory);
        const underline = injector.invoke(UnderlineMenuItemFactory);
        const strike = injector.invoke(StrikeThroughMenuItemFactory);
        const fontFamily = injector.invoke(FontFamilySelectorMenuItemFactory);

        expect(await firstValueFrom(italic.activated$!.pipe(take(1)))).toBeTypeOf('boolean');
        expect(await firstValueFrom(underline.activated$!.pipe(take(1)))).toBeTypeOf('boolean');
        expect(await firstValueFrom(strike.activated$!.pipe(take(1)))).toBeTypeOf('boolean');
        expect(await firstValueFrom(fontFamily.value$!.pipe(take(1)))).toBeTypeOf('string');
        expect(await firstValueFrom(fontFamily.disabled$!.pipe(take(1)))).toBeTypeOf('boolean');
    });

    it('resolves color/alignment/wrap/rotation selector streams', async () => {
        const injector = get(Injector);
        const textColor = injector.invoke(TextColorSelectorMenuItemFactory);
        const bgColor = injector.invoke(BackgroundColorSelectorMenuItemFactory);
        const horizontal = injector.invoke(HorizontalAlignMenuItemFactory);
        const vertical = injector.invoke(VerticalAlignMenuItemFactory);
        const wrap = injector.invoke(WrapTextMenuItemFactory);
        const rotate = injector.invoke(TextRotateMenuItemFactory);

        const textColorSelections = textColor.selections as any[];
        const bgColorSelections = bgColor.selections as any[];

        expect(await firstValueFrom(textColor.value$!.pipe(take(1)))).toBeTypeOf('string');
        expect(await firstValueFrom(textColorSelections[0].value$!.pipe(take(1)))).toBeTypeOf('string');
        expect(await firstValueFrom(bgColor.value$!.pipe(take(1)))).toBeTypeOf('string');
        expect(await firstValueFrom(bgColorSelections[0].value$!.pipe(take(1)))).toBeTypeOf('string');
        expect(await firstValueFrom(horizontal.value$!.pipe(take(1)))).not.toBeUndefined();
        expect(await firstValueFrom(vertical.value$!.pipe(take(1)))).not.toBeUndefined();
        expect(await firstValueFrom(wrap.value$!.pipe(take(1)))).not.toBeUndefined();
        expect(await firstValueFrom(rotate.value$!.pipe(take(1)))).not.toBeUndefined();
    });
});
