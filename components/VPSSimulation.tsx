import React, { useEffect, useRef, useState } from 'react';
import { useSandboxStore } from '../lib/state';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function VPSSimulation() {
  const browserWindowRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const addressBarRef = useRef<HTMLDivElement>(null);
  const urlTextRef = useRef<HTMLSpanElement>(null);
  const lastCommand = useSandboxStore((state) => state.lastCommand);
  const setLastCommand = useSandboxStore((state) => state.setLastCommand);
  const setSandboxState = useSandboxStore((state) => state.setSandboxState);

  const [activeScreen, setActiveScreen] = useState('google');
  const [currentUrl, setCurrentUrl] = useState('google.com');
  
  // States for dynamic content
  const [gSearchText, setGSearchText] = useState('');
  const [showGResults, setShowGResults] = useState(false);
  const [showGHome, setShowGHome] = useState(true);
  
  const [ytSearchText, setYtSearchText] = useState('');
  const [ytIframeSrc, setYtIframeSrc] = useState('');

  const [idePrompt, setIdePrompt] = useState('');
  const [chatMessages, setChatMessages] = useState<{id: string; role: 'user'|'bot'; html: string}[]>([]);

  const scaleFactor = 0.40; 

  const moveCursorToElement = async (
    id: string, 
    offsetX: number = 20, 
    offsetY: number = 20, 
    duration: number = 600
  ) => {
    const el = document.getElementById(id);
    if (!cursorRef.current || !el || !browserWindowRef.current) return;
    
    const targetRect = el.getBoundingClientRect();
    const containerRect = browserWindowRef.current.getBoundingClientRect();
    
    const x = (targetRect.left - containerRect.left) / scaleFactor + offsetX;
    const y = (targetRect.top - containerRect.top) / scaleFactor + offsetY;
    
    cursorRef.current.style.transitionDuration = `${duration}ms`;
    cursorRef.current.style.left = `${x}px`;
    cursorRef.current.style.top = `${y}px`;
    await wait(duration);
  };

  const moveCursorToRaw = async (x: number, y: number, duration: number = 600) => {
    if (!cursorRef.current) return;
    cursorRef.current.style.transitionDuration = `${duration}ms`;
    cursorRef.current.style.left = `${x}px`;
    cursorRef.current.style.top = `${y}px`;
    await wait(duration);
  };

  const clickAction = async () => {
    if (!cursorRef.current) return;
    cursorRef.current.style.transform = 'scale(0.85)';
    await wait(120);
    cursorRef.current.style.transform = 'scale(1)';
    await wait(150);
  };

  const typeText = async (setter: (val: string) => void, text: string, speed = 30) => {
    let current = '';
    for (let i = 0; i < text.length; i++) {
      current += text.charAt(i);
      setter(current);
      await wait(speed + Math.random() * 15);
    }
  };

  // Process commands from AI
  useEffect(() => {
    if (!lastCommand) return;

    const handleCommand = async () => {
      const cmd = lastCommand;
      setLastCommand(null); // Consume

      switch (cmd.action) {
        case 'NAVIGATE':
          if (!cmd.url) return;
          
          // Address bar animation
          await moveCursorToElement('vps-address-bar', 100, 15);
          await clickAction();
          const targetUrl = cmd.url.toLowerCase();
          
          if (targetUrl.includes('google.com')) {
            setActiveScreen('google');
            setShowGHome(true);
            setShowGResults(false);
          } else if (targetUrl.includes('youtube.com')) {
            setActiveScreen('youtube');
          } else if (targetUrl.includes('agent') || targetUrl.includes('eburon')) {
            setActiveScreen('ide');
          } else {
            setActiveScreen('iframe');
            setCurrentUrl(cmd.url);
          }
          setCurrentUrl(cmd.url);
          break;

        case 'CLICK':
          if (cmd.element_id) {
            await moveCursorToElement(cmd.element_id);
            await clickAction();
            
            // Logic for specific elements
            if (cmd.element_id === 'vps-g-target-link') {
              setActiveScreen('iframe');
              setCurrentUrl('eburon.ai');
            }
          } else if (cmd.x !== undefined && cmd.y !== undefined) {
             await moveCursorToRaw(cmd.x, cmd.y);
             await clickAction();
          }
          break;

        case 'TYPE':
          if (cmd.text) {
            if (cmd.element_id) {
              await moveCursorToElement(cmd.element_id);
              await clickAction();
              
              if (cmd.element_id === 'vps-g-search') {
                await typeText(setGSearchText, cmd.text);
                setShowGHome(false);
                setShowGResults(true);
                setCurrentUrl(`google.com/search?q=${encodeURIComponent(cmd.text)}`);
              } else if (cmd.element_id === 'vps-yt-search') {
                await typeText(setYtSearchText, cmd.text);
                setYtIframeSrc("https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&controls=0");
              } else if (cmd.element_id === 'vps-ide-input') {
                await typeText(setIdePrompt, cmd.text);
              }
            }
          }
          break;

        case 'CLOSE':
          // Close active view logic
          setActiveScreen('google');
          setCurrentUrl('google.com');
          setShowGHome(true);
          setShowGResults(false);
          break;
      }
      
      // Update state for AI to 
      setSandboxState({
          url: currentUrl,
          activeScreen,
          visibleElements: ['vps-address-bar', 'vps-g-search', 'vps-yt-search', 'vps-ide-input']
      });
    };

    handleCommand();
  }, [lastCommand, activeScreen, currentUrl, setLastCommand, setSandboxState]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        ref={browserWindowRef}
        style={{
          width: '100%', 
          height: '100%', 
          backgroundColor: '#0f172a', 
          display: 'flex', 
          flexDirection: 'column', 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          color: '#f8fafc'
        }}
      >
        {/* Browser Header */}
        <div style={{ height: '50px', backgroundColor: '#020617', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '20px', zIndex: 10 }}>
          <div style={{ display: 'flex', gap: '8px' }}>
             <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56' }}></span>
             <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></span>
             <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f' }}></span>
          </div>
          <div id="vps-address-bar" ref={addressBarRef} style={{ flex: 1, maxWidth: '600px', margin: '0 auto', backgroundColor: '#0f172a', height: '30px', borderRadius: '6px', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '13px', color: '#94a3b8', border: '1px solid #1e293b', transition: 'all 0.2s' }}>
            <svg style={{ marginRight: '8px', color: '#64748b' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span ref={urlTextRef}>{currentUrl}</span>
            <span style={{ display: 'inline-block', width: '2px', height: '14px', backgroundColor: '#fff', marginLeft: '2px', animation: 'blink 1s step-end infinite' }} />
          </div>
        </div>
        
        <div style={{ flex: 1, position: 'relative', backgroundColor: '#0f172a' }}>
          {/* Google Screen */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#202124', opacity: activeScreen === 'google' ? 1 : 0, pointerEvents: activeScreen === 'google' ? 'auto' : 'none', transition: 'opacity 0.4s ease', zIndex: activeScreen === 'google' ? 5 : 0 }}>
            {showGHome && (
              <div style={{ marginTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div style={{ fontSize: '45px', fontWeight: 500, marginBottom: '25px', color: '#fff' }}>
                  <span style={{color: '#4285f4'}}>G</span><span style={{color: '#ea4335'}}>o</span><span style={{color: '#fbbc05'}}>o</span><span style={{color: '#4285f4'}}>g</span><span style={{color: '#34a853'}}>l</span><span style={{color: '#ea4335'}}>e</span>
                </div>
                <div id="vps-g-search" style={{ width: '450px', height: '44px', borderRadius: '22px', border: '1px solid #5f6368', display: 'flex', alignItems: 'center', padding: '0 20px', fontSize: '15px' }}>
                  <span>{gSearchText}</span>
                  <span style={{ display: 'inline-block', width: '2px', height: '18px', backgroundColor: '#fff', marginLeft: '2px' }} />
                </div>
              </div>
            )}
            {showGResults && (
              <div style={{ width: '100%', padding: '20px 80px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #3c4043', paddingBottom: '15px', alignItems: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 500 }}>Google</div>
                  <div style={{ width: '500px', height: '40px', borderRadius: '20px', border: '1px solid #5f6368', background: '#303134', display: 'flex', alignItems: 'center', padding: '0 20px' }}>{gSearchText}</div>
                </div>
                <div id="vps-g-target-link" style={{ maxWidth: '600px', margin: '15px 0', cursor: 'pointer' }}>
                  <cite style={{ color: '#bdc1c6', fontSize: '13px', fontStyle: 'normal' }}>https://eburon.ai</cite>
                  <h3 style={{ color: '#8ab4f8', fontSize: '20px', margin: '4px 0 8px', fontWeight: 400 }}>Eburon AI - Next Generation AI Systems</h3>
                  <p style={{ color: '#bdc1c6', lineHeight: 1.5, margin: 0 }}>Eburon AI builds advanced autonomous systems, coding agents, and seamless workflow integrations.</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Iframe View */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: activeScreen === 'iframe' ? 1 : 0, pointerEvents: activeScreen === 'iframe' ? 'auto' : 'none', transition: 'opacity 0.4s ease', zIndex: activeScreen === 'iframe' ? 5 : 0 }}>
             <iframe src={`https://${currentUrl.includes('://') ? currentUrl.split('://')[1] : currentUrl}`} style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }} />
          </div>
          
          {/* Youtube View */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#0f0f0f', opacity: activeScreen === 'youtube' ? 1 : 0, pointerEvents: activeScreen === 'youtube' ? 'auto' : 'none', transition: 'opacity 0.4s ease', zIndex: activeScreen === 'youtube' ? 5 : 0 }}>
            <div style={{ height: '56px', display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #272727', gap: '40px' }}>
              <div style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>YouTube</div>
              <div id="vps-yt-search" style={{ width: '40%', height: '38px', border: '1px solid #303030', background: '#121212', borderRadius: '20px', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
                <span>{ytSearchText}</span>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
                {ytIframeSrc && <iframe width="100%" height="100%" src={ytIframeSrc} frameBorder="0" allowFullScreen />}
              </div>
            </div>
          </div>

          {/* IDE View */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#0d1117', display: 'flex', opacity: activeScreen === 'ide' ? 1 : 0, transition: 'opacity 0.4s ease', zIndex: activeScreen === 'ide' ? 5 : 0 }}>
             <div style={{ width: '120px', borderRight: '1px solid #30363d', backgroundColor: '#010409' }}></div>
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, padding: '20px' }}>
                   {chatMessages.map(m => (
                     <div key={m.id} style={{ marginBottom: '10px', fontSize: '13px' }}>{m.role === 'user' ? 'User: ' : 'Beatrice: '}{m.html}</div>
                   ))}
                </div>
                <div id="vps-ide-input" style={{ margin: '20px', height: '40px', border: '1px solid #30363d', borderRadius: '6px', background: '#010409', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                  {idePrompt}
                </div>
             </div>
          </div>
        </div>

        {/* Floating System Cursor */}
        <div 
           ref={cursorRef} 
           style={{
             position: 'absolute', width: '32px', height: '32px',
             backgroundImage: `url('data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 3.21V20.8C5.5 21.46 6.27 21.82 6.77 21.4L11.44 17.38C11.66 17.19 11.95 17.09 12.25 17.09H18.5C19.16 17.09 19.52 16.32 19.1 15.82L6.77 2.65C6.35 2.2 5.5 2.5 5.5 3.21Z" fill="%23000000" stroke="%23ffffff" stroke-width="1.5"/></svg>')`,
             zIndex: 9999, top: '60%', left: '70%',
             transition: 'top 0.6s cubic-bezier(0.25, 1, 0.5, 1), left 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.1s',
             pointerEvents: 'none'
           }}
        />
      </div>
    </div>
  );
}
