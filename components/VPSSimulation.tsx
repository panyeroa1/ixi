import React, { useEffect, useRef, useState } from 'react';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function VPSSimulation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const addressBarRef = useRef<HTMLDivElement>(null);
  const urlTextRef = useRef<HTMLSpanElement>(null);
  const browserWindowRef = useRef<HTMLDivElement>(null);

  const [activeScreen, setActiveScreen] = useState('google');
  
  // States for dynamic content
  const [gSearchText, setGSearchText] = useState('');
  const [showGResults, setShowGResults] = useState(false);
  const [showGHome, setShowGHome] = useState(true);
  
  const [ytSearchText, setYtSearchText] = useState('');
  const [ytIframeSrc, setYtIframeSrc] = useState('');

  const [idePrompt, setIdePrompt] = useState('');
  const [chatMessages, setChatMessages] = useState<{id: string; role: 'user'|'bot'; html: string}[]>([]);

  // Simulation execution flag to prevent overlaps
  const isRunning = useRef(false);

  const scaleFactor = 0.40; 

  const moveCursorTo = async (
    elementRef: React.RefObject<HTMLElement>, 
    offsetX: number = 0, 
    offsetY: number = 0, 
    duration: number = 600
  ) => {
    if (!cursorRef.current || !elementRef.current || !browserWindowRef.current) return;
    
    const targetRect = elementRef.current.getBoundingClientRect();
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

  const typeText = async (setter: React.Dispatch<React.SetStateAction<string>>, text: string, speed = 35) => {
    setter('');
    let current = '';
    for (let i = 0; i < text.length; i++) {
      current += text.charAt(i);
      setter(current);
      await wait(speed + Math.random() * 20);
    }
  };

  const typeUrl = async (url: string) => {
    if (!addressBarRef.current) return;
    await moveCursorTo(addressBarRef, 60, 15, 600);
    await clickAction();
    if (addressBarRef.current) addressBarRef.current.style.borderColor = '#6366f1';
    await wait(200);
    await typeText((val) => { if (urlTextRef.current) urlTextRef.current.textContent = (val as any); }, url, 25);
    await wait(300);
    if (addressBarRef.current) addressBarRef.current.style.borderColor = '#1e293b';
  };

  const runSimulation = async () => {
    if (isRunning.current) return;
    isRunning.current = true;

    // Reset
    setShowGHome(true);
    setShowGResults(false);
    setGSearchText('');
    setYtSearchText('');
    setYtIframeSrc('');
    setIdePrompt('');
    setChatMessages([]);
    if (urlTextRef.current) urlTextRef.current.textContent = '';
    
    if (cursorRef.current) {
        cursorRef.current.style.left = '70%';
        cursorRef.current.style.top = '60%';
    }
    await wait(1000);

    // ================== GOOGLE SEARCH ==================
    await typeUrl('google.com');
    setActiveScreen('google');
    
    await wait(800);
    const gSearchBox = document.getElementById('vps-g-search');
    if (gSearchBox) {
        await moveCursorTo({ current: gSearchBox }, 150, 22, 600);
        await clickAction();
        gSearchBox.style.borderColor = '#8ab4f8';
        await typeText(setGSearchText, 'Eburon AI', 40);
        await wait(400);
        gSearchBox.style.borderColor = '#5f6368';
    }
    
    // Show results
    setShowGHome(false);
    setShowGResults(true);
    if (urlTextRef.current) urlTextRef.current.textContent = 'google.com/search?q=Eburon+AI';
    await wait(800);

    // Click target
    const gTarget = document.getElementById('vps-g-target-link');
    if (gTarget) {
        await moveCursorTo({ current: gTarget }, 100, 30, 700);
        await clickAction();
    }

    // ================== REAL WEBSITE ==================
    setActiveScreen('iframe');
    if (urlTextRef.current) urlTextRef.current.textContent = 'eburon.ai';
    
    // Read simulation hover
    await moveCursorToRaw(400, 250, 1000);
    await wait(1000);
    await moveCursorToRaw(600, 400, 1500);
    await wait(2000);

    // ================== YOUTUBE ==================
    await typeUrl('youtube.com');
    setActiveScreen('youtube');
    
    await wait(800);
    const ytSearch = document.getElementById('vps-yt-search');
    if (ytSearch) {
        await moveCursorTo({ current: ytSearch }, 60, 19, 600);
        await clickAction();
        ytSearch.style.borderColor = '#3ea6ff';
        await typeText(setYtSearchText, 'Eburon Agent demo', 35);
        await wait(400);
        ytSearch.style.borderColor = '#303030';
    }
    if (urlTextRef.current) urlTextRef.current.textContent = 'youtube.com/watch?v=agent_demo';
    
    setYtIframeSrc("https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&controls=0");
    await moveCursorToRaw(750, 450, 800);
    await wait(4000); 

    // ================== IDE (BEATRICE) ==================
    await typeUrl('agent.eburon.ai');
    setActiveScreen('ide');
    await wait(1000);

    // Chat
    const ideInput = document.getElementById('vps-ide-input');
    if (ideInput) {
        await moveCursorTo({ current: ideInput }, 30, 24, 700);
        await clickAction();
        ideInput.style.borderColor = '#6366f1';
    }
    
    const promptStr = "Write a tool to extract headings from eburon.ai.";
    await typeText(setIdePrompt, promptStr, 30);
    await wait(400);
    
    const sendBtn = document.getElementById('vps-ide-send');
    if (sendBtn) {
        await moveCursorTo({ current: sendBtn }, 24, 24, 300);
        sendBtn.style.transform = 'scale(0.9)';
        await clickAction();
        sendBtn.style.transform = 'scale(1)';
    }
    
    if (ideInput) ideInput.style.borderColor = '#30363d';
    setIdePrompt('');
    
    await moveCursorToRaw(850, 500, 1000); // move cursor away

    // Append user message
    setChatMessages(prev => [...prev, {
        id: `user-${Date.now()}`,
        role: 'user',
        html: `<div class="bubble">${promptStr}</div>`
    }]);

    await wait(600);
    const botId = `bot-${Date.now()}`;
    setChatMessages(prev => [...prev, {
        id: botId,
        role: 'bot',
        html: `<div class="bubble"><div style="color: #8b949e; margin-bottom: 8px;">Analyzing page structure...</div></div>`
    }]);
    
    const chatArea = document.getElementById('vps-chat-area');
    if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
    
    await wait(1500);

    // Update bot message with code block placeholder
    setChatMessages(prev => prev.map(msg => msg.id === botId ? {
        ...msg,
        html: `
        <div class="bubble">
        <div style="margin-bottom: 8px;">Here is the custom script to extract the information you need:</div>
        <div class="code-block" style="background-color: #161b22; border: 1px solid #30363d; border-radius: 8px; margin-top: 12px; overflow: hidden; font-family: 'JetBrains Mono', monospace;">
            <div class="code-header" style="background-color: #0d1117; padding: 10px 16px; border-bottom: 1px solid #30363d; font-size: 12px; color: #8b949e; display: flex; justify-content: space-between;"><span>scraper.py</span><span>Python</span></div>
            <div class="code-content" style="padding: 16px; font-size: 13px; line-height: 1.5; white-space: pre;" id="vps-code-content-${botId}"></div>
        </div>
        </div>
        `
    } : msg));

    await wait(100); // Let react render

    // Streaming Scraper Code
    const codeTokens = [
      { t: "import", c: "color: #ff7b72" }, { t: " requests\n", c: "" },
      { t: "from", c: "color: #ff7b72" }, { t: " bs4 ", c: "" }, { t: "import", c: "color: #ff7b72" }, { t: " BeautifulSoup\n\n", c: "" },
      { t: "url = ", c: "" }, { t: '"https://eburon.ai"', c: "color: #a5d6ff" }, { t: "\n", c: "" },
      { t: "res = requests.get(url)\n", c: "" },
      { t: "soup = BeautifulSoup(res.text, ", c: "" }, { t: "'html.parser'", c: "color: #a5d6ff" }, { t: ")\n", c: "" },
      { t: "headings = [h.text ", c: "" }, { t: "for", c: "color: #ff7b72" }, { t: " h ", c: "" }, { t: "in", c: "color: #ff7b72" }, { t: " soup.find_all(", c: "" }, { t: "'h2'", c: "color: #a5d6ff" }, { t: ")]\n", c: "" },
      { t: "print(headings)", c: "" }
    ];

    const codeContainer = document.getElementById(`vps-code-content-${botId}`);
    if (codeContainer) {
        // create cursor
        const codeCursor = document.createElement('span');
        codeCursor.style.cssText = "display: inline-block; width: 8px; height: 16px; background-color: #c9d1d9; margin-left: 2px; vertical-align: middle;";
        codeContainer.appendChild(codeCursor);

        for (let token of codeTokens) {
            const span = document.createElement('span');
            if (token.c) span.style.cssText = token.c;
            codeContainer.insertBefore(span, codeCursor);
            
            for (let char of token.t) {
                span.textContent += char;
                await wait(15 + Math.random() * 20);
                if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
            }
        }
        codeCursor.style.display = 'none';
    }
    
    // Wait and Loop forever
    await wait(5000);
    isRunning.current = false;
    runSimulation(); // loop
  };

  useEffect(() => {
    runSimulation();
    return () => {
        isRunning.current = false;
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      
      {/* Container inside the scaled area */}
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
        <div style={{ height: '50px', backgroundColor: '#020617', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '20px', zIndex: 10 }}>
          <div style={{ display: 'flex', gap: '8px' }}>
             <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56' }}></span>
             <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></span>
             <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f' }}></span>
          </div>
          <div ref={addressBarRef} style={{ flex: 1, maxWidth: '600px', margin: '0 auto', backgroundColor: '#0f172a', height: '30px', borderRadius: '6px', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '13px', color: '#94a3b8', border: '1px solid #1e293b', transition: 'all 0.2s' }}>
            <svg style={{ marginRight: '8px', color: '#64748b' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span ref={urlTextRef}></span>
            <span style={{ display: 'inline-block', width: '2px', height: '14px', backgroundColor: '#fff', marginLeft: '2px', animation: 'blink 1s step-end infinite' }} />
          </div>
        </div>
        
        <div style={{ flex: 1, position: 'relative', backgroundColor: '#0f172a' }}>
          
          {/* Google */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#202124', color: '#e8eaed', display: 'flex', flexDirection: 'column', opacity: activeScreen === 'google' ? 1 : 0, pointerEvents: activeScreen === 'google' ? 'auto' : 'none', transition: 'opacity 0.4s ease', zIndex: activeScreen === 'google' ? 5 : 0 }}>
            {showGHome && (
              <div style={{ marginTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div style={{ fontSize: '45px', fontWeight: 500, marginBottom: '25px', color: '#fff', display: 'flex', gap: '2px' }}>
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
                  <div style={{ width: '500px', height: '40px', borderRadius: '20px', border: '1px solid #5f6368', background: '#303134', display: 'flex', alignItems: 'center', padding: '0 20px' }}>Eburon AI</div>
                </div>
                <div id="vps-g-target-link" style={{ maxWidth: '600px', margin: '15px 0' }}>
                  <cite style={{ color: '#bdc1c6', fontSize: '13px', fontStyle: 'normal' }}>https://eburon.ai</cite>
                  <h3 style={{ color: '#8ab4f8', fontSize: '20px', margin: '4px 0 8px', fontWeight: 400 }}>Eburon AI - Next Generation AI Systems</h3>
                  <p style={{ color: '#bdc1c6', lineHeight: 1.5, margin: 0 }}>Eburon AI builds advanced autonomous systems, coding agents, and seamless workflow integrations for the modern web.</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Iframe */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: activeScreen === 'iframe' ? 1 : 0, pointerEvents: activeScreen === 'iframe' ? 'auto' : 'none', transition: 'opacity 0.4s ease', zIndex: activeScreen === 'iframe' ? 5 : 0 }}>
            {activeScreen === 'iframe' && <iframe src="https://eburon.ai/" style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }} />}
          </div>
          
          {/* Youtube */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#0f0f0f', color: '#fff', display: 'flex', flexDirection: 'column', opacity: activeScreen === 'youtube' ? 1 : 0, pointerEvents: activeScreen === 'youtube' ? 'auto' : 'none', transition: 'opacity 0.4s ease', zIndex: activeScreen === 'youtube' ? 5 : 0 }}>
            <div style={{ height: '56px', display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #272727', gap: '40px' }}>
              <div style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '24px', height: '16px', background: '#ff0000', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ borderLeft: '6px solid #fff', borderTop: '4px solid transparent', borderBottom: '4px solid transparent' }}></div>
                </div> YouTube
              </div>
              <div id="vps-yt-search" style={{ width: '40%', height: '38px', border: '1px solid #303030', background: '#121212', borderRadius: '20px', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
                <span>{ytSearchText}</span>
                <span style={{ display: 'inline-block', width: '2px', height: '16px', backgroundColor: '#fff', marginLeft: '2px' }} />
              </div>
            </div>
            <div style={{ padding: '24px', display: 'flex', gap: '24px', flex: 1 }}>
              <div style={{ flex: 1 }}>
                <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
                  {ytIframeSrc && <iframe width="100%" height="100%" src={ytIframeSrc} frameBorder="0" allowFullScreen />}
                </div>
                <h2 style={{ fontSize: '18px', margin: '16px 0 4px', fontWeight: 500 }}>Eburon AI Agent - Capabilities Demo</h2>
                <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>1.2M views • 2 weeks ago</p>
              </div>
            </div>
          </div>

          {/* IDE */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#0d1117', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'row', opacity: activeScreen === 'ide' ? 1 : 0, pointerEvents: activeScreen === 'ide' ? 'auto' : 'none', transition: 'opacity 0.4s ease', zIndex: activeScreen === 'ide' ? 5 : 0 }}>
            <div style={{ width: '180px', borderRight: '1px solid #30363d', backgroundColor: '#010409', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', marginBottom: '12px' }}>My Files</div>
              <div style={{ height: '24px', background: '#21262d', borderRadius: '4px', width: '80%', marginBottom: '8px' }}></div>
              <div style={{ height: '24px', background: '#21262d', borderRadius: '4px', width: '60%' }}></div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div id="vps-chat-area" style={{ flex: 1, padding: '25px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 {chatMessages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', gap: '16px', maxWidth: '85%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px', backgroundColor: msg.role === 'user' ? '#238636' : '#6366f1' }}>
                        {msg.role === 'user' ? 'U' : 'B'}
                      </div>
                      <div 
                         style={{ padding: msg.role === 'user' ? '14px 18px' : '0', borderRadius: '8px', fontSize: '14px', lineHeight: 1.6, backgroundColor: msg.role === 'user' ? '#21262d' : 'transparent', border: msg.role === 'user' ? '1px solid #30363d' : 'none' }}
                         dangerouslySetInnerHTML={{ __html: msg.html }} 
                      />
                    </div>
                 ))}
              </div>
              <div style={{ padding: '20px 30px', borderTop: '1px solid #30363d', display: 'flex', gap: '12px' }}>
                <div id="vps-ide-input" style={{ flex: 1, backgroundColor: '#010409', border: '1px solid #30363d', borderRadius: '8px', padding: '14px 16px', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                    <span>{idePrompt}</span>
                    <span style={{ display: 'inline-block', width: '2px', height: '16px', backgroundColor: '#fff', marginLeft: '2px' }} />
                </div>
                <div id="vps-ide-send" style={{ width: '48px', height: '48px', backgroundColor: '#6366f1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hardware Cursor */}
        <div 
           ref={cursorRef} 
           style={{
             position: 'absolute', width: '32px', height: '32px',
             backgroundImage: `url('data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 3.21V20.8C5.5 21.46 6.27 21.82 6.77 21.4L11.44 17.38C11.66 17.19 11.95 17.09 12.25 17.09H18.5C19.16 17.09 19.52 16.32 19.1 15.82L6.77 2.65C6.35 2.2 5.5 2.5 5.5 3.21Z" fill="%23000000" stroke="%23ffffff" stroke-width="1.5"/></svg>')`,
             zIndex: 9999, top: '60%', left: '70%',
             transition: 'top 0.6s cubic-bezier(0.25, 1, 0.5, 1), left 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.1s',
             pointerEvents: 'none', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
           }}
        />
      </div>

    </div>
  );
}
