import { Operation } from '../../src/Command/Operation';

test('operation case1', () => {
    const operation1 = Operation.make({
        sheetId: 'sheet1',
        actionName: 'testAction',
    });
    expect(Operation.hasObserver(operation1.getAction())).toBeTruthy();
    expect(Operation.hasUndo(operation1.getAction())).toBeTruthy();
    expect(Operation.hasCollaboration(operation1.getAction())).toBeTruthy();

    const operation2 = Operation.make({
        sheetId: 'sheet1',
        actionName: 'testAction',
    })
        .removeUndo()
        .removeObserver();
    expect(Operation.hasUndo(operation2.getAction())).toBeFalsy();
    expect(Operation.hasObserver(operation2.getAction())).toBeFalsy();
    expect(Operation.hasCollaboration(operation1.getAction())).toBeTruthy();
});
