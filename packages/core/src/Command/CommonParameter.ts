export class CommonParameter {
    cursor: number;

    reset() {
        this.cursor = 0;
        return this;
    }

    moveCursor(pos: number) {
        this.cursor += pos;
    }
}
