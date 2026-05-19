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
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="agent-task-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          borderBottom: '1px solid var(--border-color)',
          overflow: 'hidden',
          zIndex: 4,
          width: '100%'
        }}
      >
        {/* Sandbox Preview - Persistent Landscape Desktop View */}
        <div 
          className="sandbox-preview" 
          style={{ 
            width: '100%',
            height: '240px', // Fixed height for the landscape "window" on mobile
            backgroundColor: '#111111',
            borderBottom: '1px solid var(--border-color)',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
          }}
        >
          {/* Bezel Overlay Element */}
          <div style={{
            position: 'absolute',
            top: '46%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
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
                
                {/* Stand */}
                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: '35px', height: '25px', background: 'linear-gradient(to bottom, #111, #222)', boxShadow: 'inset 0 0 5px rgba(0,0,0,0.8)' }}>
                  <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: '110px', height: '6px', background: '#2a2a2a', borderRadius: '4px 4px 0 0', boxShadow: '0 5px 15px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)' }}></div>
                </div>
             </div>
          </div>

          <div style={{
            width: '810px',
            height: '450px',
            transform: 'translate(-50%, -50%) scale(0.40)',
            transformOrigin: 'center center',
            position: 'absolute',
            top: '46%',
            left: '50%',
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10
          }}>
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#0f172a' }}>
              {activeWorkspaceResult?.artifact ? (
                  activeWorkspaceResult.artifact.type === 'html' ? (
                  <iframe 
                      srcDoc={activeWorkspaceResult.artifact.content}
                      style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff' }}
                      title="Beatrice Document Preview"
                  />
                  ) : activeWorkspaceResult.artifact.type === 'pdf' ? (
                  <iframe 
                      src={activeWorkspaceResult.artifact.content}
                      style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff' }}
                      title="PDF Preview"
                  />
                  ) : activeWorkspaceResult.artifact.type === 'markdown' ? (
                    <div className="markdown-body" style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '32px', backgroundColor: '#fff', color: '#000', fontSize: '16px', boxSizing: 'border-box' }}>
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
            
            {/* Overlay if activeWorkspaceResult - small close button in sandbox corner */}
            {activeWorkspaceResult && (
              <button 
                onClick={() => { useUI.getState().setActiveWorkspaceResult(null); useUI.getState().setIsGenerating(false); }}
                style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', zIndex: 100 }}
              >✕</button>
            )}
          </div>
        </div>

        {/* Logs / Activity Panel - Always visible below sandbox while working */}
        <div 
          className="activity-logs"
          style={{
            padding: '12px 16px',
            backgroundColor: '#0a0a0a',
            maxHeight: '100px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 1,
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#C8E653', letterSpacing: '0.05em', marginBottom: '2px', fontWeight: 700 }}>
            {activeWorkspaceResult ? 'Final Output' : 'Live Agent Activity'}
          </div>
          {logs.slice(-3).map((log) => (
             <div key={log.id} style={{ fontSize: '12px', color: '#a1a1aa', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#C8E653' }}></div>
                <span>{log.message}</span>
             </div>
          ))}
          {/* Scroll anchor */}
          {logs.length > 0 && <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
