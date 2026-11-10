export interface SocialLink {
	href: string;
	name: string;
	/** Which mark to draw beside the link on the paper one-pager. */
	logo: 'github' | 'linkedin';
}

export const BIO_NAME = 'Thompson Tong';
export const BIO_TITLE = 'Software Engineer + Student';

export const SOCIAL_LINKS: SocialLink[] = [
	{ href: 'https://github.com/ItsThompson', name: 'GitHub', logo: 'github' },
	{ href: 'https://www.linkedin.com/in/thompsontong', name: 'LinkedIn', logo: 'linkedin' }
];

export const RND_API_ENDPOINT =
	'https://script.google.com/macros/s/AKfycbyOG-6A1DXH_87UUl0G4zmhNbUZg8w5drdFpkJw-ZNR6E-SmvHcqHomJfStnjoqQU0ehA/exec';
