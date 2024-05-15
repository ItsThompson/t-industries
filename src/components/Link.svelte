<script lang="ts">
    export let href: string;
    export let name: string;
    export let classes: string = "";
</script>

<a
    class="underline hover:no-underline {classes}"
    {href}
    target="_blank"
    rel="noopener noreferrer"
    >{name} &#128279;
</a>
