import { Plugin, RangeList, Tools } from '@univer/core';
import { SheetPlugin } from '../SheetPlugin';
import { CountBar } from '../View/UI/CountBar';

class APIController {
    private _master: CountBarController;

    constructor(master: CountBarController) {
        this._master = master;
    }
}

class UIController {
    private _master: CountBarController;

    private _countBar: CountBar;

    private _initialize(): void {
        const plugin = this._master.getPlugin() as SheetPlugin;
        const context = plugin.getContext();
        const workbook = context.getWorkBook();

        this._countBar.setState({
            onChange: (v: any) => {
                workbook.getActiveSheet().setZoomRatio(Tools.numberFixed(v / 100, 2));
            },
        });
    }

    private _totalRangeList(rangeList: RangeList): void {
        let rectList = rangeList.getRangeList();
        let recList: string[] = [];
        let plugin = this._master.getPlugin() as SheetPlugin;
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

    private _initializeSelectedObserver(): void {
        const plugin = this._master.getPlugin() as SheetPlugin;
        const manager = plugin.getSelectionManager();
        plugin.getObserver('onChangeSelectionObserver')?.add(() => {
            const rangeList = manager.getActiveRangeList();
            if (rangeList) {
                this._totalRangeList(rangeList);
            }
        });
    }

    constructor(master: CountBarController) {
        this._master = master;
        const context = master.getPlugin().getContext();
        const manager = context.getObserverManager();
        manager.requiredObserver<CountBar>('onCountBarDidMountObservable').add((countBar: CountBar) => {
            this._countBar = countBar;
            this._initialize();
        });
        context.getContextObserver('onAfterChangeActiveSheetObservable').add(() => {
            const zoomRatio = context.getWorkBook().getActiveSheet().getZoomRatio();
            this._countBar.setZoom(Math.trunc(zoomRatio * 100));
        });
        context.getContextObserver('onSheetRenderDidMountObservable').add(() => {
            this._initializeSelectedObserver();
        });
        context.getContextObserver('onZoomRatioSheetObservable').add((value) => {
            this._countBar.setZoom(Math.trunc(value.zoomRatio * 100));
        });
    }
}

export class CountBarController {
    private _plugin: Plugin;

    private _uiController: UIController;

    private _apiController: APIController;

    constructor(plugin: Plugin) {
        this._plugin = plugin;
        this._uiController = new UIController(this);
        this._apiController = new APIController(this);
    }

    getPlugin(): Plugin {
        return this._plugin;
    }

    getUIController(): UIController {
        return this._uiController;
    }

    getAPIController(): APIController {
        return this._apiController;
    }
}
