<script lang="ts">
    import { onMount } from 'svelte';

    /** Id of the element that names the dialog. */
    export let titleId: string;
    export let onClose: () => void;
    /**
     * Whether closing returns focus to whatever opened the modal. Pointer users
     * do not need it, and it would leave the trigger looking selected.
     */
    export let restoreFocus = true;
    /** Panel width, so a picture can open wider than a text panel. */
    export let sizeClass = 'max-w-5xl';

    const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    let panel: HTMLDivElement;
    let closeButton: HTMLButtonElement;
    let previouslyFocused: HTMLElement | null = null;

    onMount(() => {
        previouslyFocused =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
        closeButton?.focus();

        const returnTo = restoreFocus ? previouslyFocused : null;

        return () => {
            returnTo?.focus();
        };
    });

    function focusableElements(): HTMLElement[] {
        if (!panel) return [];
        return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
            (element) => !element.hasAttribute('disabled')
        );
    }

    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            event.preventDefault();
            onClose();
            return;
        }

        if (event.key !== 'Tab') return;

        const elements = focusableElements();
        if (elements.length === 0) return;

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
            return;
        }

        if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div
        class="absolute inset-0 bg-black/85"
        role="presentation"
        on:click={onClose}
        data-modal-backdrop
    ></div>

    <div
        bind:this={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        class="relative w-full {sizeClass} max-h-[90dvh] overflow-y-auto overscroll-contain border border-secondary-200 bg-black"
    >
        <div class="flex items-start justify-between gap-4 border-b border-secondary-200 p-3">
            <div>
                <slot name="heading" />
            </div>
            <button
                bind:this={closeButton}
                type="button"
                on:click={onClose}
                class="label-sm shrink-0 border border-secondary-200 px-2 py-1 text-secondary-100 transition-colors duration-150 hover:border-primary hover:text-primary"
            >
                CLOSE [ESC]
            </button>
        </div>

        <slot />
    </div>
</div>
