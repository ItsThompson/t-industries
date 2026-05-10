<script lang="ts">
	export let company: string;
	export let role: string;
	export let dateRange: string;
	export let description: string;
	export let side: 'left' | 'right';
</script>

<div
	class="border bg-black p-4 flex flex-col gap-1 {side === 'left'
		? 'md:text-right'
		: 'md:text-left'}"
	data-testid="timeline-card"
>
	<h5 class="font-bold text-sm">{role}</h5>
	<p class="text-xs text-primary">{company}</p>
	<p class="text-xs text-gray-300">{dateRange}</p>
	<div class="mt-2 flex-1" data-testid="timeline-card-description">
		<p class="text-xs text-gray-100">{description}</p>
	</div>
</div>
