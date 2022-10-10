/**
 * @jest-environment jsdom
 */
import { IOCContainerStartUpReady } from '../../../ContainerStartUp';
import { AddAllowedAction } from '../../../../src/Module/Protection/Action';
import { Allowed } from '../../../../src/Module/Protection';
import { Context } from '../../../../src/Basics';
import { Workbook1, Worksheet1, Range } from '../../../../src/Sheets/Domain';
import { ActionObservers } from '../../../../src/Command';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Add Allowed Action Test', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook1>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new Worksheet1(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const allowedRange = new Range(worksheet, {
        startRow: 0,
        startColumn: 0,
        endRow: 0,
        endColumn: 0,
    });
    const addAllowedAction = new AddAllowedAction(
        {
            sheetId: worksheet.getSheetId(),
            actionName: 'addAllowedAction',
            allowed: new Allowed('123456', allowedRange),
        },
        workbook,
        new ActionObservers()
    );
});
