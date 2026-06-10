import { createPinia } from 'pinia';
import { createPersistPlugin } from './plugins/persist';

const pinia = createPinia();
pinia.use(createPersistPlugin());

export default pinia;
