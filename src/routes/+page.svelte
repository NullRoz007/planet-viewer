<script>
    import Menu from "~icons/pixelarticons/menu";
    import Github from "~icons/pixelarticons/github";

    import { AppBar } from "@skeletonlabs/skeleton-svelte";
    import QueryViewer from "../components/QueryViewer.svelte";
</script>

<header class="p-4">
    <AppBar classes="rounded-md">
        Exo Planet Viewer
        {#snippet lead()}<Menu />{/snippet}
        {#snippet trail()}
            <a href="https://github.com/NullRoz007/planet-viewer">
                <Github />
            </a>
        {/snippet}
        {#snippet headline()}
            <span>
                Nearest Neighbour: Proxima Cen / Proxima Cen b / -0.69 deg,
                315.74 deg
            </span>
        {/snippet}
    </AppBar>
</header>
<QueryViewer />
