/**
 * @jest-environment jsdom
 */
import { ACTION_NAMES } from '../../../../src';
import { ActionObservers } from '../../../../src/Command';
import { AddBandingAction } from '../../../../src/Module/Banding/Action';
import { TestInit } from '../../../ContainerStartUp';
import { bandedRange } from '../Banding.test';

test('Add Banding Action Test', () => {
    const { workbook, worksheet } = TestInit();

    new AddBandingAction(
        {
            sheetId: worksheet.getSheetId(),
            actionName: ACTION_NAMES.ADD_BANDING_ACTION,
            bandedRange,
        },
        workbook,
        new ActionObservers()
    );
});
