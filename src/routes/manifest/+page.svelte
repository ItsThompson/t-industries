<script lang="ts">
    import Compartment from '../../components/industrial/Compartment.svelte';
    import { getUnitSerial, getUptime, DIVISION } from '$lib/metadata';

    const serial = getUnitSerial();
    const uptime = getUptime();
</script>

<svelte:head>
    <title>MANIFEST // Thompson Industries</title>
</svelte:head>

<div class="w-full max-w-4xl px-4">
    <h1 class="display-xl text-white mb-8">MANIFEST</h1>

    <Compartment title="UNIT: {serial} // {DIVISION}">
        <div class="space-y-4">
            <h2 class="display-md text-white">THOMPSON, N.</h2>
            <p class="label-sm text-secondary-200">Front-End Engineer // Amazon (Veeqo)</p>
            <p class="text-sm font-mono text-secondary-100 leading-relaxed">
                Software engineer specializing in frontend architecture and developer experience.
                Building scalable web applications with a focus on performance, accessibility,
                and maintainable design systems.
            </p>
            <div class="pt-2 border-t border-secondary-200">
                <span class="label-xs text-secondary-200">UPTIME: {uptime}</span>
            </div>
        </div>
    </Compartment>
</div>
