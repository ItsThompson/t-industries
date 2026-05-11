<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import Loading from './Loading.svelte';
    import { RND_API_ENDPOINT } from '$lib/bio';

    let items = writable<string[]>([]);
    let error = writable(false);

    onMount(() => {
        fetch(RND_API_ENDPOINT)
            .then((response) => response.json())
            .then((data) => {
                items.set(data);
            })
            .catch((err) => {
                console.error('Failed to fetch R&D list:', err);
                error.set(true);
            });
    });
</script>

{#if $error}
    <p class="text-sm font-mono text-secondary-200">
        R&D data unavailable.
    </p>
{:else if $items.length > 0}
    <ul class="space-y-1">
        {#each $items as item}
            <li class="text-sm font-mono text-secondary-100">
                <span class="text-primary mr-2">▸</span>{item}
            </li>
        {/each}
    </ul>
{:else}
    <div class="text-center py-4">
        <Loading />
    </div>
{/if}
