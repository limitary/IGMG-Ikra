import { useCallback, useEffect, useRef, useState } from 'react';
import { assetUrl } from './content';

export type AudioStatus = 'idle' | 'playing' | 'paused' | 'error' | 'missing';

/**
 * Speelt één lokaal audiobestand af. Een ontbrekend of kapot bestand geeft
 * status 'missing' of 'error', zodat het scherm een melding kan tonen
 * zonder dat de rest van de app stopt.
 */
export function useAudio(src: string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<AudioStatus>(src ? 'idle' : 'missing');
  const [loop, setLoopState] = useState(false);
  const [rate, setRateState] = useState(1);

  useEffect(() => {
    if (!src) {
      setStatus('missing');
      return;
    }
    const audio = new Audio();
    audio.preload = 'none';
    audio.src = assetUrl(src);
    audioRef.current = audio;
    setStatus('idle');
    const onPlay = () => setStatus('playing');
    const onPause = () => setStatus((s) => (s === 'error' ? s : 'paused'));
    const onEnded = () => setStatus('idle');
    const onError = () => setStatus('error');
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    return () => {
      audio.pause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeAttribute('src');
      audioRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = loop;
  }, [loop, src]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate, src]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = audio.ended ? 0 : audio.currentTime;
    audio.play().catch((error: unknown) => {
      // Afgebroken door wisselen van fragment is geen echte fout.
      if (audioRef.current === audio && (error as { name?: string })?.name !== 'AbortError') setStatus('error');
    });
  }, []);

  const pause = useCallback(() => audioRef.current?.pause(), []);

  const toggle = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) pause();
    else play();
  }, [play, pause]);

  return {
    status: src ? status : ('missing' as const),
    play,
    pause,
    toggle,
    loop,
    setLoop: setLoopState,
    rate,
    setRate: setRateState,
  };
}
