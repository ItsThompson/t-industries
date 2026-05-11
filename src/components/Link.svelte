<script lang="ts">
    export let href: string;
    export let name: string;
    export let classes: string = "";
</script>

<a
    class="label-sm text-white hover:text-primary transition-colors duration-150 {classes}"
    {href}
    target="_blank"
    rel="noopener noreferrer"
>{name} <span class="text-secondary-200">&#8599;</span></a>
