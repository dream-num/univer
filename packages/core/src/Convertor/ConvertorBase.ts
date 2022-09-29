/**
 * Action converter base class
 */
export abstract class ConvertorBase {
    // 操作 remove / insertAndUpdate
    operation: string;

    // workbook/WorkSheet
    type: string;

    value?: string;

    // key/value 可选
    key?: string;

    // workbook/WorkSheet 节点中的属性
    attribute: string;

    constructor(
        operation: string,
        type: string,
        attribute: string,
        key?: string,
        value?: string
    ) {
        this.operation = operation;
        this.type = type;
        this.attribute = attribute;
        this.key = key;
        this.value = value;
    }

    getData(): object {
        return this.toJSON();
    }

    toJSON(): object {
        return {
            operation: this.operation,
            key: this.key,
            value: this.value,
            type: this.type,
            attribute: this.attribute,
        };
    }
}
