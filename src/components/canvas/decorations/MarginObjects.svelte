<script lang="ts">
    import { base } from '$app/paths';

    const objectIds = ['skateboard', 'fidget-cube', 'rubiks-cube', 'electric-guitar', 'keyboard'];
</script>

<div class="margin-objects" aria-hidden="true">
    {#each objectIds as objectId (objectId)}
        <img
            class={objectId}
            src="{base}/decorations/{objectId}.svg"
            alt=""
            width="160"
            height="160"
            loading="lazy"
            fetchpriority="low"
            decoding="async"
            draggable="false"
        />
    {/each}
</div>

<style>
    .margin-objects {
        /* Anchor to the full page so the objects sit outside the text column. */
        position: absolute;
        inset: 0;
        pointer-events: none;
        user-select: none;
    }

    img {
        position: absolute;
        display: block;
        width: var(--size);
        height: auto;
        aspect-ratio: 1;
        transform: rotate(var(--tilt));
    }

    .skateboard { left: calc(50% - 522px); top: 28%; --size: 130px; --tilt: -5deg; }
    .fidget-cube { left: calc(50% + 395px); top: 45%; --size: 115px; --tilt: -10deg; }
    .rubiks-cube { left: calc(50% - 521px); top: 60%; --size: 116px; --tilt: 10deg; }
    .electric-guitar { left: calc(50% - 533px); top: 72%; --size: 144px; --tilt: -9deg; }
    .keyboard { left: calc(50% + 386px); top: 85%; --size: 134px; --tilt: 12deg; }

    @media (max-width: 1080px) {
        .margin-objects {
            position: static;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-top: 30px;
        }

        img {
            position: static;
            width: calc((100% - 48px) / 5);
            max-width: 116px;
        }
    }
</style>
