<script lang="ts">
    export let href: string;
    export let name: string;
    export let desc: string = "";

    import Badge from "./Badge.svelte";
</script>

<div>
    <h5 class="text-lg font-bold">{name}</h5>
    <Badge {href} name="GitHub"/>
    <p class="text-sm">
        {desc}
    </p>
</div>
