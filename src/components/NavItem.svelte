<script lang="ts">
    export let href: string;
    export let isThisPage: boolean = false;
    export let text: string;

    $: textColor = isThisPage ? "text-primary" : "";
</script>
<li>
    <a
        href="{href}"
        class="block py-2 px-3 rounded {textColor} hover:text-primary"
        >{text}</a
    >
</li>
