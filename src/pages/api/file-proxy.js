import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    // バケット名を置換
    const correctedUrl = url.replace(
      'jsbb-kurume.appspot.com', 
      'jsbb-kurume.firebasestorage.app'
    );
    
    const response = await axios.get(correctedUrl, {
      responseType: 'arraybuffer'
    });
    
    // レスポンスヘッダーを設定
    res.setHeader('Content-Type', response.headers['content-type']);
    
    // データを返す
    return res.status(200).send(response.data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch file' });
  }
}