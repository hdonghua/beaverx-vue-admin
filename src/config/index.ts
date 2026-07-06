import fixedSettings from './settings.json';
import {
  userPreferenceDefaults,
  USER_PREFERENCE_KEYS,
} from './user-preference-defaults';

export type FixedSettings = typeof fixedSettings;

export { fixedSettings, userPreferenceDefaults, USER_PREFERENCE_KEYS };

export default fixedSettings;
