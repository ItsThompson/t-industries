<script lang="ts">
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import Age from "../components/Age.svelte";
    import Link from "../components/Link.svelte";
    import Loading from "../components/Loading.svelte";

    let now: Date = new Date();
    let yearsInExperience: number = now.getFullYear() - 2019;

    let rndApi: string =
        "https://script.google.com/macros/s/AKfycbyOG-6A1DXH_87UUl0G4zmhNbUZg8w5drdFpkJw-ZNR6E-SmvHcqHomJfStnjoqQU0ehA/exec";
    // Query String:
    // ?data=prev: It reads the 'Previous RND' data from the Google Sheet.
    // Anything else: It reads the 'Current RND' data from the Google Sheet.

    // Endpoint is only used for read operations.
    // Data is stored in Google Sheets 't-industri.es - Personal R&D List'

    /** Store for your data. 
    This assumes the data you're pulling back will be an array.
    If it's going to be an object, default this to an empty object.
    **/
    let rndList = writable([]);

    onMount(async () => {
        fetch(rndApi)
            .then((response) => response.json())
            .then((data) => {
                rndList.set(data);
            })
            .catch((error) => {
                console.log(error);
                return [];
            });
    });
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
        </p>
        <p class="text-sm">Third Year at the University of Bath (Placement @ Amazon Sep 2025 - Oct 2026)</p>
        <p class="mt-5 text-sm">
            Hi, I am Thompson, a <Age floored={true} /> year old software developer
            with <span class="underline">{yearsInExperience}
            years of experience</span> in developing and leading software projects with
            social impact. I have lived in <span class="underline">7 different cities across 3 continents</span>
            where I have gained a
            <span class="underline">multicultural perspective</span>
            and a deep understanding of working with people from various backgrounds.
        </p>
        <div class="mt-5 text-sm">
            Currently, my main areas of personal R&D is:
            {#if $rndList.length > 0}
                <ul class="list-disc list-inside">
                    {#each $rndList as item}
                        <li class="underline">{item}</li>
                    {/each}
                </ul>
            {:else}
                <div class="text-center p-5">
                    <Loading />
                    <p class="text-xs text-gray-300">
                    Note: May take a second—fetching (My backend is a Google Sheet 😁).
                        </p>
                </div>
            {/if}
        </div>
    </div>

    <div>
        <Link href="https://github.com/ItsThompson" name="GitHub" />
    </div>
    <div class="flex flex-col items-center gap-2">
        <p class="text-xs text-gray-300">
            {now.getTime()}
        </p>
        <p class="text-center text-xs text-gray-300">
            t-industries (<span class="text-yellow-400 font-bold">ti</span>) is not an organization. no rights reserved.
        </p>
    </div>
</div>
