import { Fragment, reactive, Teleport, markRaw, defineComponent, h } from "vue";

let active = false;
const items = reactive<{ [key: string]: any }>({});

export function connect(
    id: string | number,
    component: any,
    container: HTMLDivElement,
    props: Record<string, any>
) {
    if (active) {
        items[id] = markRaw(
            defineComponent({
                render: () =>
                    h(Teleport, { to: container } as any, [
                        h(component, props),
                    ]),
            })
        );
    }
}

export function disconnect(id: string | number) {
    if (active) {
        delete items[id];
    }
}

export function getTeleport(): any {
    active = true;

    return defineComponent({
        setup() {
            return () =>
                h(
                    Fragment,
                    {},
                    Object.keys(items).map((id) => h(items[id]))
                );
        },
    });
}
