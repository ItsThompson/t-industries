<script lang="ts">
    import { ETHOS_ITEMS } from '$lib/ethos';
</script>

<div class="w-4/5 border bg-black p-5 flex flex-col items-center gap-5">
    <div class="flex flex-col items-center gap-2">
        <h1 class="font-bold text-2xl underline">Ethos</h1>
        <div class="grid grid-cols-12 items-center gap-3">
            <h3 class="hidden md:inline text-lg font-bold col-span-2">title.</h3>
            <h3 class="hidden md:inline text-lg font-bold col-span-4">desc.</h3>
            <h3 class="hidden md:inline text-lg font-bold col-span-6">walking the walk.</h3>
            {#each ETHOS_ITEMS as item}
                <h5 class="text-base col-span-12 md:col-span-2 underline md:no-underline">{item.title}.</h5>
                <p class="text-xs col-span-12 md:col-span-4">
                    {item.description}
                </p>
                <p class="text-xs col-span-12 md:col-span-6">
                    {item.walkingTheWalk}
                </p>
            {/each}
        </div>
    </div>
</div>
