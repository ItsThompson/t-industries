import { identity } from './identity';

export function getUptime(): string {
	const birthday = new Date(identity.birthday);
	const now = new Date();
	const diffMs = now.getTime() - birthday.getTime();
	const msInADay = 86400000;
	const diffDays = diffMs / msInADay;
	const years = Math.round((diffDays / 365.25) * 100) / 100;
	return `${years.toFixed(2)} YRS`;
}

export function getExperienceCycles(): string {
	const now = new Date();
	const years = now.getFullYear() - identity.careerStartYear;
	return `EXP.CYCLES: ${years}`;
}

export function getSystemTime(): string {
	const now = new Date();
	const hours = String(now.getUTCHours()).padStart(2, '0');
	const minutes = String(now.getUTCMinutes()).padStart(2, '0');
	const seconds = String(now.getUTCSeconds()).padStart(2, '0');
	return `SYS.TIME: ${hours}:${minutes}:${seconds} UTC`;
}
