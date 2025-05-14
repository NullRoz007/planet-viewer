<script>
    import { onMount } from "svelte";
    import { Spring } from "svelte/motion";

    import * as THREE from "three";
    import { T, useTask, useThrelte } from "@threlte/core";
    import { interactivity } from "@threlte/extras";
    import { ShaderPass } from "postprocessing";

    import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";
    import { perlin_texture } from "$lib/texture-generation";
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

    let pixel_size = $state(5);
    const setup_effect_composer = (camera, size) => {
        composer.removeAllPasses();

        const pixelEffect = new PixelationEffect(pixel_size);
        const bloomEffect = new BloomEffect({
            blendFunction: BlendFunction.ADD,
            kernelSize: KernelSize.LARGE,
            intensity: 1,
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

    let seed = $state(props.seed);
    console.log("seed in scene:" + seed);

    noise_texture = perlin_texture(256, 256, seed, (noise) => {
        const data = new Uint8Array(4);
        data[0] = props.color.r * 2 * noise;
        data[1] = props.color.g * noise;
        data[2] = props.color.b * noise;
        data[3] = 255;

        return data;
    });

    cloud_texture = perlin_texture(256, 256, seed, (noise) => {
        let alpha = noise > 0.7 ? 255 : 0;
        const data = new Uint8Array(4);

        data[0] = 255;
        data[1] = 255;
        data[2] = 255;
        data[3] = alpha;

        return data;
    });

    $effect(() => {
        setup_effect_composer($camera, $size);
    });

    $effect(() => {
        composer.setSize($size.width, $size.height);
    });

    const { renderStage, autoRender } = useThrelte();
    onMount(() => {
        let prev = autoRender.current; //disable auto render as we're using three's composer now
        autoRender.set(false);

        if (props.mode == "fullscreen") pixel_size = 7;
        return () => autoRender.set(prev);
    });

    interactivity();

    useTask(
        (delta) => {
            cloud_rotation += delta / 10;
            rotation += delta / 20;
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
    rotation.y={rotation}
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
        emissive={new THREE.Color().setRGB(0.69, 0.82, 0.9)}
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
