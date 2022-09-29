/**
 * @jest-environment jsdom
 */
import { ACTION_NAMES } from '../../../../src';
import { ActionObservers } from '../../../../src/Command';
import { DeleteBandingAction } from '../../../../src/Module/Banding/Action';
import { TestInit } from '../../../ContainerStartUp';
import { bandedRange } from '../Banding.test';

test('Delete Banding Action Test', () => {
    const { workbook, worksheet } = TestInit({ bandedRanges: [bandedRange] });
    new DeleteBandingAction(
        {
            sheetId: worksheet.getSheetId(),
            actionName: ACTION_NAMES.DELETE_BANDING_ACTION,
            bandedRangeId: bandedRange.bandedRangeId,
        },
        workbook,
        new ActionObservers()
    );
});
