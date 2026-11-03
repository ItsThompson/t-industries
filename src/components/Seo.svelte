<script lang="ts">
    import { BIO_NAME } from '$lib/bio';
    import { canonicalUrl, type PageMetadata } from '$lib/seo';
    import { buildProfileGraph, serializeJsonLd } from '$lib/structured-data';

    export let page: PageMetadata;
    /** Set on the one page whose primary subject is the person, so it carries the profile graph. */
    export let profilePage: boolean = false;

    $: canonical = canonicalUrl(page.path);
    $: jsonLdScript = profilePage
        ? `<script type="application/ld+json">${serializeJsonLd(buildProfileGraph())}<\/script>`
        : null;
</script>

<svelte:head>
    <title>{page.title}</title>
    <meta name="description" content={page.description} />
    <link rel="canonical" href={canonical} />

    <meta property="og:type" content={profilePage ? 'profile' : 'website'} />
    <meta property="og:site_name" content={BIO_NAME} />
    <meta property="og:title" content={page.title} />
    <meta property="og:description" content={page.description} />
    <meta property="og:url" content={canonical} />

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={page.title} />
    <meta name="twitter:description" content={page.description} />

    {#if jsonLdScript}{@html jsonLdScript}{/if}
</svelte:head>
