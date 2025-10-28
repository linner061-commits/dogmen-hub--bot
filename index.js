import { useState, useEffect } from 'react';

export default function Home() {
  const [qrCode, setQrCode] = useState('');
  const [status, setStatus] = useState('Loading...');
  const [isConnected, setIsConnected] = useState(false);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp?action=status');
      const data = await response.json();
      setIsConnected(data.ready);
      setStatus(data.status);
    } catch (error) {
      setStatus('Error checking status');
    }
  };

  const getQRCode = async () => {
    try {
      const response = await fetch('/api/whatsapp?action=qr');
      const data = await response.json();
      if (data.success) {
        setQrCode(data.qrCode);
        setStatus(data.status);
      } else {
        setStatus(data.status);
      }
    } catch (error) {
      setStatus('Error getting QR code');
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '50px auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <h1>🤖 WhatsApp Bot</h1>
      
      <div style={{ 
        padding: '20px', 
        background: '#f5f5f5', 
        borderRadius: '10px',
        margin: '20px 0'
      }}>
        <h3>Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</h3>
        <p>{status}</p>
      </div>

      {!isConnected && (
        <div>
          <button 
            onClick={getQRCode}
            style={{
              background: '#25d366',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: '10px'
            }}
          >
            Get QR Code
          </button>
          
          {qrCode && (
            <div>
              <h3>Scan QR Code with WhatsApp:</h3>
              <img src={qrCode} alt="QR Code" style={{ maxWidth: '300px' }} />
              <p>WhatsApp → Settings → Linked Devices → Scan QR Code</p>
            </div>
          )}
        </div>
      )}

      {isConnected && (
        <div style={{ 
          padding: '20px', 
          background: '#dcf8c6', 
          borderRadius: '10px',
          margin: '20px 0'
        }}>
          <h3>✅ Bot is Running!</h3>
          <p>Send commands to your WhatsApp:</p>
          <div style={{ textAlign: 'left', background: 'white', padding: '15px', borderRadius: '5px' }}>
            <p><strong>🎬 .movie &lt;query&gt;</strong> - Search movies</p>
            <p><strong>📺 .yt &lt;query&gt;</strong> - Search YouTube</p>
            <p><strong>🔍 .gg &lt;query&gt;</strong> - Search Google</p>
            <p><strong>📱 .tt &lt;query&gt;</strong> - Search TikTok</p>
            <p><strong>🏓 .ping</strong> - Bot status</p>
            <p><strong>📖 .menu</strong> - Show all commands</p>
          </div>
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <p><strong>WhatsApp Channel:</strong></p>
        <a 
          href="https://whatsapp.com/channel/0029Vb71mgIElaglZCU0je0x" 
          target="_blank"
          style={{ color: '#25d366' }}
        >
          https://whatsapp.com/channel/0029Vb71mgIElaglZCU0je0x
        </a>
      </div>
    </div>
  );
}
