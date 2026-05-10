<script lang="ts">
	import type { Experience } from '$lib/experiences';
	import TimelineItem from './TimelineItem.svelte';

	export let experiences: Experience[];
</script>

<div class="relative w-full" data-testid="timeline">
	<!-- Central vertical line (desktop) / left-aligned line (mobile) -->
	<div
		class="absolute top-0 bottom-0 w-px bg-gray-500 left-3 md:left-1/2 md:-translate-x-px"
		data-testid="timeline-line"
	></div>

	<div class="flex flex-col gap-8">
		{#each experiences as experience, index}
			{@const side = index % 2 === 0 ? 'left' : 'right'}
			<div class="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4" data-testid="timeline-entry">
				<!-- Left card (desktop only for even index) -->
				<div class="hidden md:block {side === 'left' ? '' : 'invisible'}" data-testid="timeline-desktop-left">
					{#if side === 'left'}
						<TimelineItem
							company={experience.company}
							role={experience.role}
							dateRange="{experience.startDate} - {experience.endDate}"
							description={experience.description}
							{side}
						/>
					{/if}
				</div>

				<!-- Dot marker -->
				<div class="hidden md:flex justify-center">
					<div class="w-3 h-3 rounded-full bg-white border border-gray-500 z-10" data-testid="timeline-dot"></div>
				</div>

				<!-- Right card (desktop only for odd index) -->
				<div class="hidden md:block {side === 'right' ? '' : 'invisible'}" data-testid="timeline-desktop-right">
					{#if side === 'right'}
						<TimelineItem
							company={experience.company}
							role={experience.role}
							dateRange="{experience.startDate} - {experience.endDate}"
							description={experience.description}
							{side}
						/>
					{/if}
				</div>

				<!-- Mobile card (always visible on mobile) -->
				<div class="md:hidden pl-8 relative">
					<div
						class="absolute left-[9px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border border-gray-500 z-10"
						data-testid="timeline-dot-mobile"
					></div>
					<TimelineItem
						company={experience.company}
						role={experience.role}
						dateRange="{experience.startDate} - {experience.endDate}"
						description={experience.description}
						side="right"
					/>
				</div>
			</div>
		{/each}
	</div>
</div>
