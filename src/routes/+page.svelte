<script lang="ts">
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
    <div class="flex flex-col items-center gap-2 w-4/5">
        <h1 class="font-bold underline">Personal Ethos</h1>
        <div class="grid grid-cols-10 items-center gap-3">
            <h3 class="text-lg font-bold col-span-2">title.</h3>
            <h3 class="text-lg font-bold col-span-4">desc.</h3>
            <h3 class="text-lg font-bold col-span-4">walking the walk.</h3>
            <h5 class="text-md col-span-2">Global Perspective.</h5>
            <p class="text-xs col-span-4">
                The diversity of the world population drives innovation and
                change only if we can overcome language barriers and accept
                cultural differences.
            </p>
            <p class="text-xs col-span-4">
                proof proof proof proof proof proof proof proof proof proof
                proof proof proof proof proof proof proof proof proof proof
                proof proof proof proof proof proof proof proof proof proof
                proof proof proof proof proof proof proof proof proof proof
            </p>
            <h5 class="text-md col-span-2">Continuous Learning.</h5>
            <!-- <p class="text-xs">Learning at every opportunity</p> -->
            <p class="text-xs col-span-4">
                Innovation is accelerated by standing on the shoulders of
                giants. At any opportunity, there is a chance to learn. With the
                unique aggregate of personal knowledge and experiences, there is
                a chance to create something new and impactful.
            </p>
            <p class="text-xs col-span-4">
                proof proof proof proof proof proof proof proof proof proof
                proof proof proof proof proof proof proof proof proof proof
                proof proof proof proof proof proof proof proof proof proof
                proof proof proof proof proof proof proof proof proof proof
            </p>
            <h5 class="text-md col-span-2">Impactful Purpose.</h5>
            <p class="text-xs col-span-4">
                Do good and provide value. It can be that simple.
            </p>
            <p class="text-xs col-span-4">
                proof proof proof proof proof proof proof proof proof proof
                proof proof proof proof proof proof proof proof proof proof
                proof proof proof proof proof proof proof proof proof proof
                proof proof proof proof proof proof proof proof proof proof
            </p>
        </div>
    </div>
</div>
