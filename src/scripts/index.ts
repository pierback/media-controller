import { ChromeStateHandler } from './handlers/chromeStateHandler';
import { ItunesStateHandler } from './handlers/itunesStateHandler';
import { SpotifyStateHandler } from './handlers/spotifyStateHandler';

let extHandlers = [ChromeStateHandler, ItunesStateHandler, SpotifyStateHandler];

export { extHandlers };