
import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech } from './geminiService';
import { VoiceType } from './types';
import { audioBufferToWav } from './audioUtils';

type Theme = 'navy' | 'grey';

const App: React.FC = () => {
  const [thaiText, setThaiText] = useState('');
  const [englishText, setEnglishText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('navy');

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) window.clearInterval(progressIntervalRef.current);
    };
  }, []);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const handleGenerate = async () => {
    if (!thaiText && !englishText) {
      setError('กรุณาใส่ข้อความภาษาไทย หรือ ภาษาอังกฤษ');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setAudioBuffer(null);
    setProgress(0);
    setIsPlaying(false);
    
    try {
      initAudioContext();
      const buffer = await generateSpeech(thaiText, englishText, VoiceType.FEMALE, audioContextRef.current!);
      setAudioBuffer(buffer);
    } catch (err: any) {
      console.error(err);
      setError('การสร้างเสียงล้มเหลว กรุณาตรวจสอบการเชื่อมต่อของคุณ');
    } finally {
      setIsGenerating(false);
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsPlaying(false);
  };

  const playAudio = () => {
    if (!audioBuffer || !audioContextRef.current) return;
    
    stopAudio();
    initAudioContext();

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      setIsPlaying(false);
      setProgress(100);
      if (progressIntervalRef.current) window.clearInterval(progressIntervalRef.current);
    };

    const startTime = audioContextRef.current.currentTime;
    source.start(0);
    sourceNodeRef.current = source;
    setIsPlaying(true);
    
    progressIntervalRef.current = window.setInterval(() => {
      if (!audioBuffer) return;
      const elapsed = audioContextRef.current!.currentTime - startTime;
      const newProgress = Math.min((elapsed / audioBuffer.duration) * 100, 100);
      setProgress(newProgress);
      if (newProgress >= 100) {
          if (progressIntervalRef.current) window.clearInterval(progressIntervalRef.current);
      }
    }, 100);
  };

  const handleDownload = () => {
    if (!audioBuffer) return;
    const wavBlob = audioBufferToWav(audioBuffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pr_voice_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const bgGradient = theme === 'navy' 
    ? 'bg-[linear-gradient(135deg,#001f3f_0%,#003366_100%)]' 
    : 'bg-[linear-gradient(135deg,#2d3436_0%,#000000_100%)]';

  const accentColor = theme === 'navy' ? 'blue' : 'slate';
  const buttonGradient = theme === 'navy'
    ? 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
    : 'from-slate-600 to-zinc-600 hover:from-slate-500 hover:to-zinc-500';

  const progressGradient = theme === 'navy'
    ? 'from-blue-400 to-indigo-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]'
    : 'from-slate-300 to-zinc-400 shadow-[0_0_8px_rgba(200,200,200,0.3)]';

  return (
    <div className={`theme-transition flex flex-col items-center justify-center p-4 md:p-8 min-h-screen ${bgGradient}`}>
      
      {/* Theme Switcher */}
      <div className="absolute top-6 right-6 flex items-center gap-2 p-1 liquid-glass rounded-full border-white/10">
        <button 
          onClick={() => setTheme('navy')}
          className={`w-8 h-8 rounded-full border-2 transition-all ${theme === 'navy' ? 'bg-[#003366] border-white' : 'bg-[#003366]/40 border-transparent hover:border-white/20'}`}
          title="Navy Theme"
        />
        <button 
          onClick={() => setTheme('grey')}
          className={`w-8 h-8 rounded-full border-2 transition-all ${theme === 'grey' ? 'bg-[#2d3436] border-white' : 'bg-[#2d3436]/40 border-transparent hover:border-white/20'}`}
          title="Grey Theme"
        />
      </div>

      <div className="w-full max-w-2xl liquid-glass rounded-3xl p-6 md:p-10 text-white space-y-8">
        
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">PR Voice Generator</h1>
          <p className="text-white/60 text-sm">สร้างเสียงประกาศสำหรับองค์กร</p>
        </header>

        {/* Input Sections */}
        <div className="grid grid-cols-1 gap-6">
          <div className="relative group">
            <div className={`absolute -top-3 left-4 ${theme === 'navy' ? 'bg-[#001f3f]' : 'bg-[#2d3436]'} px-2 py-0.5 rounded text-[10px] font-bold text-blue-400 border border-blue-400/30`}>THAI TEXT</div>
            <textarea
              value={thaiText}
              onChange={(e) => setThaiText(e.target.value)}
              placeholder="ใส่ข้อความภาษาไทยที่นี่..."
              className="w-full h-28 glass-input rounded-xl p-4 text-white placeholder-white/20 resize-none pt-6 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="relative group">
            <div className={`absolute -top-3 left-4 ${theme === 'navy' ? 'bg-[#001f3f]' : 'bg-[#2d3436]'} px-2 py-0.5 rounded text-[10px] font-bold text-green-400 border border-green-400/30`}>ENGLISH TEXT</div>
            <textarea
              value={englishText}
              onChange={(e) => setEnglishText(e.target.value)}
              placeholder="Enter English text here..."
              className="w-full h-28 glass-input rounded-xl p-4 text-white placeholder-white/20 resize-none pt-6 focus:ring-2 focus:ring-green-500/20"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-xl active:scale-95 ${isGenerating ? 'bg-white/10 text-white/40 cursor-not-allowed' : `bg-gradient-to-r ${buttonGradient} text-white`}`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังสร้างไฟล์เสียง...
              </span>
            ) : 'สร้างเสียงประกาศ (รวมไทย-อังกฤษ)'}
          </button>
        </div>

        {error && <p className="text-red-400 text-sm text-center bg-red-400/10 p-2 rounded-lg border border-red-400/20">{error}</p>}

        {/* Player Controls */}
        <div className="space-y-4">
          <div className="liquid-glass rounded-2xl p-5">
             <div className="flex items-center gap-5">
                <button 
                  onClick={isPlaying ? stopAudio : playAudio}
                  disabled={!audioBuffer}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${audioBuffer ? 'bg-white text-navy-900 hover:scale-105 active:scale-90' : 'bg-white/5 text-white/10 cursor-not-allowed'}`}
                >
                  {isPlaying ? (
                    <svg className={`w-7 h-7 fill-current ${theme === 'navy' ? 'text-[#001f3f]' : 'text-slate-800'}`} viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  ) : (
                    <svg className={`w-7 h-7 fill-current ${theme === 'navy' ? 'text-[#001f3f]' : 'text-slate-800'} ml-1`} viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>
                <div className="flex-1 space-y-2">
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r transition-all duration-100 ease-linear ${progressGradient}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/30 font-medium">
                    <span>{isPlaying ? 'กำลังเล่น...' : (audioBuffer ? 'ไฟล์เสียงพร้อมแล้ว' : 'รอการสร้างเสียง')}</span>
                    <span>{audioBuffer ? `${audioBuffer.duration.toFixed(1)}s` : '0.0s'}</span>
                  </div>
                </div>
             </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={!audioBuffer}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all border ${audioBuffer ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white cursor-pointer active:scale-95' : 'bg-transparent border-white/5 text-white/10 cursor-not-allowed'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            <span className="font-semibold uppercase tracking-wider text-sm">Download WAV File</span>
          </button>
        </div>

        <footer className="pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">Corporate Public Relations Solution</p>
        </footer>
      </div>

      {/* Deployment Guide */}
      <div className="mt-10 w-full max-w-2xl text-white/40 text-[13px] bg-black/10 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
        <h3 className="text-white/80 font-bold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            วิธีติดตั้งบน Google Sites
        </h3>
        <ol className="list-decimal list-inside space-y-1.5 ml-1">
            <li>นำ Source Code นี้ไปโฮสต์บน Web Hosting (เช่น Netlify หรือ Vercel)</li>
            <li>คัดลอก URL ของหน้าเว็บที่ออนไลน์แล้ว</li>
            <li>ใน Google Sites: เลือกเมนู <strong>ฝัง (Embed)</strong> &gt; วาง URL &gt; กด <strong>แทรก (Insert)</strong></li>
        </ol>
      </div>
    </div>
  );
};

export default App;
