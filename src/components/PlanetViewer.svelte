<script>
    import { Canvas } from "@threlte/core";
    import Planet from "../scenes/Planet.svelte";
    import { onDestroy, onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { plane } from "three/examples/jsm/Addons.js";

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

    const pl_eqt_to_color = (pl_eqt) => {
        const temp = Math.max(1000, Math.min(10000, pl_eqt)) / 100;
        let red, green, blue;

        // Red
        if (temp <= 66) {
            red = 255;
        } else {
            red = temp - 60;
            red = 329.698727446 * Math.pow(red, -0.1332047592);
            red = Math.min(255, Math.max(0, red));
        }

        // Green
        if (temp <= 66) {
            green = 99.4708025861 * Math.log(temp) - 161.1195681661;
        } else {
            green = temp - 60;
            green = 288.1221695283 * Math.pow(green, -0.0755148492);
        }
        green = Math.min(255, Math.max(0, green));

        // Blue
        if (temp >= 66) {
            blue = 255;
        } else if (temp <= 19) {
            blue = 0;
        } else {
            blue = temp - 10;
            blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
            blue = Math.min(255, Math.max(0, blue));
        }

        return {
            r: Math.round(red),
            g: Math.round(green),
            b: Math.round(blue),
        };
    };

    onMount(() => {
        observer.observe(root);
    });

    onDestroy(() => {
        observer.disconnect();
    });

    const radial_color = pl_eqt_to_color(props.pl_eqt ? props.pl_eqt : 10000);
    const planet_seed = cyrb53(props.pl_name);
    console.log(props.pl_name + " seed =" + planet_seed);
</script>

<div
    class={(props.mode == "fullscreen" ? "mt-4" : "") +
        " p-4 flex justify-end space-x-8 bg-black h-1/2"}
>
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
