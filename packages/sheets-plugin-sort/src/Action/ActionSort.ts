import { Tools } from '@univerjs/core';

export class ActionSort {
    orderbydata(data: any, index: number, isAsc: boolean = true) {
        let a = (x: any, y: any) => {
            let x1 = x[index];
            let y1 = y[index];

            if (Tools.isObject(x[index])) {
                x1 = x[index].v;
            }

            if (Tools.isObject(y[index])) {
                y1 = y[index].v;
            }

            if (Tools.isBlank(x1)) {
                return 1;
            }

            if (Tools.isBlank(y1)) {
                return -1;
            }
            if (Tools.isDate(x1) && Tools.isDate(y1)) {
                return diff(x1, y1);
            }
            if (Tools.isNumber(x1) && Tools.isNumber(y1)) {
                return Number(x1) - Number(y1);
            }
            if (!Tools.isNumber(x1) && !Tools.isNumber(y1)) {
                return x1.localeCompare(y1, 'zh');
            }
            if (!Tools.isNumber(x1)) {
                return 1;
            }
            if (!Tools.isNumber(y1)) {
                return -1;
            }
        };

        let d = (x: any, y: any) => {
            let x1 = x[index];
            let y1 = y[index];

            if (Tools.isObject(x[index])) {
                x1 = x[index].v;
            }

            if (Tools.isObject(y[index])) {
                y1 = y[index].v;
            }

            if (Tools.isBlank(x1)) {
                return 1;
            }

            if (Tools.isBlank(y1)) {
                return -1;
            }

            if (Tools.isDate(x1) && Tools.isDate(y1)) {
                return diff(x1, y1);
            }
            if (Tools.isNumber(x1) && Tools.isNumber(y1)) {
                return Number(y1) - Number(x1);
            }
            if (!Tools.isNumber(x1) && !Tools.isNumber(y1)) {
                return y1.localeCompare(x1, 'zh');
            }
            if (!Tools.isNumber(x1)) {
                return -1;
            }
            if (!Tools.isNumber(y1)) {
                return 1;
            }
        };

        if (isAsc) {
            return data.sort(a);
        }
        return data.sort(d);
    }
}

function diff(x1: Date, y1: Date) {}
