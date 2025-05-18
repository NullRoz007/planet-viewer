<script>
    import { onMount } from "svelte";
    import { Spring } from "svelte/motion";

    import * as THREE from "three";
    import { T, useTask, useThrelte } from "@threlte/core";
    import { OrbitControls } from "@threlte/extras";
    import { interactivity } from "@threlte/extras";
    import { ShaderPass } from "postprocessing";

    import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";
    import { perlin_texture } from "$lib/texture-generation.js";
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
    let composer = new EffectComposer(renderer);

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

    const scale = props.mode == "fullscreen" ? new Spring(3) : new Spring(5);
    const cloud_scale =
        props.mode == "fullscreen" ? new Spring(2.2) : new Spring(5.1);

    let rotation = $state(0);
    let cloud_rotation = $state(0);

    let is_focused = false;
    let noise_texture = $state(null);
    let cloud_texture = $state(null);

    let habitable_colors = [
        new THREE.Color().setRGB(0.5, 1.2, 2),
        "lightblue",
        "skyblue",
    ];

    let uninhabitable_colors = [
        new THREE.Color().setRGB(0, 0, 0),
        new THREE.Color().setRGB(1.7, 0.72, 1.2),
        new THREE.Color().setRGB(2, 0.2, 0.2),
        "gray",
    ];

    let pixelSize = 6;

    let props = $props();
    let seed = $state(props.seed);

    let colors = props.analysis.is_habitable
        ? habitable_colors
        : uninhabitable_colors;

    let tint_color = colors[seed % colors.length];

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

    const dump_canvas_to_image = () => {
        const img = new Image();
        if (props.root_ref.children[0].firstChild) {
            img.src =
                props.root_ref.children[0].firstChild.toDataURL("image/png");
        }

        return img;
    };

    const image_to_canvas = (img) => {
        props.root_ref.children[0].firstChild.remove();
        props.root_ref.children[0].appendChild(img);
    };

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

    let frames = 0;
    useTask(
        (delta) => {
            cloud_rotation += delta / 10;
            rotation += delta / 20;
            composer.render(delta);
            frames += 1;

            if (
                frames == 1 &&
                props.mode != "fullscreen" &&
                !props.force_animated
            ) {
                let planet_img = dump_canvas_to_image();
                image_to_canvas(planet_img);
            }
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
></T.PerspectiveCamera>
<T.DirectionalLight position={[0, 10, 10]} />
<T.Mesh
    rotation.y={rotation}
    position.y={1}
    scale={scale.current}
    onpointerenter={() => {
        is_focused = true;

        if (props.mode == "fullscreen") scale.target = 4;
    }}
    onpointerleave={() => {
        is_focused = false;
        if (props.mode == "fullscreen") scale.target = 3;
    }}
>
    <T.SphereGeometry />
    <T.MeshStandardMaterial
        map={noise_texture}
        emissive={tint_color}
        emissiveIntensity={0.1}
    />
</T.Mesh>

<T.Mesh
    rotation.y={cloud_rotation}
    position.y={1}
    scale={1.2 + cloud_scale.current}
    onpointerenter={() => {
        is_focused = true;
        if (props.mode == "fullscreen") cloud_scale.target = 3.2;
    }}
    onpointerleave={() => {
        is_focused = false;
        if (props.mode == "fullscreen") cloud_scale.target = 2.2;
    }}
>
    <T.SphereGeometry />
    <T.MeshStandardMaterial
        map={cloud_texture}
        transparent={true}
        opacity={1}
        depthWrite={false}
        emissive={new THREE.Color("white")}
        emissiveIntensity={0.5}
    />
</T.Mesh>
