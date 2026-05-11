<script lang="ts">
    import { onMount } from 'svelte';
    import Loading from './Loading.svelte';
    import { RND_API_ENDPOINT } from '$lib/bio';

    let items: string[] = [];
    let error = false;

    onMount(() => {
        fetch(RND_API_ENDPOINT)
            .then((response) => response.json())
            .then((data) => {
                items = data;
            })
            .catch((err) => {
                console.error('Failed to fetch R&D list:', err);
                error = true;
            });
    });
</script>

{#if error}
    <p class="text-sm font-mono text-secondary-200">
        R&D data unavailable.
    </p>
{:else if items.length > 0}
    <ul class="space-y-1">
        {#each items as item}
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
