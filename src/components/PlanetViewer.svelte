<script>
    import { Canvas } from "@threlte/core";
    import Planet from "../scenes/Planet.svelte";
    import { onDestroy, onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { plane } from "three/examples/jsm/Addons.js";
    import { pl_eqt_to_color } from "$lib/texture-generation";

    let loaded = $state(false);
    let root;

    let observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                loaded = true;
                observer.disconnect();
            }
        });
    });

    let props = $props();
    //black magic from:
    //https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
    const cyrb53 = (str, seed = 0) => {
        let h1 = 0xdeadbeef ^ seed,
            h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
        h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
        h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
    };

    onMount(() => {
        observer.observe(root);
    });

    onDestroy(() => {
        observer.disconnect();
    });

    const radial_color = pl_eqt_to_color(props.pl_eqt ? props.pl_eqt : 10000);
    const planet_seed = cyrb53(props.pl_name);
</script>

<div
    class={(props.mode == "fullscreen" ? "mt-4 h-1/3" : "") +
        " relative p-4 flex justify-end space-x-8 bg-black h-1/2"}
>
    <div class="absolute z-1 flex flex-col gap-1 left-5">
        <span class="badge preset-filled-secondary-500">sats: 0</span>
        <span class="badge preset-filled-secondary-500">visitors: 0</span>
        <span class="badge preset-filled-secondary-500">something: _</span>
    </div>

    <div bind:this={root}>
        <Canvas frameloop="never">
            {#if loaded}
                <Planet
                    color={radial_color}
                    seed={planet_seed}
                    mode={props.mode}
                />
            {/if}
        </Canvas>
    </div>
</div>
