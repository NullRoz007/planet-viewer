<script>
    import { onMount } from "svelte";
    import { Spring } from "svelte/motion";

    import * as THREE from "three";
    import { T, useTask, useThrelte } from "@threlte/core";

    import { interactivity } from "@threlte/extras";

    import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";
    import { ShaderPass } from "postprocessing";

    import {
        EffectComposer,
        EffectPass,
        RenderPass,
        SMAAEffect,
        SMAAPreset,
        BloomEffect,
        KernelSize,
        PixelationEffect,
        BlendFunction,
    } from "postprocessing";

    const { scene, renderer, camera, size } = useThrelte();
    const composer = new EffectComposer(renderer);

    const setup_effect_composer = (camera, size) => {
        composer.removeAllPasses();

        const pixelEffect = new PixelationEffect(5);
        const bloomEffect = new BloomEffect({
            blendFunction: BlendFunction.ADD,
            kernelSize: KernelSize.LARGE,
            intensity: 0.1,
            distinction: 1.0,
        });

        const pixelPass = new EffectPass(camera, pixelEffect);
        const bloomPass = new EffectPass(camera, bloomEffect);
        const renderPass = new RenderPass(scene, camera);

        composer.addPass(renderPass);
        composer.addPass(pixelPass);
        composer.addPass(bloomPass);
    };

    const scale = new Spring(5);

    let rotation = $state(0);
    let cloud_rotation = $state(0);

    let is_focused = false;
    let noise_texture = $state(null);
    let cloud_texture = $state(null);

    let pixelSize = 6;
    let props = $props();

    const generate_perlin_texture = (seed) => {
        const width = 256;
        const height = 256;

        const data = new Uint8Array(width * height * 4);
        const perlin = new ImprovedNoise();

        let frequency = 1 / 64;
        let amplitude = 1.0;
        let persistence = 0.5;
        let octaves = 8;
        let z = seed / 100;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let noise = 0;
                let freq = frequency;
                let amp = amplitude;

                for (let o = 0; o < octaves; o++) {
                    noise += perlin.noise(x * freq, y * freq, z) * amp;
                    freq *= 2;
                    amp *= persistence;
                }

                noise = (noise + 1) / 2; // Normalize to [0,1]
                let i = (y * width + x) * 4;
                let color = noise * 255;

                data[i] = props.color.r * 2 * noise;
                data[i + 1] = props.color.g * noise;
                data[i + 2] = props.color.b * noise;
                data[i + 3] = 255;
            }
        }

        const texture = new THREE.DataTexture(data, width, height);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.needsUpdate = true;

        return texture;
    };

    const generate_cloud_texture = () => {
        const width = 256;
        const height = 256;

        const data = new Uint8Array(width * height * 4);
        const perlin = new ImprovedNoise();

        let frequency = 1 / 64;
        let amplitude = 1.0;
        let persistence = 0.5;
        let octaves = 5;
        let z = Math.random() * 100;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let noise = 0;
                let freq = frequency;
                let amp = amplitude;

                for (let o = 0; o < octaves; o++) {
                    noise += perlin.noise(x * freq, y * freq, z) * amp;
                    freq *= 2;
                    amp *= persistence;
                }

                noise = (noise + 1) / 2; // Normalize to [0,1]
                let alpha = noise > 0.7 ? 255 : 0;
                let i = (y * width + x) * 4;

                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
                data[i + 3] = alpha;
            }
        }

        const texture = new THREE.DataTexture(data, width, height);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.needsUpdate = true;

        return texture;
    };
    let seed = $state(props.seed);
    console.log("seed in scene:" + seed);
    noise_texture = generate_perlin_texture(seed);
    cloud_texture = generate_cloud_texture();

    $effect(() => {
        setup_effect_composer($camera, $size);
    });

    $effect(() => {
        composer.setSize($size.width, $size.height);
    });

    const { renderStage, autoRender } = useThrelte();
    onMount(() => {
        let prev = autoRender.current;
        autoRender.set(false);
        return () => autoRender.set(prev);
    });

    interactivity();

    useTask(
        (delta) => {
            cloud_rotation += delta / 10;

            composer.render(delta);
        },
        {
            stage: renderStage,
            autoInvalidate: false,
        },
    );
</script>

<T.PerspectiveCamera
    makeDefault
    position={[10, 10, 10]}
    oncreate={(ref) => {
        ref.lookAt(0, 1, 0);
    }}
/>
<T.DirectionalLight position={[0, 10, 10]} />
<T.Mesh
    position.y={1}
    scale={scale.current}
    onpointerenter={() => {
        is_focused = true;

        if (props.mode != "fullscreen") scale.target = 7;
    }}
    onpointerleave={() => {
        is_focused = false;
        if (props.mode != "fullscreen") scale.target = 5;
    }}
>
    <T.SphereGeometry />
    <T.MeshStandardMaterial
        map={noise_texture}
        emissive={new THREE.Color("blue")}
        emissiveIntensity={0.1}
    />
</T.Mesh>

<T.Mesh
    rotation.y={cloud_rotation}
    position.y={1}
    scale={1.2 + scale.current}
    onpointerenter={() => {
        is_focused = true;
        if (props.mode != "fullscreen") scale.target = 1.2 + 7;
    }}
    onpointerleave={() => {
        is_focused = false;
        if (props.mode != "fullscreen") scale.target = 1.2 + 5;
    }}
>
    <T.SphereGeometry />
    <T.MeshStandardMaterial
        map={cloud_texture}
        transparent={true}
        opacity={0.3}
        depthWrite={false}
        emissive={new THREE.Color("white")}
        emissiveIntensity={1}
    />
</T.Mesh>
