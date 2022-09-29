/**
 * @jest-environment jsdom
 */
import { ACTION_NAMES } from '../../../../src';
import { ActionObservers } from '../../../../src/Command';
import { SetBandingAction } from '../../../../src/Module/Banding/Action';
import { TestInit } from '../../../ContainerStartUp';
import { bandedRange, newBandedRange } from '../Banding.test';

test('Set Banding Action Test', () => {
    const { workbook, worksheet } = TestInit({ bandedRanges: [bandedRange] });

    new SetBandingAction(
        {
            sheetId: worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_BANDING_ACTION,
            bandedRange: newBandedRange,
        },
        workbook,
        new ActionObservers()
    );
});
