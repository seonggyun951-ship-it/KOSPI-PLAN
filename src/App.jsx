import React, { useState, useEffect } from 'react';

// 🔑 비밀번호 (원하는 숫자로 변경)
const MY_SECRET_PASSWORD = "0000";

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem('isUnlocked') === 'true');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [portfolio, setPortfolio] = useState(() => {
    const savedData = localStorage.getItem('myStockData');
    return savedData ? JSON.parse(savedData) : [];
  });
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    localStorage.setItem('myStockData', JSON.stringify(portfolio));
  }, [portfolio]);

  const handleLogin = (e) => {
    e.preventDefault(); 
    if (passwordInput === MY_SECRET_PASSWORD) {
      setIsUnlocked(true);
      setLoginError(false);
      localStorage.setItem('isUnlocked', 'true');
    } else {
      setLoginError(true);
      setPasswordInput(''); 
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    localStorage.removeItem('isUnlocked');
  };

  const totalAsset = portfolio.reduce((sum, stock) => sum + (stock.quantity * stock.currentPrice), 0);

  const addTestStock = () => {
    const newStock = { id: Date.now(), name: '삼성전자', quantity: 50, avgPrice: 70000, currentPrice: 80000 };
    setPortfolio([...portfolio, newStock]);
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-6 text-gray-800">나만의 주식 앱</h1>
          <form onSubmit={handleLogin}>
            <input 
              type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="비밀번호 0000" 
              className="w-full p-4 border rounded-lg mb-4 text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest"
            />
            {loginError && <p className="text-red-500 mb-4 font-bold">비밀번호가 틀렸습니다.</p>}
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition">입장하기</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <header className="bg-white p-6 rounded-xl shadow-md mb-8 flex flex-col md:flex-row justify-between items-center border-l-8 border-blue-600 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">내 주식 대시보드 📈</h1>
          <p className="text-gray-500 mt-1">총 자산: <span className="text-blue-600 font-bold text-xl">{totalAsset.toLocaleString()}원</span></p>
        </div>
        <div className="flex gap-2">
          <button onClick={addTestStock} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-100 transition">+ 테스트 추가</button>
          <button onClick={handleLock} className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-900 transition">🔒 잠그기</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">보유 종목 ({portfolio.length}개)</h2>
          {portfolio.length === 0 ? (
            <p className="text-gray-500 text-center py-10 border border-dashed rounded-lg">종목이 없습니다. 위 버튼을 눌러보세요!</p>
          ) : (
            <ul className="space-y-3">
              {portfolio.map((stock) => {
                const returnRate = (((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100).toFixed(2);
                const isProfit = returnRate > 0;
                return (
                  <li key={stock.id} onClick={() => setSelectedStock(stock)} className={`p-4 border rounded-lg cursor-pointer transition ${selectedStock?.id === stock.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'} flex justify-between items-center`}>
                    <div>
                      <h3 className="font-bold text-lg">{stock.name}</h3>
                      <p className="text-sm text-gray-500">{stock.quantity}주 | 평단 {stock.avgPrice.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{stock.currentPrice.toLocaleString()}원</p>
                      <p className={`text-sm font-bold ${isProfit ? 'text-red-500' : 'text-blue-500'}`}>{isProfit ? '▲' : '▼'} {Math.abs(returnRate)}%</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section className="bg-white p-6 rounded-xl shadow-md flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{selectedStock ? `${selectedStock.name} 관련 뉴스` : '관련 뉴스'}</h2>
          <div className="text-gray-400 text-center py-12 bg-gray-50 rounded-lg border border-dashed flex-grow flex items-center justify-center">
            {selectedStock ? "뉴스 크롤링 연동 대기 중..." : "왼쪽 리스트에서 종목을 클릭하세요."}
          </div>
        </section>
      </div>
    </div>
  );
}