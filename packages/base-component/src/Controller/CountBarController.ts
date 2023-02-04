import { BaseComponentPlugin } from '..';
import { CountBar } from '../UI/CountBar';

export class CountBarController {
    private _plugin: BaseComponentPlugin;

    private _countBar: CountBar;

    constructor(plugin: BaseComponentPlugin) {
        this._plugin = plugin;
    }

    // 获取CountBar组件
    getComponent = (ref: CountBar) => {
        this._countBar = ref;
        // this.setCountBar()
    };

    // changeRatio
    changeRatio(ratio: string) {}

    // 刷新组件
    setCountBar(content: string) {
        this._countBar.setValue({
            content,
        });
    }
}
