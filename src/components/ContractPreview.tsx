'use client';

import React, { useRef, useEffect } from 'react';

interface ContractPreviewProps {
  html: string;
  className?: string;
}

/**
 * Componente para renderizar preview de contratos com formatação adequada
 * Usa iframe para isolar estilos e garantir formatação correta
 */
export default function ContractPreview({ html, className = '' }: ContractPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && html) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                * {
                  box-sizing: border-box;
                }
                body {
                  margin: 0;
                  padding: 32px;
                  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #1f2937 !important;
                  background-color: #ffffff !important;
                }
                body * {
                  color: #1f2937 !important;
                }
                h1, h2, h3, h4, h5, h6 {
                  display: block;
                  margin-top: 1em;
                  margin-bottom: 0.5em;
                  font-weight: bold;
                  color: #1f2937 !important;
                }
                p {
                  display: block;
                  margin-bottom: 1em;
                  margin-top: 0;
                  color: #1f2937 !important;
                }
                div {
                  display: block;
                  color: #1f2937 !important;
                }
                strong, b {
                  font-weight: bold;
                  color: #1f2937 !important;
                }
                span {
                  color: #1f2937 !important;
                }
                /* Preservar todos os estilos inline do HTML original, mas forçar texto preto */
              </style>
            </head>
            <body>
              ${html}
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [html]);

  return (
    <div 
      className={`border rounded-lg bg-white shadow-sm overflow-hidden ${className}`}
      style={{ backgroundColor: '#ffffff' }}
    >
      <iframe
        ref={iframeRef}
        className="w-full border-0"
        style={{
          minHeight: '400px',
          maxHeight: '800px',
          height: 'auto',
          display: 'block',
          backgroundColor: '#ffffff'
        }}
        title="Preview do contrato"
      />
    </div>
  );
}
