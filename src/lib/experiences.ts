export interface Experience {
	company: string;
	role: string;
	startDate: string;
	endDate: string;
	description: string;
}

export const experiences: Experience[] = [
	{
		company: 'Amazon (Veeqo)',
		role: 'Front-End Engineer',
		startDate: 'Sep 2025',
		endDate: 'Present',
		description:
			'Reduced frontend build times by ~82% and page latency by ~75% by designing the monolith-to-microservices migration architecture, shipping 5 React settings pages to 50,000+ sellers with zero rollbacks. Owned features end-to-end from Figma to post-launch analytics, achieving 76% user retention on Custom Bookmarks and building an AI-powered changelog pipeline eliminating manual work for support/sales teams.'
	},
	{
		company: 'University of Bath CRIISP',
		role: 'Research Assistant',
		startDate: 'Aug 2024',
		endDate: 'Present',
		description:
			'Reduced SEM creation time by 30% by improving retrieval of academic paper summaries from Firebase, building software that helps scientists visually model the factors influencing pain perception.'
	},
	{
		company: 'MSD',
		role: 'MLOps Intern, GenAI',
		startDate: 'Jun 2024',
		endDate: 'Jul 2024',
		description:
			'Reduced document processing time by 48% by deploying a scalable RAG pipeline using AWS Step Functions and Lambda, capable of concurrently processing 10,000 documents through an optimized ingestion, embedding, and storage architecture.'
	},
	{
		company: 'Coding For All',
		role: 'Co-Founder',
		startDate: 'Sep 2021',
		endDate: 'Dec 2023',
		description:
			'Founded a programming education initiative, designing 2 curriculums teaching programmatic thinking and web development to ~20 students over 3 terms, and mentoring 3 student teachers into leadership roles.'
	},
	{
		company: 'Coding For Good',
		role: 'Project Manager & Engineer',
		startDate: 'Dec 2021',
		endDate: 'Feb 2023',
		description:
			'Led a team of 6 engineers to deliver a MERN app that algorithmically curated music for dementia patients, achieving 85% user satisfaction. Improved project completion rate by 25% across 5 concurrent projects involving 40 students.'
	}
];
