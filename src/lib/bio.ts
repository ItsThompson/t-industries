import { base } from '$app/paths';

export interface SocialLink {
	href: string;
	name: string;
	markSrc: string;
}

export const BIO_NAME = 'Thompson Tong';
export const BIO_TITLE = 'Software Engineer + Student';

export const SOCIAL_LINKS: SocialLink[] = [
	{ href: 'https://github.com/ItsThompson', name: 'GitHub', markSrc: `${base}/github.svg` },
	{
		href: 'https://www.linkedin.com/in/thompsontong',
		name: 'LinkedIn',
		markSrc: `${base}/linkedin.svg`
	}
];

export const RND_API_ENDPOINT =
	'https://script.google.com/macros/s/AKfycbyOG-6A1DXH_87UUl0G4zmhNbUZg8w5drdFpkJw-ZNR6E-SmvHcqHomJfStnjoqQU0ehA/exec';
