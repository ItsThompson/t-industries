<script lang="ts">
    export let github: string;
    export let website: string = "";
    export let name: string;
    export let desc: string = "";
    export let language: string = "";
    export let languageColor: string = "";

    import Badge from "./Badge.svelte";
</script>

<div>
    <h5 class="text-lg font-bold">{name}</h5>
    <Badge href={github} name="GitHub"/>
    {#if website}
        <Badge href={website} name="Website"/>
    {/if}
    {#if language}
        <div class="flex items-center gap-1.5 my-1">
            <span
                class="inline-block w-3 h-3 rounded-full"
                style="background-color: {languageColor}"
            ></span>
            <span class="text-xs text-gray-300">{language}</span>
        </div>
    {/if}
    <p class="text-sm">
        {desc}
    </p>
</div>
