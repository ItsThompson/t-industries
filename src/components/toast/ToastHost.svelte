<script lang="ts">
    import { fly } from 'svelte/transition';
    import { dismissToast, toasts } from '$lib/toasts';
    import { prefersReducedMotion } from '$lib/deep-links';
    import { TOAST_VARIANTS } from './toast-variants';

    $: animation = prefersReducedMotion() ? { y: 0, duration: 0 } : { y: 16, duration: 200 };

    function handleKeydown(event: KeyboardEvent): void {
        if (event.key !== 'Escape') return;

        const newest = $toasts[$toasts.length - 1];
        if (!newest) return;

        event.preventDefault();
        dismissToast(newest.id);
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<div
    aria-live="polite"
    class="pointer-events-none w-full px-4 pb-2 md:fixed md:bottom-6 md:right-6 md:z-[100] md:w-auto md:px-0 md:pb-0"
>
    {#each $toasts as toast (toast.id)}
        <div
            data-toast={toast.kind}
            class="pointer-events-auto w-full md:w-80"
            transition:fly={animation}
        >
            <svelte:component
                this={TOAST_VARIANTS[toast.kind]}
                onDismiss={() => dismissToast(toast.id)}
            />
        </div>
    {/each}
</div>
