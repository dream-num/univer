import { CommandManager, Range, SetWorkSheetActivateAction } from '@univerjs/core';
import { Layer } from '@univerjs/base-render';
import { EditTooltips, EditTooltipsProps } from '../View/Views';
import { SheetPlugin } from '../SheetPlugin';

export class EditTooltipsController {
    _editTooltipsPage: Map<string, Map<string, EditTooltips>>;

    _plugin: SheetPlugin;

    _layer: Layer;

    constructor(plugin: SheetPlugin) {
        this._plugin = plugin;
        this._editTooltipsPage = new Map();
        CommandManager.getActionObservers().add((event) => {
            const data = event.data;
            if (data.actionName === SetWorkSheetActivateAction.name) {
                this.refreshEditTooltips();
            }
        });
    }

    removeEditTooltipsByKey(key: string): EditTooltips | null {
        for (const sheetPage of this._editTooltipsPage) {
            for (const editTooltips of sheetPage[1]) {
                if (editTooltips[0] === key) {
                    sheetPage[1].delete(key);
                    return editTooltips[1];
                }
            }
        }
        return null;
    }

    createIfEditTooltips(key: string, sheetId: string, props: EditTooltipsProps = {}): EditTooltips {
        let sheetPage = this._editTooltipsPage.get(sheetId);
        if (sheetPage != null) {
            if (sheetPage.has(key)) {
                return sheetPage.get(key) as EditTooltips;
            }
        } else {
            sheetPage = new Map<string, EditTooltips>();
            this._editTooltipsPage.set(sheetId, sheetPage);
        }
        let editTooltips = this.removeEditTooltipsByKey(key);
        if (editTooltips == null) {
            editTooltips = new EditTooltips(key, props);
        }
        sheetPage.set(key, editTooltips);
        return editTooltips;
    }

    setText(key: string, sheetId: string, text: string): void {
        const editTooltips = this.createIfEditTooltips(key, sheetId);
        editTooltips.setText(text);
    }

    setBorderColor(key: string, sheetId: string, color: string): void {
        const editTooltips = this.createIfEditTooltips(key, sheetId);
        editTooltips.setBorderColor(color);
    }

    setRowColumn(key: string, sheetId: string, row: number, column: number): void {
        const sheet = this._plugin.getContext().getUniver().getCurrentUniverSheetInstance().getWorkBook().getSheetBySheetId(sheetId);
        const editTooltips = this.createIfEditTooltips(key, sheetId);
        if (sheet) {
            let merges = sheet.getMerges().getByRowColumn(row, column);
            let rowTitle = sheet.getConfig().rowTitle;
            let columnTitle = sheet.getConfig().columnTitle;
            let left = rowTitle.width ?? 0;
            let top = columnTitle.height ?? 0;
            let height = 0;
            let width = 0;
            if (merges) {
                let merge = merges[0];
                Range.foreach(merge, (row, column) => {
                    height += sheet.getRowHeight(row);
                    width += sheet.getColumnWidth(column);
                });
            } else {
                height = sheet.getRowHeight(row);
                width = sheet.getColumnWidth(column);
            }
            for (let i = 0; i < column; i++) {
                left += sheet.getColumnWidth(i);
            }
            for (let i = 0; i < row; i++) {
                top += sheet.getRowHeight(i);
            }
            editTooltips.setLeft(left);
            editTooltips.setTop(top);
            editTooltips.setWidth(width);
            editTooltips.setHeight(height);
        }
    }

    refreshEditTooltips(): void {
        const sheet = this._plugin.getContext().getUniver().getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
        const sheetPage = this._editTooltipsPage.get(sheet.getSheetId());
        const scene = this._plugin.getMainScene();
        if (scene) {
            if (this._layer == null) {
                this._layer = new Layer(scene, [], 3);
                scene.addLayer(this._layer);
            }
            this._layer.clear();
            if (sheetPage) {
                sheetPage.forEach((editTooltips) => {
                    this._layer.addObject(editTooltips);
                });
                scene.makeDirty(true);
            }
        }
    }
}
