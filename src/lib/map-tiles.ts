import type { City } from './cities';

/** Edge length of one basemap tile in CSS pixels. */
export const TILE_SIZE = 256;

/** Dark basemap, so the modal reads as part of the site rather than a map widget. */
export const TILE_URL_TEMPLATE =
	'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

export const MAP_ATTRIBUTION = 'Esri, HERE, Garmin, OpenStreetMap contributors';

export interface MapTile {
	key: string;
	url: string;
	/** Percentages of the map box, so the whole layout scales with its container. */
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface MapMarker {
	id: string;
	name: string;
	/** Where the marker is drawn, after collision nudging. */
	left: number;
	top: number;
	/** The city's true position, used for the leader line when nudged. */
	anchorLeft: number;
	anchorTop: number;
	shifted: boolean;
}

export interface MapLayout {
	zoom: number;
	/** Intrinsic size in CSS pixels at this zoom. */
	width: number;
	height: number;
	tiles: MapTile[];
	markers: MapMarker[];
}

export interface MapOptions {
	minZoom?: number;
	maxZoom?: number;
	/** Upper bound on tile requests for one map. */
	maxTiles?: number;
	/** Space kept around the outermost places, in CSS pixels. */
	padding?: number;
}

const DEFAULTS: Required<MapOptions> = {
	minZoom: 1,
	maxZoom: 5,
	maxTiles: 16,
	padding: 48
};

/** Points are 8px wide, so anything closer than this would read as one dot. */
const MIN_MARKER_GAP_PX = 14;

/**
 * Projects a coordinate into Web Mercator world pixels at the given zoom.
 */
export function projectToWorldPixel(
	latitude: number,
	longitude: number,
	zoom: number
): { x: number; y: number } {
	const worldSize = TILE_SIZE * 2 ** zoom;
	const clampedLatitude = Math.max(Math.min(latitude, 85.05112878), -85.05112878);
	const latitudeRadians = (clampedLatitude * Math.PI) / 180;
	const y =
		((1 - Math.log(Math.tan(latitudeRadians) + 1 / Math.cos(latitudeRadians)) / Math.PI) /
			2) *
		worldSize;

	return {
		x: ((longitude + 180) / 360) * worldSize,
		// Rounding at the poles can land a hair outside the world, which would
		// put a marker or tile off the map box.
		y: Math.min(Math.max(y, 0), worldSize)
	};
}

/**
 * Builds one tile request. The basemap endpoint orders rows before columns, so
 * the placeholders are filled by name rather than by position.
 */
export function tileUrl(zoom: number, x: number, y: number): string {
	return TILE_URL_TEMPLATE.replace('{z}', String(zoom))
		.replace('{y}', String(y))
		.replace('{x}', String(x));
}

/**
 * Lays out the tiles and markers that frame every city. Zooms in as far as the
 * tile budget allows, so nearby places stay distinguishable.
 */
export function buildMapLayout(cities: City[], options: MapOptions = {}): MapLayout {
	if (cities.length === 0) {
		throw new Error('buildMapLayout needs at least one city');
	}

	const { minZoom, maxZoom, maxTiles, padding } = { ...DEFAULTS, ...options };

	for (let zoom = maxZoom; zoom >= minZoom; zoom -= 1) {
		const layout = layoutAtZoom(cities, zoom, padding);
		if (layout.tiles.length <= maxTiles) return layout;
	}

	return layoutAtZoom(cities, minZoom, padding);
}

function layoutAtZoom(cities: City[], zoom: number, padding: number): MapLayout {
	const projected = cities.map((city) => ({
		city,
		...projectToWorldPixel(city.latitude, city.longitude, zoom)
	}));

	const xs = projected.map((point) => point.x);
	const ys = projected.map((point) => point.y);

	const firstTileX = Math.floor((Math.min(...xs) - padding) / TILE_SIZE);
	const lastTileX = Math.floor((Math.max(...xs) + padding) / TILE_SIZE);
	const firstTileY = Math.floor((Math.min(...ys) - padding) / TILE_SIZE);
	const lastTileY = Math.floor((Math.max(...ys) + padding) / TILE_SIZE);

	const columns = lastTileX - firstTileX + 1;
	const rows = lastTileY - firstTileY + 1;
	const width = columns * TILE_SIZE;
	const height = rows * TILE_SIZE;
	const originX = firstTileX * TILE_SIZE;
	const originY = firstTileY * TILE_SIZE;

	const tiles: MapTile[] = [];
	for (let x = firstTileX; x <= lastTileX; x += 1) {
		for (let y = firstTileY; y <= lastTileY; y += 1) {
			tiles.push({
				key: `${zoom}/${x}/${y}`,
				url: tileUrl(zoom, x, y),
				left: ((x * TILE_SIZE - originX) / width) * 100,
				top: ((y * TILE_SIZE - originY) / height) * 100,
				width: (TILE_SIZE / width) * 100,
				height: (TILE_SIZE / height) * 100
			});
		}
	}

	const markers: MapMarker[] = separateMarkers(
		projected.map((point) => ({
			id: point.city.id,
			name: point.city.name,
			left: ((point.x - originX) / width) * 100,
			top: ((point.y - originY) / height) * 100,
			anchorLeft: ((point.x - originX) / width) * 100,
			anchorTop: ((point.y - originY) / height) * 100,
			shifted: false
		})),
		width,
		height
	);

	return { zoom, width, height, tiles, markers };
}

/**
 * Pushes apart markers that would sit on top of each other, such as Bath and
 * Swansea. Each nudge moves away from the marker it collides with, so the
 * relative position still reads correctly, and the leader line stays vertical.
 */
function separateMarkers(markers: MapMarker[], width: number, height: number): MapMarker[] {
	const placed: { x: number; y: number }[] = [];

	return markers.map((marker) => {
		const x = (marker.anchorLeft / 100) * width;
		let y = (marker.anchorTop / 100) * height;
		let attempts = 0;

		for (;;) {
			const partner = placed.find((other) => Math.hypot(other.x - x, other.y - y) < MIN_MARKER_GAP_PX);
			if (!partner || attempts >= 12) break;

			const direction = Math.sign(y - partner.y) || 1;
			y += direction * MIN_MARKER_GAP_PX;
			attempts += 1;
		}

		placed.push({ x, y });

		return {
			...marker,
			top: (Math.min(Math.max(y, MIN_MARKER_GAP_PX / 2), height - MIN_MARKER_GAP_PX) / height) * 100,
			shifted: Math.abs(y - (marker.anchorTop / 100) * height) > 0.5
		};
	});
}
