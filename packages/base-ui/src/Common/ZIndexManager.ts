export class ZIndexManager {
    private _list: Map<string, string> = new Map();

    setIndex(name: string, value: string) {
        this._list.set(name, value);
    }

    getIndex(name: string) {
        return this._list.get(name);
    }

    removeIndex(name: string) {
        this._list.delete(name);
    }

    getMaxIndex() {
        let max = -9999999;
        this._list.forEach((item) => {
            if (+item > max) {
                max = +item;
            }
        });
        return max;
    }
}
