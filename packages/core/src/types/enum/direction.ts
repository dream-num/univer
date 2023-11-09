export enum Direction {
    UP,
    RIGHT,
    DOWN,
    LEFT,
}

export function getReverseDirection(direction: Direction): Direction {
    switch (direction) {
        case Direction.LEFT:
            return Direction.RIGHT;
        case Direction.RIGHT:
            return Direction.LEFT;
        case Direction.UP:
            return Direction.DOWN;
        case Direction.DOWN:
            return Direction.UP;
    }
}
