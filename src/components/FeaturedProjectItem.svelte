<script lang="ts">
    export let github: string;
    export let website: string = "";
    export let name: string;
    export let desc: string = "";

    import Badge from "./Badge.svelte";
</script>

<div>
    <h5 class="text-lg font-bold">{name}</h5>
    <Badge href={github} name="GitHub"/>
    {#if website}
        <Badge href={website} name="Website"/>
    {/if}
    <p class="text-sm">
        {desc}
    </p>
</div>
