import { IToolbarItemProps, SheetContainerUIController } from '@univerjs/ui-plugin-sheets';
import { Inject } from '@wendellhu/redi';
import { ComponentManager, Icon } from '@univerjs/base-ui';
import { FIND_PLUGIN_NAME } from '../Const/PLUGIN_NAME';
import { FindModalController } from './FindModalController';

export class FindController {
    private _findList: IToolbarItemProps;

    constructor(
        @Inject(FindModalController) private _findModalController: FindModalController,
        @Inject(SheetContainerUIController) private _uiController: SheetContainerUIController,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        this._findList = {
            name: FIND_PLUGIN_NAME,
            toolbarType: 1,
            tooltip: 'find.findLabel',
            label: {
                name: 'SearchIcon',
            },
            show: true,
            onClick: () => {
                this._findModalController.showModal(true);
            },
        };
        this._componentManager.register('SearchIcon', Icon.SearchIcon);
        const toolbar = this._uiController.getToolbarController();
        toolbar.addToolbarConfig(this._findList);
        toolbar.setToolbar();
    }

    getFindList() {
        return this._findList;
    }
}
