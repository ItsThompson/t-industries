import type { PhraseAction } from './types';

export interface TriggerDescriptor {
    element: 'a' | 'span';
    attributes: { href: string } | { tabindex: number };
    /* Only an in-place action needs to announce itself as a button. An anchor is
       already a link, and a reveal-only phrase has no role to claim. */
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

export function triggerFor(action: PhraseAction): TriggerDescriptor {
    switch (action.kind) {
        case 'navigate':
            return { element: 'a', attributes: { href: action.href }, role: undefined };
        case 'activate':
            return BUTTON;
        case 'describe':
            return REVEAL;
    }
}
