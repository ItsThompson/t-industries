export {
	ARROW_EDGE_MARGIN_PX,
	ARROW_FAMILIES,
	DEFAULT_MIN_TURN_RADIUS,
	ENTRY_INSET_PX,
	FADE_OUT_MS,
	FLIGHT_BASE_MS,
	FLIGHT_MAX_MS,
	FLIGHT_MIN_MS,
	FLIGHT_REFERENCE_LENGTH_PX,
	HEAD_HALF_WIDTH_PX,
	HEAD_LENGTH_PX,
	HEAD_NOTCH_PX,
	MAX_ATTEMPTS,
	PEN_SAFETY,
	PHRASE_PADDING_PX,
	arrowHeadPath,
	buildArrowPath,
	endTangent,
	pickFamily,
} from './compose';
export type { BuildArrowRequest } from './compose';
export {
	catmullRomSegments,
	minimumTurnRadius,
	pathData,
	pathLength,
} from './curve';
export type { ArrowFamily, ArrowFrame, BuiltArrow, CubicSegment, Point } from './types';
