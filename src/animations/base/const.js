/**
 * Created by brian on 17/03/2017.
 */
export const ANIMATION_NONE = 0;
export const ANIMATION_SNOW = 1;
export const ANIMATION_STAR = 1 << 1;
export const ANIMATION_MOON = 1 << 2;
export const ANIMATION_SUN = 1 << 3;
export const ANIMATION_RAIN = 1 << 4;
export type AnimationType=ANIMATION_STAR|ANIMATION_SNOW|ANIMATION_RAIN|ANIMATION_MOON|ANIMATION_NONE|ANIMATION_SUN;
