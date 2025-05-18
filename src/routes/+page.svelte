<script>
    import Menu from "~icons/pixelarticons/menu";
    import Github from "~icons/pixelarticons/github";

    import { AppBar } from "@skeletonlabs/skeleton-svelte";
    import QueryViewer from "../components/QueryViewer.svelte";
    import { Tabs } from "@skeletonlabs/skeleton-svelte";
    import Lightswitch from "../components/Lightswitch.svelte";

    let tab_group = $state("search");
</script>

<header class="p-4">
    <AppBar classes="rounded-md exoheader">
        Exo Planet Viewer
        {#snippet lead()}<Menu />{/snippet}
        {#snippet trail()}
            <a href="https://github.com/NullRoz007/planet-viewer">
                <Github />
            </a>
            <Lightswitch />
        {/snippet}
        {#snippet headline()}
            <span>
                Nearest Neighbour: Proxima Cen / Proxima Cen b / -0.69 deg,
                315.74 deg
            </span>
        {/snippet}
    </AppBar>
</header>
<div class="px-4">
    <Tabs
        value={tab_group}
        onValueChange={(e) => {
            tab_group = e.value;
        }}
    >
        {#snippet list()}
            <Tabs.Control value="search">Search</Tabs.Control>
            <Tabs.Control value="mission">Mission</Tabs.Control>
        {/snippet}
        {#snippet content()}
            <Tabs.Panel value="search">
                {#if tab_group == "search"}
                    <QueryViewer />
                {/if}
            </Tabs.Panel>
            <Tabs.Panel value="mission">...</Tabs.Panel>
        {/snippet}
    </Tabs>
</div>
