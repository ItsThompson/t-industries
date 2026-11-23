<script lang="ts">
    import { base } from '$app/paths';

    const objectIds = ['macbook', 'dumbbell', 'beagle', 'brain', 'headphones'];
</script>

<div class="intro-composition">
    <div class="opening-objects" aria-hidden="true">
        {#each objectIds as objectId (objectId)}
            <img
                class={objectId}
                src="{base}/decorations/{objectId}.svg"
                alt=""
                width="160"
                height="160"
                loading="eager"
                fetchpriority="low"
                decoding="async"
                draggable="false"
            />
        {/each}
    </div>
    <slot />
</div>

<style>
    .intro-composition {
        position: relative;
        min-height: 332px;
        display: grid;
        place-items: center;
        margin-bottom: 34px;
    }

    .opening-objects {
        position: absolute;
        inset: 0 clamp(-30px, calc((768px - 100vw) / 2), 0px);
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

    .macbook { left: 0; top: 23px; --size: 146px; --tilt: -16deg; }
    .dumbbell { right: 0; bottom: 13px; --size: 148px; --tilt: -24deg; }
    .beagle { right: 4%; top: 12px; --size: 126px; --tilt: 12deg; }
    .brain { left: 4%; bottom: 12px; --size: 112px; --tilt: 14deg; }
    .headphones { left: calc(50% - 49px); top: -14px; --size: 98px; --tilt: -12deg; }

    @media (max-width: 720px) {
        .intro-composition { min-height: 350px; }
        .opening-objects { inset: 0; }
        .macbook { left: -5px; top: 20px; --size: 108px; }
        .beagle { right: 0; top: 11px; --size: 94px; }
        .brain { left: 3%; bottom: 15px; --size: 88px; }
        .dumbbell { right: 0; bottom: 4px; --size: 112px; }
        .headphones { left: calc(50% - 38px); top: 0; --size: 76px; }
    }
</style>
