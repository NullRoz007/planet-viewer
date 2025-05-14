<script>
    import { onMount } from "svelte";
    import PlanetViewer from "./PlanetViewer.svelte";
    import Reload from "~icons/pixelarticons/reload";

    const queries = [
        { query: "/api/query/recent", inputs: 0, input_labels: [] },
        { query: "/api/query/random", inputs: 0, input_labels: [] },
        {
            query: "/api/query/planet",
            input_labels: ["Planet Name"],
        },
    ];

    let selected_query = $state(0);
    let query_promise = $state(null);
    let current_planet = $state(null);
    let query_enabled = $state(false);
    // runs a query and returns the result,
    // intended to be assigned to a stateful promise
    const query = async (q) => {
        query_enabled = false;
        let response = await fetch(q);
        let planets = await response.json();
        query_enabled = true;
        return planets;
    };

    // run a query and assign the promise to query_promise (out stateful promise)
    // as the promise is stateful, this refreshes page data
    const run_query = () => {
        if (selected_query !== undefined) {
            query_promise = query(queries[selected_query].query);
        }
    };

    const enable_query = () => {
        $effect(() => {
            query_enabled = true;
        });
    };

    const disable_query = () => {
        $effect(() => {
            query_enabled = false;
        });
    };
    // open the planet viewer modal
    const show_modal = (planet) => {
        current_planet = planet;
        const modal_elem = document.getElementById("world-modal");
        modal_elem.showModal();
    };

    // hide the planet viewer modal
    const hide_modal = () => {
        const modal_elem = document.getElementById("world-modal");
        modal_elem.close();
        current_planet = null;
    };

    // Reactive statement to update recent_promise when selected_query changes
    // this means updating selected_query triggers a new query and updates state
    $effect(() => {
        if (
            !queries[selected_query].input_labels ||
            queries[selected_query].input_labels.length == 0
        ) {
            run_query();
        }
    });
</script>

<div class="w-full px-4">
    <div class="flex {query_enabled ? 'enabled' : 'disabled'}">
        <label class="label w-[29rem] pl-4 py-4">
            <span class="label-text">Query</span>
            <select
                class="select"
                id="query-select"
                bind:value={selected_query}
            >
                <option value={0}>Recent</option>
                <option value={1}>Random</option>
                <option value={2}>Planet</option>
            </select>
        </label>

        <button type="button" class="btn mt-5" onclick={run_query}>
            <Reload />
        </button>
    </div>
    <div class="flex flex-col mx-4">
        {#each queries[selected_query].input_labels as label, i}
            <input type="text" class="input" placeholder={label} />
        {/each}
    </div>
    <div
        class="snap-x scroll-px-4 snap-mandatory scroll-smooth flex gap-4 overflow-x-auto px-4 py-4 no-scrollbar"
    >
        {#await query_promise}
            loading...
        {:then planets}
            {#each planets as planet, i}
                <a
                    href="#"
                    class="snap-start shrink-0 card preset-filled-surface-100-900 border-[1px] border-surface-200-800 card-hover divide-surface-200-800 block w-md max-w-md divide-y overflow-hidden"
                    onclick={() => show_modal(planet)}
                >
                    <header>
                        <PlanetViewer
                            pl_eqt={planet.pl_eqt}
                            pl_name={planet.pl_name}
                        />
                    </header>
                    <article class="space-y-4 p-4">
                        <div>
                            <h2 class="h6">{planet.hostname} /</h2>
                            <h3 class="h3">{planet.pl_name}</h3>
                        </div>
                        <p class="opacity-60">
                            Radius: {planet.pl_rade ?? "N/A"} Earth radii<br />
                            Mass: {planet.pl_bmasse ?? "N/A"} Earth masses<br />
                            Orbital Period: {planet.pl_orbper ?? "N/A"} days
                        </p>
                    </article>
                    <footer class="flex items-center justify-between gap-4 p-4">
                        <small class="opacity-60">
                            At {planet.disc_facility}
                        </small>
                        <small class="opacity-60">
                            Published on {planet.pl_pubdate}
                        </small>
                    </footer>
                </a>
            {/each}
        {:catch}
            <p>Something went wrong...</p>
            {enable_query()}
        {/await}
    </div>
</div>

<dialog
    id="world-modal"
    class="relative rounded-container bg-surface-100-900 text-inherit max-w-3/4 w-full h-full top-1/2 left-1/2 -translate-1/2 p-4 space-y-4 z-10 backdrop:bg-surface-50/75 dark:backdrop:bg-surface-950/75"
>
    {#if current_planet}
        <span class="fill-secondary-500">
            system: {current_planet.hostname}
        </span><br />
        <span>
            planet: <p class="h3">{current_planet.pl_name}</p>
        </span>

        <PlanetViewer
            pl_eqt={current_planet.pl_eqt}
            pl_name={current_planet.pl_name}
            mode="fullscreen"
        />

        <div class="table-wrap">
            <table class="table">
                <thead class="">
                    <tr>
                        <td class="text-center">Product-ID</td>
                        <td class="text-center">Description</td>
                    </tr>
                </thead>
                <tbody>
                    <tr class="">
                        <td class="text-center">test</td>
                        <td class="text-center">test</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <!-- Button wrapper positioned at bottom right -->
        <div class="absolute bottom-4 right-4">
            <form method="dialog">
                <button
                    type="button"
                    class="btn preset-outlined-primary-500"
                    onclick={hide_modal}
                >
                    Close
                </button>
            </form>
        </div>
    {:else}
        <p>Something went wrong...</p>
    {/if}
</dialog>
