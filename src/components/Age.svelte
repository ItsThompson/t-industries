<script lang="ts">
    import { calculateAge } from '$lib/identity';

    export let floored = false;

    $: age = floored ? calculateAge({ floored: true }) : calculateAge();
</script>

{age}
