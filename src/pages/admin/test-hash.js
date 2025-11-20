// admin/test-hash.js - ハッシュテスト用ページ
import { useState } from 'react';

export default function TestHash() {
  const [password, setPassword] = useState('open');
  const [hash, setHash] = useState('');

  const hashPassword = async (password) => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    throw new Error('Crypto API not available');
  };

  const handleHash = async () => {
    const hashedPassword = await hashPassword(password);
    setHash(hashedPassword);
    console.log('Password:', password);
    console.log('Hash:', hashedPassword);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>パスワードハッシュテスト</h1>

      <div style={{ marginBottom: '20px' }}>
        <label>
          パスワード:
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
        <button onClick={handleHash} style={{ marginLeft: '10px', padding: '5px 15px' }}>
          ハッシュ化
        </button>
      </div>

      {hash && (
        <div style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '5px' }}>
          <h3>生成されたハッシュ:</h3>
          <code style={{ wordBreak: 'break-all' }}>{hash}</code>

          <h3 style={{ marginTop: '20px' }}>Firestoreの保存値:</h3>
          <code style={{ wordBreak: 'break-all' }}>2348f998744212575d85959674f9607ab26f67708a917157472832386337c904</code>

          <h3 style={{ marginTop: '20px' }}>一致:</h3>
          <code style={{ color: hash === '2348f998744212575d85959674f9607ab26f67708a917157472832386337c904' ? 'green' : 'red' }}>
            {hash === '2348f998744212575d85959674f9607ab26f67708a917157472832386337c904' ? '✅ 一致' : '❌ 不一致'}
          </code>
        </div>
      )}
    </div>
  );
}
