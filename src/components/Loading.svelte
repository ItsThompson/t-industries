<script lang="ts">
    import { onMount } from "svelte";

    let loadingText: string = "Loading";

    onMount(() => {
        let dots: string = "";
        let interval = setInterval(() => {
            if (dots.length < 3) {
                dots += ".";
            } else {
                dots = "";
            }
            loadingText = `Loading${dots}`;
        }, 500);

        return () => {
            clearInterval(interval);
        };
    });
</script>

<p class="font-bold">{loadingText}</p>
