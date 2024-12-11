<script lang="ts">
    export let floored = false;
    const birthday: Date = new Date("2005-05-10");
    let now: Date = new Date();

    let diffMs: number = now.getTime() - birthday.getTime();
    let msInADay: number = 86400000;
    let diffDays: number = Math.floor(diffMs / msInADay);

    let age: number = Math.round((diffDays / 365.25) * 100) / 100;
    if (floored) {
        age = Math.floor(diffDays / 365.25);
    }
</script>

{age}
