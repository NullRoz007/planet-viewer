<script>
    import PlanetViewer from "./PlanetViewer.svelte";

    const recent = async () => {
        const response = await fetch("/api/query/recent");
        const planets = await response.json();

        return planets;
    };

    const recent_promise = recent();

    let current_planet = null;
    const show_modal = (planet) => {
        current_planet = planet;
        const modal_elem = document.getElementById("world-modal");
        modal_elem.showModal();
    };

    const hide_modal = () => {
        const modal_elem = document.getElementById("world-modal");
        modal_elem.close();
        current_planet = null;
    };
</script>

<div class="w-full p-4">
    <p class="text-2xl pl-4">Recent Discoveries</p>
    <div
        class="snap-x scroll-px-4 snap-mandatory scroll-smooth flex gap-4 overflow-x-auto px-4 py-4 no-scrollbar"
    >
        {#await recent_promise}
            loading...
        {:then recent_planets}
            {#each recent_planets as planet, i}
                <a
                    href="#"
                    class="snap-start shrink-0 card preset-filled-surface-100-900 border-[1px] border-surface-200-800 card-hover divide-surface-200-800 block w-md max-w-md divide-y overflow-hidden"
                    onclick={() => {
                        show_modal(planet);
                    }}
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
        {/await}
    </div>
</div>

<dialog
    id="world-modal"
    class="relative rounded-container bg-surface-100-900 text-inherit max-w-3/4 w-full max-h-3/4 h-full top-1/2 left-1/2 -translate-1/2 p-4 space-y-4 z-10 backdrop:bg-surface-50/75 dark:backdrop:bg-surface-950/75"
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

        <!-- Button wrapper positioned at bottom right -->
        <div class="absolute bottom-4 right-4">
            <form method="dialog">
                <button
                    type="button"
                    class="btn preset-outlined-primary-500"
                    onclick={() => hide_modal()}
                >
                    Close
                </button>
            </form>
        </div>
    {:else}
        <p>Something went wrong...</p>
    {/if}
</dialog>
