import type { PhraseAction } from './types';

export interface TriggerDescriptor {
    element: 'a' | 'span';
    attributes: { href: string } | { tabindex: number };
    role: 'button' | undefined;
}

const BUTTON: TriggerDescriptor = {
    element: 'span',
    attributes: { tabindex: 0 },
    role: 'button',
};

const REVEAL: TriggerDescriptor = {
    element: 'span',
    attributes: { tabindex: 0 },
    role: undefined,
};

function link(href: string): TriggerDescriptor {
    return { element: 'a', attributes: { href }, role: undefined };
}

export function triggerFor(action: PhraseAction): TriggerDescriptor {
    switch (action.kind) {
        case 'navigate':
            return link(action.href);
        case 'activate':
            return BUTTON;
        case 'describe':
            return REVEAL;
    }
}
