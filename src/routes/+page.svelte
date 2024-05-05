<script>
    import Age from "../components/Age.svelte";
</script>

<div class="w-4/5 border p-5 flex flex-col items-center gap-5">
    <div class="self-start">
        <h4 class="text-xl">
            <span class="font-bold">Thompson Tong</span>
            <span class="text-xs">(<Age /> years old)</span>
        </h4>
        <p class="text-sm">Software Developer</p>
        <p class="text-sm">First Year at the University of Bath</p>
    </div>
    <div class="flex flex-col items-center gap-2">
        <h1 class="font-bold underline">Ethos</h1>
        <div class="grid grid-cols-2 items-center">
            <h5 class="text-md">Global Perspective.</h5>
            <p class="text-xs">7 cities, 6 countries</p>
            <h5 class="text-md">Continuous Learning.</h5>
            <p class="text-xs">Learning at every opportunity</p>
            <h5 class="text-md">Impactful Purpose.</h5>
            <p class="text-xs">Do good and provide value</p>
        </div>
    </div>
</div>
