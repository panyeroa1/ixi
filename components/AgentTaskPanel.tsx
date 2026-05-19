import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { useUI } from '../lib/state';
import { VPSSimulation } from './VPSSimulation';

export function AgentTaskPanel() {
  const isGenerating = useUI((state) => state.isGenerating);
  const activeWorkspaceResult = useUI((state) => state.activeWorkspaceResult);

  const [logs, setLogs] = useState<{ id: number; message: string; time: string }[]>([]);
  const [currentStep, setCurrentStep] = useState('Idle');

  // Simulated log updates when generating
  useEffect(() => {
    if (!isGenerating && !activeWorkspaceResult) {
      setLogs([]);
      setCurrentStep('Idle');
      return;
    }

    if (activeWorkspaceResult) {
       setLogs(prev => [...prev, { id: Date.now(), message: 'Finished.', time: new Date().toLocaleTimeString() }]);
       setCurrentStep('Task completed.');
       return;
    }

    setLogs([{ id: 1, message: 'Beatrice is working on it...', time: new Date().toLocaleTimeString() }]);
    setCurrentStep('Starting task...');
    
    // Fake sequence
    const sequence = [
      { t: 1000, msg: "Opening page...", step: "Browser view" },
      { t: 2500, msg: "Reading the selected section...", step: "Analyzing content" },
      { t: 4000, msg: "Creating document...", step: "Drafting" },
      { t: 6000, msg: "Saving file...", step: "Saving" },
      { t: 7500, msg: "Checking result...", step: "Verifying" }
    ];

    let timeouts: any[] = [];
    sequence.forEach((item) => {
       const timeout = setTimeout(() => {
          setLogs(prev => [...prev, { id: Date.now(), message: item.msg, time: new Date().toLocaleTimeString() }]);
          setCurrentStep(item.step);
       }, item.t);
       timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);

  }, [isGenerating, activeWorkspaceResult]);

  if (!isGenerating && !activeWorkspaceResult) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: activeWorkspaceResult ? '100%' : 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="agent-task-panel"
        style={{
          flex: activeWorkspaceResult ? 1 : 'none',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          borderBottom: '1px solid var(--border-color)',
          overflow: 'hidden',
          zIndex: 4,
          position: 'relative',
          width: '100%'
        }}
      >
        {/* Sandbox Preview / Document Sandbox */}
        <div 
          className="sandbox-preview" 
          style={{ 
            width: '100%',
            flex: activeWorkspaceResult ? 1 : 'none',
            height: activeWorkspaceResult ? 'auto' : '280px',
            backgroundColor: '#111111',
            borderBottom: activeWorkspaceResult ? 'none' : '1px solid var(--border-color)',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: activeWorkspaceResult ? 'hidden' : 'hidden',
            transition: 'all 0.4s ease'
          }}
        >
          {/* Bezel Overlay Element (Fade out when full screen) */}
          <div style={{
            position: 'absolute',
            top: '46%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            opacity: activeWorkspaceResult ? 0 : 1,
            transition: 'opacity 0.3s ease',
            zIndex: 5
          }}>
             {/* Main Bezel */}
             <div style={{
               width: '324px',
               height: '180px',
               border: '10px solid #18191a',
               borderBottom: '22px solid #151617',
               borderRadius: '10px',
               boxShadow: '0 15px 35px rgba(0,0,0,0.9), inset 0 0 0 1px #333, inset 0 0 15px rgba(0,0,0,0.8)',
               position: 'relative',
               background: 'transparent'
             }}>
                {/* Chin Light */}
                <div style={{ position: 'absolute', bottom: '-13px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: '#C8E653', boxShadow: '0 0 6px #C8E653', opacity: 0.8 }} />
                
                {/* Inner Bezel Shadow to give depth to screen */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)' }}></div>
                
                {/* Stand */}
                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: '35px', height: '25px', background: 'linear-gradient(to bottom, #111, #222)', boxShadow: 'inset 0 0 5px rgba(0,0,0,0.8)' }}>
                  {/* Base Plate */}
                  <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: '110px', height: '6px', background: '#2a2a2a', borderRadius: '4px 4px 0 0', boxShadow: '0 5px 15px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)' }}></div>
                </div>
             </div>
          </div>

          <div style={{
            width: activeWorkspaceResult ? '100%' : '810px',
            height: activeWorkspaceResult ? '100%' : '450px',
            transform: activeWorkspaceResult ? 'translate(0, 0) scale(1)' : 'translate(-50%, -50%) scale(0.40)',
            transformOrigin: activeWorkspaceResult ? 'top left' : 'center center',
            position: activeWorkspaceResult ? 'relative' : 'absolute',
            top: activeWorkspaceResult ? '0' : '46%',
            left: activeWorkspaceResult ? '0' : '50%',
            borderRadius: activeWorkspaceResult ? '0px' : '0px',
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.4s ease',
            zIndex: 10
          }}>
            {activeWorkspaceResult && (
              <div style={{ height: '50px', backgroundColor: '#020617', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
                </div>
                <div style={{ flex: 1, maxWidth: '600px', margin: '0 auto', backgroundColor: '#0f172a', height: '30px', borderRadius: '6px', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '13px', color: '#94a3b8', border: '1px solid #1e293b' }}>
                  <svg style={{ marginRight: '8px', color: '#64748b' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  {activeWorkspaceResult.artifact?.title || 'Document Preview'}
                </div>
                <button 
                  onClick={() => { useUI.getState().setActiveWorkspaceResult(null); useUI.getState().setIsGenerating(false); }}
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px', padding: '0 8px', display: 'flex', alignItems: 'center', height: '100%', fontWeight: 'bold' }}
                >
                  ✕
                </button>
              </div>
            )}
            
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#0f172a' }}>
              {/* Simulated content based on result */}
              {activeWorkspaceResult?.artifact ? (
                  activeWorkspaceResult.artifact.type === 'html' ? (
                  <iframe 
                      srcDoc={activeWorkspaceResult.artifact.content}
                      style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff', borderRadius: '0 0 4px 4px' }}
                      title="Beatrice Document Preview"
                  />
                  ) : activeWorkspaceResult.artifact.type === 'pdf' ? (
                  <iframe 
                      src={activeWorkspaceResult.artifact.content}
                      style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff', borderRadius: '0 0 4px 4px' }}
                      title="PDF Preview"
                  />
                  ) : activeWorkspaceResult.artifact.type === 'markdown' ? (
                    <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '32px', backgroundColor: '#fff', color: '#000', fontSize: '16px', boxSizing: 'border-box' }}>
                      <ReactMarkdown>{activeWorkspaceResult.artifact.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '32px', backgroundColor: '#000', color: '#fff', fontSize: '16px', boxSizing: 'border-box' }}>
                      <div style={{ fontWeight: 600, fontSize: '20px', marginBottom: '16px' }}>{activeWorkspaceResult.artifact.title || 'Document'}</div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{activeWorkspaceResult.artifact.content}</div>
                    </div>
                  )
              ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <VPSSimulation />
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Logs / Activity Panel */}
        {!activeWorkspaceResult && (
          <div 
            className="activity-logs"
            style={{
              padding: '12px 16px',
              backgroundColor: '#0a0a0a',
              height: '100px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              zIndex: 1
            }}
          >
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888888', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 600 }}>
              Recent Steps
            </div>
            {logs.map((log) => (
               <div key={log.id} style={{ fontSize: '13px', color: '#cccccc', display: 'flex', gap: '12px' }}>
                  <span style={{ color: '#666666', minWidth: '60px' }}>{log.time}</span>
                  <span>{log.message}</span>
               </div>
            ))}
            {/* Scroll anchor */}
            {logs.length > 0 && <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
