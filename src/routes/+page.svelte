<script lang="ts">
    import Age from "../components/Age.svelte";
    import Link from "../components/Link.svelte";
</script>

<div
    class="w-11/12 md:w-1/2 lg:w-2/5 2xl:w-1/3
border p-5 flex flex-col items-center gap-5"
>
    <div class="self-start">
        <h4 class="text-xl">
            <span class="font-bold">Thompson Tong</span>
            <span class="text-xs">(<Age /> years old)</span>
        </h4>
        <p class="text-sm">
            Software Developer
            <!-- <span class="text-xs invisible"> -->
            <!--     Kind of offensive to tie me down to a single role... I'll let it -->
            <!--     slide.</span -->
            <!-- > -->
        </p>
        <p class="text-sm">First Year at the University of Bath</p>
    </div>

    <div>
        <Link href="https://github.com/ItsThompson" name="GitHub" />
    </div>
</div>
