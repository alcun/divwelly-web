import Lizard from '@loggerlizard/lizard';

const apiKey = process.env.NEXT_PUBLIC_LOGGERLIZARD_API_KEY;

if (apiKey) {
  new Lizard(apiKey, {
    autoTrack: true,
    debug: false
  });
}
