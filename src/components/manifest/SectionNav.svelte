<script lang="ts">
    export let activeSection: string = '';

    const sections = [
        { id: 'identity', label: 'Identity' },
        { id: 'experience', label: 'Experience' },
        { id: 'projects', label: 'Projects' },
        { id: 'ethos', label: 'Ethos' }
    ];
</script>

<nav aria-label="Page sections" class="flex flex-wrap gap-2 justify-center py-3">
    {#each sections as section}
        <a
            href="#{section.id}"
            class="px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors {activeSection === section.id ? 'text-primary' : 'text-secondary-200 hover:text-white'}"
        >
            {section.label}
        </a>
    {/each}
</nav>
