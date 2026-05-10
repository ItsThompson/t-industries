export interface PrimaryLanguage {
	name: string;
	color: string;
}

export interface PinnedProject {
	name: string;
	description: string;
	githubUrl: string;
	homepageUrl: string;
	primaryLanguage: PrimaryLanguage | null;
}

const PINNED_REPOS_QUERY = `
  query {
    user(login: "ItsThompson") {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            homepageUrl
            primaryLanguage {
              name
              color
            }
          }
        }
      }
    }
  }
`;

interface GraphQLResponse {
	data?: {
		user: {
			pinnedItems: {
				nodes: Array<{
					name: string;
					description: string | null;
					url: string;
					homepageUrl: string | null;
					primaryLanguage: { name: string; color: string } | null;
				}>;
			};
		};
	};
	errors?: Array<{ message: string }>;
}

export async function fetchPinnedRepos(
	token: string,
	fetchFn: typeof fetch = fetch
): Promise<PinnedProject[]> {
	const response = await fetchFn('https://api.github.com/graphql', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ query: PINNED_REPOS_QUERY })
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(
			`GitHub API request failed (status ${response.status}): ${body}`
		);
	}

	const json: GraphQLResponse = await response.json();

	if (json.errors) {
		const messages = json.errors.map((error) => error.message).join(', ');
		throw new Error(`GitHub GraphQL errors: ${messages}`);
	}

	if (!json.data) {
		throw new Error('GitHub API returned no data');
	}

	const nodes = json.data.user.pinnedItems.nodes;

	return nodes.map((node) => ({
		name: node.name,
		description: node.description ?? '',
		githubUrl: node.url,
		homepageUrl: node.homepageUrl ?? '',
		primaryLanguage: node.primaryLanguage
	}));
}
