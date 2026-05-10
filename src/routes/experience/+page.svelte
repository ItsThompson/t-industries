<script lang="ts">
	import Timeline from '../../components/Timeline.svelte';
	import { experiences } from '$lib/experiences';
</script>

<div class="w-11/12 md:w-3/4 lg:w-3/5 2xl:w-1/2 border bg-black p-5 flex flex-col items-center gap-5">
	<div class="self-start w-full">
		<h4 class="text-xl font-bold underline">Experience</h4>
		<div class="mt-5">
			<Timeline {experiences} />
		</div>
	</div>
</div>
