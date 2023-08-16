import { OverGridImagePlugin } from '../ImagePlugin';

export function SetImageType(plugin: OverGridImagePlugin, sheetId: string, id: string, type: string): string {
    let options = plugin.getConfig();
    let property = options.value;
    let find = null;
    for (let i = 0; i < property.length; i++) {
        let element = property[i];
        if (element.sheetId === sheetId && id === element.id) {
            find = element;
            break;
        }
    }
    if (find) {
        const old = find.type;
        find.type = type;
        return old;
    }
    return String();
}
