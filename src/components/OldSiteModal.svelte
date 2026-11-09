<script lang="ts">
    import Modal from './Modal.svelte';
    import type { OldSiteSpec } from '$lib/bio-links';

    export let action: OldSiteSpec;
    export let onClose: () => void;
    export let restoreFocus = true;

    const TITLE_ID = 'old-site-title';

    const WARNING =
        'WARNING: The video never loads, the bullet points are awkward, and the contact page is broken. All features, not bugs :D.';
</script>

<Modal titleId={TITLE_ID} {onClose} {restoreFocus}>
    <span slot="heading">
        <p class="label-xs text-secondary-200">{action.label.toUpperCase()}</p>
        <h2 id={TITLE_ID} class="display-md mt-1">{action.heading}</h2>
    </span>

    <!-- The warning sits above the frame, not inside a panel, and the frame is
         created when the modal opens so the live copy is fetched on demand. -->
    <p role="note" class="px-3 py-2 text-yellow-300">{WARNING}</p>

    <iframe
        src={action.url}
        title={action.heading}
        sandbox="allow-scripts allow-popups"
        referrerpolicy="no-referrer"
        class="block h-[70dvh] w-full border-0 border-t border-t-secondary-200 bg-black"
    ></iframe>
</Modal>
