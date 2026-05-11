<script lang="ts">
    import { page } from "$app/stores";

    export let href: string;
    export let text: string;

    $: textColor = href == $page.url.pathname ? "text-primary" : "";
</script>

<li>
    <a
        {href}
        class="block py-2 px-3 rounded {textColor} hover:text-primary text-sm lowercase tracking-wider"
        >{text}</a
    >
</li>
