<script lang="ts">
    import Project from "../../components/FeaturedProjectItem.svelte";
</script>

<div
    class="w-11/12 md:w-1/2 lg:w-2/5 2xl:w-1/3
border p-5 flex flex-col items-center gap-5"
>
    <div class="self-start">
        <h4 class="text-xl font-bold underline">Featured Projects</h4>
    </div>

    <div
        class="grid grid-cols-1 md:grid-cols-2 items-start gap-8"
    >
        <Project
            href="https://github.com/ItsThompson/currency-converter"
            name="Currency Converter"
            desc="Currency Converter CLI program written in Go with natural-language interpretation."
        />
        <Project
            href="https://github.com/ItsThompson/tictactoe"
            name="TicTacToe"
            desc="A tictactoe CLI game where you play against a computer player with a minimax algorithm implementation."
        />
        <Project
            href="https://github.com/ItsThompson/neo_delta"
            name="NeoDelta"
            desc="A multi-platform habit tracker mobile app building optimizing building new habits whilst maintaining old habits."
        />
        <Project
            href="https://github.com/ItsThompson/airline-database"
            name="Airline Database"
            desc="Airline Information Terminal (Python, SQL)"
        />
        <Project
            href="https://github.com/ItsThompson/t-industries"
            name="t-industries"
            desc="Personal website built with SvelteKit and TailwindCSS."
        />
    </div>
</div>
