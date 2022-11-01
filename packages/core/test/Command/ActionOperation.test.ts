import { IActionData } from '../../src';
import { ActionOperation } from '../../src/Command/ActionOperation';

test('ActionOperation case1', () => {
    const operation1 = ActionOperation.make<IActionData>({
        sheetId: 'sheet1',
        actionName: 'testAction',
    });
    expect(ActionOperation.hasObserver(operation1.getAction())).toBeTruthy();
    expect(ActionOperation.hasUndo(operation1.getAction())).toBeTruthy();
    expect(ActionOperation.hasCollaboration(operation1.getAction())).toBeTruthy();

    const operation2 = ActionOperation.make({
        sheetId: 'sheet1',
        actionName: 'testAction',
    })
        .removeUndo()
        .removeObserver();
    expect(ActionOperation.hasUndo(operation2.getAction())).toBeFalsy();
    expect(ActionOperation.hasObserver(operation2.getAction())).toBeFalsy();
    expect(ActionOperation.hasCollaboration(operation1.getAction())).toBeTruthy();
});
