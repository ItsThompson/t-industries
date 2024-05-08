<script lang="ts">
    export let href: string;
    export let name: string;
</script>

<link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
/>

<a
    class="underline hover:no-underline"
    {href}
    target="_blank"
    rel="noopener noreferrer"
    >{name}<span class="material-symbols-outlined">link</span>
</a>
