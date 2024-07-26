<script lang="ts">
    import Age from "../components/Age.svelte";
    import Link from "../components/Link.svelte";

    let now: Date = new Date();
    let yearsInExperience: number = now.getFullYear() - 2019;
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
            Software Developer + Student
            <!-- Kind of offensive to tie me down to a single role... I'll let it slide. -->
        </p>
        <p class="text-sm">First Year at the University of Bath</p>
        <p class="mt-5 text-sm">
            Hi, I am Thompson, a <Age rounded={true} /> year old software developer
            with {yearsInExperience}
            years of experience in developing and leading software projects with
            social impact. I have lived in seven different cities across three continents
            where I have gained a
            <span class="underline">multicultural diverse perspective</span>
            and a deep understanding of working with people from various backgrounds.
        </p>
        <div class="mt-5 text-sm">
            Currently, my main areas of personal R&D is:
            <ul class="list-disc list-inside">
                <li class="underline">Linear Algebra</li>
                <li class="underline">Multivariable Calculus</li>
                <li class="underline">RAG and Knowledge Graphs</li>
            </ul>
        </div>
    </div>

    <div>
        <Link href="https://github.com/ItsThompson" name="GitHub" />
    </div>
    <div class="mt-5">
        <p class="text-xs text-gray-300">
        {now.getTime()}
        </p>
    </div>
</div>
