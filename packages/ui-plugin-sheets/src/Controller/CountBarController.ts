import { RangeList, Plugin, Tools } from '@univerjs/core';
import { CountBar } from '../UI/CountBar';

export class CountBarController {
    protected _plugin: Plugin;

    protected _countBar: CountBar;

    protected _initialize(): void {
        const plugin = this._plugin;
        const context = plugin.getContext();
        const workbook = context.getWorkBook();

        this._countBar.setState({
            onChange: (v: any) => {
                workbook.getActiveSheet().setZoomRatio(Tools.numberFixed(v / 100, 2));
            },
        });
    }

    protected _initializeSelectedObserver(): void {
        const plugin = this._plugin;
        const manager = plugin.getSelectionManager();
        plugin.getObserver('onChangeSelectionObserver')?.add(() => {
            const rangeList = manager.getActiveRangeList();
            if (rangeList && this._countBar) {
                this._totalRangeList(rangeList);
            }
        });
    }

    protected _totalRangeList(rangeList: RangeList): void {
        let rectList = rangeList.getRangeList();
        let recList: string[] = [];
        let plugin = this._plugin;
        let context = plugin.getContext();
        let workbook = context.getWorkBook();
        let worksheet = workbook.getActiveSheet();
        let cellMatrix = worksheet.getCellMatrix();
        let avg = 0;
        let total = 0;
        let count = 0;
        for (let i = 0; i < rectList.length; i++) {
            let rect = rectList[i];
            for (let r = rect.startRow; r <= rect.endRow; r++) {
                for (let c = rect.startColumn; c <= rect.endColumn; c++) {
                    if (recList.includes(`${r}${c}`)) {
                        continue;
                    }
                    const cell = cellMatrix.getValue(r, c);
                    if (cell) {
                        let value = parseFloat(cell.v as string);
                        // eslint-disable-next-line no-restricted-globals
                        if (!isNaN(value)) {
                            count += 1;
                            total += value;
                        }
                    }
                    recList.push(`${r}${c}`);
                }
            }
        }
        if (count > 0) {
            avg = total / count;
        }
        this._countBar.setState({
            content: `平均数：${Tools.numberFixed(avg, 2)} 计数：${Tools.numberFixed(total, 2)} 数量：${count}`,
        });
    }

    constructor(plugin: Plugin) {
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
