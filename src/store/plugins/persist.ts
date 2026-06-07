import type { PiniaPluginContext, StateTree } from 'pinia';

export interface PersistOptions {
  key?: string;
  storage?: Storage;
  paths?: string[];
  afterRestore?: (context: PiniaPluginContext) => void;
}

export type PersistConfig = boolean | PersistOptions;

export function createPersistPlugin(defaultOptions?: PersistOptions) {
  return (context: PiniaPluginContext) => {
    const { store, options } = context;
    const persist = (options as { persist?: PersistConfig }).persist;

    if (!persist) {
      return;
    }

    const config: PersistOptions = {
      ...defaultOptions,
      ...(persist === true ? {} : persist),
    };

    const storage = config.storage ?? localStorage;
    const key = config.key ?? store.$id;
    const { paths } = config;

    const pickState = (state: StateTree) => {
      if (!paths?.length) {
        return { ...state };
      }
      return paths.reduce<StateTree>((result, path) => {
        result[path] = state[path];
        return result;
      }, {});
    };

    const saved = storage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved) as StateTree;
        store.$patch(data);
        config.afterRestore?.(context);
      } catch {
        storage.removeItem(key);
      }
    }

    store.$subscribe(
      () => {
        storage.setItem(key, JSON.stringify(pickState(store.$state)));
      },
      { detached: true }
    );
  };
}

declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface DefineStoreOptionsBase<S extends StateTree, Store> {
    persist?: PersistConfig;
  }
}
