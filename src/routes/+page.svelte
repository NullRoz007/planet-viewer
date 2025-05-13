<script lang="ts">
    import { AppBar } from "@skeletonlabs/skeleton-svelte";
    import PlanetViewer from "../components/PlanetViewer.svelte";
    import RecentViewer from "../components/RecentViewer.svelte";
</script>

<header class="p-4">
    <AppBar classes="rounded-md">
        Exo Planet Viewer
        {#snippet lead()}Menu{/snippet}
        {#snippet trail()}github link{/snippet}
        {#snippet headline()}
            AT2021ueyL / AT2021ueyL b / -19.06415 deg, 77.91374 deg
        {/snippet}
    </AppBar>
</header>

<RecentViewer />
