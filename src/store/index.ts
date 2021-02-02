import stateController from 'state-controller';
import useBrilliantController from './useBrilliantController';

const stateControlStore = stateController.combine(useBrilliantController);

export default stateControlStore;
