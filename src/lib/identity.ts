export interface Identity {
	birthday: string;
	careerStartYear: number;
}

export const identity: Identity = {
	birthday: '2005-05-10',
	careerStartYear: 2019
};

export function calculateAge(options?: { floored: boolean }): number {
	const birthday = new Date(identity.birthday);
	const now = new Date();
	const diffMs = now.getTime() - birthday.getTime();
	const msInADay = 86400000;
	const diffDays = diffMs / msInADay;

	if (options?.floored) {
		return Math.floor(diffDays / 365.25);
	}

	return Math.round((diffDays / 365.25) * 100) / 100;
}

export function yearsOfExperience(): number {
	return new Date().getFullYear() - identity.careerStartYear;
}
