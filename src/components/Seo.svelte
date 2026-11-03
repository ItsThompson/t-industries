<script lang="ts">
    import { page } from '$app/stores';
    import { BIO_NAME } from '$lib/bio';
    import { canonicalUrl } from '$lib/seo';
    import { buildProfileGraph, serializeJsonLd } from '$lib/structured-data';

    export let title: string;
    export let description: string;
    /** Set on the one page whose primary subject is the person, so it carries the profile graph. */
    export let profilePage: boolean = false;

    $: canonical = canonicalUrl(requireRouteId($page.route.id));
    $: jsonLdScript = profilePage
        ? `<script type="application/ld+json">${serializeJsonLd(buildProfileGraph())}<\/script>`
        : null;

    function requireRouteId(routeId: string | null): string {
        if (routeId === null) {
            throw new Error('cannot build a canonical URL without a route id');
        }
        return routeId;
    }
</script>

<svelte:head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />

    <meta property="og:type" content={profilePage ? 'profile' : 'website'} />
    <meta property="og:site_name" content={BIO_NAME} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />

    {#if jsonLdScript}{@html jsonLdScript}{/if}
</svelte:head>
