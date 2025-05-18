<script>
    import { onMount } from "svelte";
    import PlanetViewer from "./PlanetViewer.svelte";
    import Reload from "~icons/pixelarticons/reload";
    import Play from "~icons/pixelarticons/play";
    import Pause from "~icons/pixelarticons/pause";

    const queries = [
        {
            query: "/api/query/recent?",
            input_labels: [],
            input_params: [],
            cache: true,
        },
        {
            query: "/api/query/random?",
            input_labels: [],
            input_params: [],
            cache: false,
        },
        {
            query: "/api/query/planet?",
            input_labels: ["Planet Name"],
            input_params: ["pl_name"],
            cache: true,
        },
    ];

    let selected_query = $state(0);
    let query_promise = $state(null);
    let current_planet = $state(null);
    let query_enabled = $state(false);

    const map_query_params = (query_object) => {
        let parent = document.getElementById("input-container");
        let param_map = {};
        param_map["use-cache"] = query_object.cache;

        for (let i = 0; i < parent.children.length; i++) {
            let child = parent.children[i];
            let param_name = query_object.input_params[i];
            let param_value = child.value;

            param_map[param_name] = param_value;
        }

        return param_map;
    };

    // runs a query and returns the result,
    // intended to be assigned to a stateful promise
    const query = async (query_object) => {
        query_enabled = false;
        animated_header = -1;

        const q = query_object.query;

        const param_map = map_query_params(query_object);
        let response = await fetch(
            q + new URLSearchParams(param_map).toString(),
        );

        let planets = await response.json();

        query_enabled = true;
        return planets;
    };

    // run a query and assign the promise to query_promise (out stateful promise)
    // as the promise is stateful, this refreshes page data
    const run_query = () => {
        if (selected_query !== undefined) {
            query_promise = query(queries[selected_query]);
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
    const show_modal = (e, planet) => {
        const blocked_node_names = ["svg", "BUTTON", "path"]; //don't open if click triggered by a child clickable element
        if (blocked_node_names.indexOf(e.srcElement.nodeName) != -1) return;

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

    // Reactive statement to update query_promise when selected_query changes
    // this means updating selected_query triggers a new query and updates state
    $effect(() => {
        if (
            !queries[selected_query].input_labels ||
            queries[selected_query].input_labels.length == 0
        ) {
            run_query();
        }
    });

    let animated_header = $state(-1);
</script>

<div class="w-full">
    <div class="flex {query_enabled ? 'enabled' : 'disabled'} pl-4">
        <label class="label w-[28rem] py-4 hover">
            <select
                class="select text-sm"
                id="query-select"
                bind:value={selected_query}
            >
                <option value={0}>Recent</option>
                <option value={1}>Random</option>
                <option value={2}>Planet</option>
            </select>
        </label>

        <button type="button" class="btn" onclick={run_query}>
            <Reload />
        </button>
    </div>
    <div
        id="input-container"
        class="flex flex-col mx-4 {query_enabled ? 'enabled' : 'disabled'}"
    >
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
                    onclick={(e) => show_modal(e, planet)}
                >
                    <header class="bg-black flex-col h-md">
                        {#key animated_header}
                            <PlanetViewer
                                pl_eqt={planet.pl_eqt}
                                pl_name={planet.pl_name}
                                force_animated={animated_header == i}
                                {planet}
                            />
                        {/key}
                        <div class="w-full flex justify-end">
                            <button
                                type="button"
                                class="btn relative left-3"
                                onclick={() => {
                                    if (animated_header != i) {
                                        animated_header = i;
                                    } else {
                                        animated_header = -1;
                                    }
                                }}
                            >
                                {#if animated_header != i}
                                    <Play color="white" />
                                {:else}
                                    <Pause color="white" />
                                {/if}
                            </button>
                        </div>
                    </header>
                    <article class="space-y-4 p-4">
                        <div>
                            <h2 class="h6">{planet.hostname} /</h2>
                            <div class="flex">
                                <h3 class="h3">{planet.pl_name}</h3>
                            </div>
                        </div>

                        <div class="flex flex-col opacity-60">
                            <span>
                                Radius: {planet.pl_rade ?? "N/A"} Earth radii
                            </span>
                            <span>
                                Mass: {planet.pl_bmasse ?? "N/A"} Earth masses
                            </span>
                            <span>
                                Orbital Period: {planet.pl_orbper ?? "N/A"} days
                            </span>
                        </div>
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
            planet={current_planet}
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
