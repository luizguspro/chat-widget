
// Configurações de processamento de áudio
export const audioConfig = {
  maxDuration: 60, // segundos
  format: 'webm',
  bitRate: 128000,
  sampleRate: 44100,
  channels: 1,
  
  // Configurações de speech-to-text (se usar Google Cloud Speech)
  speechToText: {
    encoding: 'WEBM_OPUS',
    sampleRateHertz: 48000,
    languageCode: 'pt-BR',
    enableAutomaticPunctuation: true,
    model: 'latest_long'
  }
};
