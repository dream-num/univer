import { FormulaActionExtensionFactory } from './ActionExtension';

import { ActionExtensionManager } from './ActionExtensionManager';

const register = ActionExtensionManager.create();

register.add(
    // new FormatActionExtensionFactory(),
    new FormulaActionExtensionFactory()
);
