<script>
    import { Canvas } from "@threlte/core";
    import Planet from "../scenes/Planet.svelte";
    import { onDestroy, onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { plane } from "three/examples/jsm/Addons.js";
    import { pl_eqt_to_color } from "$lib/texture-generation";
    import { analyise_planet } from "$lib/exo-planet-archive";
    import { cyrb53 } from "$lib/util";

    let loaded = $state(false);
    let root = $state(null);

    let observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                loaded = true;
            }
        });
    });

    let props = $props();

    onMount(() => {
        observer.observe(root);
    });

    onDestroy(() => {
        observer.disconnect();
    });

    const radial_color = pl_eqt_to_color(props.pl_eqt ? props.pl_eqt : 10000);
    const planet_seed = cyrb53(props.pl_name);
    const analysis = analyise_planet(props.planet);
</script>

<div
    class={(props.mode == "fullscreen" ? "mt-4 h-md" : "") +
        " relative p-4 flex justify-end space-x-8 bg-black h-1/2"}
>
    <div class="absolute z-1 flex flex-col gap-1 left-5">
        <span class="badge preset-filled-secondary-500">Satellites: 0</span>
        <span class="badge preset-filled-secondary-500">Visitors: 0</span>
        {#if analysis.is_habitable}
            <span class="badge preset-filled-warning-500">Habitable</span>
        {:else}
            <span class="badge preset-filled-primary-500">Uninhabitable</span>
        {/if}
    </div>

    <div bind:this={root}>
        <Canvas frameloop="never">
            {#if loaded}
                <Planet
                    color={radial_color}
                    seed={planet_seed}
                    mode={props.mode}
                    root_ref={root}
                    force_animated={props.force_animated}
                    {analysis}
                />
            {/if}
        </Canvas>
    </div>
</div>
