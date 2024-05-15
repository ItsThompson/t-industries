<script lang="ts">
    export let href: string;
    export let name: string;
</script>

<a {href} target="_blank" rel="noopener noreferrer" class="my-1">
    <span
        class="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300"
        >{name} &#128279;
    </span>
</a>
