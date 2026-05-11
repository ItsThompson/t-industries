const BIRTHDAY = '2005-05-10';
const CAREER_START_YEAR = 2019;

export const UNIT_SERIAL = 'TI-0510';
export const DIVISION = 'DIVISION: CORE.ENG';
export const CLEARANCE = 'CLEARANCE: L3';
export const LOCATION_CODES = 'LON / BTH / AMS';
export const ARCHIVE_REF = 'ARC-2019-FWD';

export function getManufacturingDate(): string {
	return 'MFG: 2005.05.10';
}

export function getUptime(): string {
	const birthday = new Date(BIRTHDAY);
	const now = new Date();
	const diffMs = now.getTime() - birthday.getTime();
	const msInADay = 86400000;
	const diffDays = diffMs / msInADay;
	const years = Math.round((diffDays / 365.25) * 100) / 100;
	return `${years.toFixed(2)} YRS`;
}

export function getExperienceCycles(): string {
	const now = new Date();
	const years = now.getFullYear() - CAREER_START_YEAR;
	return `EXP.CYCLES: ${years}`;
}

export function getFirmwareVersion(): string {
	const now = new Date();
	const major = now.getFullYear() - new Date(BIRTHDAY).getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	return `FW: v${major}.${month}`;
}

export function getSystemTime(): string {
	const now = new Date();
	const hours = String(now.getUTCHours()).padStart(2, '0');
	const minutes = String(now.getUTCMinutes()).padStart(2, '0');
	const seconds = String(now.getUTCSeconds()).padStart(2, '0');
	return `SYS.TIME: ${hours}:${minutes}:${seconds} UTC`;
}

export function getUnitSerial(): string {
	return UNIT_SERIAL;
}
