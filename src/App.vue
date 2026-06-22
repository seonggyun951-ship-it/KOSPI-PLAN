<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

const EDGE_FUNCTION_URL  = 'https://wqahhqssawaxynqigwtr.supabase.co/functions/v1/smooth-action'
const KIS_PRICE_URL     = 'https://wqahhqssawaxynqigwtr.supabase.co/functions/v1/kis-price'
const NEWS_FETCH_URL    = 'https://wqahhqssawaxynqigwtr.supabase.co/functions/v1/news-fetch'
const COLORS = ['#2563eb','#7c3aed','#0891b2','#059669','#d97706','#dc2626','#db2777','#65a30d','#9333ea','#0284c7','#c2410c','#0f766e']

const STOCK_DB = [
  // 코스피
  { name:'삼성전자',           ticker:'005930.KS' },
  { name:'SK하이닉스',         ticker:'000660.KS' },
  { name:'LG에너지솔루션',     ticker:'373220.KS' },
  { name:'삼성바이오로직스',   ticker:'207940.KS' },
  { name:'현대차',             ticker:'005380.KS' },
  { name:'기아',               ticker:'000270.KS' },
  { name:'POSCO홀딩스',        ticker:'005490.KS' },
  { name:'KB금융',             ticker:'105560.KS' },
  { name:'NAVER',              ticker:'035420.KS' },
  { name:'카카오',             ticker:'035720.KS' },
  { name:'신한지주',           ticker:'055550.KS' },
  { name:'하나금융지주',       ticker:'086790.KS' },
  { name:'우리금융지주',       ticker:'316140.KS' },
  { name:'삼성물산',           ticker:'028260.KS' },
  { name:'LG화학',             ticker:'051910.KS' },
  { name:'삼성SDI',            ticker:'006400.KS' },
  { name:'현대모비스',         ticker:'012330.KS' },
  { name:'SK텔레콤',           ticker:'017670.KS' },
  { name:'KT',                 ticker:'030200.KS' },
  { name:'LG전자',             ticker:'066570.KS' },
  { name:'한국전력',           ticker:'015760.KS' },
  { name:'삼성생명',           ticker:'032830.KS' },
  { name:'삼성화재',           ticker:'000810.KS' },
  { name:'KT&G',               ticker:'033780.KS' },
  { name:'SK이노베이션',       ticker:'096770.KS' },
  { name:'셀트리온',           ticker:'068270.KS' },
  { name:'SK',                 ticker:'034730.KS' },
  { name:'LG',                 ticker:'003550.KS' },
  { name:'한화에어로스페이스', ticker:'012450.KS' },
  { name:'HD현대중공업',       ticker:'329180.KS' },
  { name:'고려아연',           ticker:'010130.KS' },
  { name:'HMM',                ticker:'011200.KS' },
  { name:'두산에너빌리티',     ticker:'034020.KS' },
  { name:'카카오뱅크',         ticker:'323410.KS' },
  { name:'카카오페이',         ticker:'377300.KS' },
  { name:'크래프톤',           ticker:'259960.KS' },
  { name:'엔씨소프트',         ticker:'036570.KS' },
  { name:'넷마블',             ticker:'251270.KS' },
  { name:'LG디스플레이',       ticker:'034220.KS' },
  { name:'한미약품',           ticker:'128940.KS' },
  { name:'포스코퓨처엠',       ticker:'003670.KS' },
  { name:'CJ제일제당',         ticker:'097950.KS' },
  { name:'롯데케미칼',         ticker:'011170.KS' },
  { name:'현대건설',           ticker:'000720.KS' },
  { name:'GS건설',             ticker:'006360.KS' },
  { name:'삼성엔지니어링',     ticker:'028050.KS' },
  { name:'한국항공우주',       ticker:'047810.KS' },
  { name:'대한항공',           ticker:'003490.KS' },
  { name:'아시아나항공',       ticker:'020560.KS' },
  { name:'제주항공',           ticker:'089590.KS' },
  { name:'진에어',             ticker:'272450.KS' },
  { name:'한화오션',           ticker:'042660.KS' },
  { name:'삼성중공업',         ticker:'010140.KS' },
  { name:'HD현대미포',         ticker:'010620.KS' },
  { name:'현대제철',           ticker:'004020.KS' },
  { name:'POSCO인터내셔널',    ticker:'047050.KS' },
  { name:'기업은행',           ticker:'024110.KS' },
  { name:'미래에셋증권',       ticker:'006800.KS' },
  { name:'한국금융지주',       ticker:'071050.KS' },
  { name:'삼성증권',           ticker:'016360.KS' },
  { name:'NH투자증권',         ticker:'005940.KS' },
  { name:'키움증권',           ticker:'039490.KS' },
  { name:'메리츠금융지주',     ticker:'138040.KS' },
  { name:'DB손해보험',         ticker:'005830.KS' },
  { name:'현대해상',           ticker:'001450.KS' },
  { name:'아모레퍼시픽',       ticker:'090430.KS' },
  { name:'LG생활건강',         ticker:'051900.KS' },
  { name:'오리온',             ticker:'271560.KS' },
  { name:'농심',               ticker:'004370.KS' },
  { name:'하이트진로',         ticker:'000080.KS' },
  { name:'롯데쇼핑',           ticker:'023530.KS' },
  { name:'이마트',             ticker:'139480.KS' },
  { name:'BGF리테일',          ticker:'282330.KS' },
  { name:'GS리테일',           ticker:'007070.KS' },
  { name:'CJ대한통운',         ticker:'000120.KS' },
  { name:'현대글로비스',       ticker:'086280.KS' },
  { name:'한화솔루션',         ticker:'009830.KS' },
  { name:'OCI홀딩스',          ticker:'010060.KS' },
  { name:'LS일렉트릭',         ticker:'010120.KS' },
  { name:'효성중공업',         ticker:'298040.KS' },
  { name:'두산밥캣',           ticker:'241560.KS' },
  { name:'한화시스템',         ticker:'272210.KS' },
  { name:'유한양행',           ticker:'000100.KS' },
  { name:'녹십자',             ticker:'006280.KS' },
  { name:'대웅제약',           ticker:'069620.KS' },
  { name:'종근당',             ticker:'185750.KS' },
  { name:'SK바이오팜',         ticker:'326030.KS' },
  { name:'SK스퀘어',           ticker:'402340.KS' },
  { name:'S-Oil',              ticker:'010950.KS' },
  { name:'GS',                 ticker:'078930.KS' },
  { name:'HD현대',             ticker:'267250.KS' },
  { name:'하이브',             ticker:'352820.KS' },
  { name:'강원랜드',           ticker:'035250.KS' },
  { name:'한국타이어앤테크놀로지', ticker:'161390.KS' },
  { name:'금호석유',           ticker:'011780.KS' },
  { name:'현대오토에버',       ticker:'307950.KS' },
  { name:'롯데웰푸드',         ticker:'280360.KS' },
  // 코스닥
  { name:'에코프로비엠',       ticker:'247540.KQ' },
  { name:'에코프로',           ticker:'086520.KQ' },
  { name:'알테오젠',           ticker:'196170.KQ' },
  { name:'HLB',                ticker:'028300.KQ' },
  { name:'리가켐바이오',       ticker:'141080.KQ' },
  { name:'카카오게임즈',       ticker:'293490.KQ' },
  { name:'펄어비스',           ticker:'263750.KQ' },
  { name:'에스엠',             ticker:'041510.KQ' },
  { name:'JYP Ent.',           ticker:'035900.KQ' },
  { name:'YG엔터테인먼트',     ticker:'122870.KQ' },
  { name:'위메이드',           ticker:'112040.KQ' },
  { name:'컴투스',             ticker:'078340.KQ' },
  { name:'셀트리온제약',       ticker:'068760.KQ' },
  { name:'파마리서치',         ticker:'214450.KQ' },
  { name:'레인보우로보틱스',   ticker:'277810.KQ' },
  { name:'HPSP',               ticker:'403870.KQ' },
  { name:'리노공업',           ticker:'058470.KQ' },
  { name:'원익IPS',            ticker:'240810.KQ' },
  // 미국
  { name:'Apple',              ticker:'AAPL' },
  { name:'Tesla',              ticker:'TSLA' },
  { name:'NVIDIA',             ticker:'NVDA' },
  { name:'Microsoft',          ticker:'MSFT' },
  { name:'Amazon',             ticker:'AMZN' },
  { name:'Google',             ticker:'GOOGL' },
  { name:'Meta',               ticker:'META' },
  { name:'Netflix',            ticker:'NFLX' },
  { name:'AMD',                ticker:'AMD' },
  { name:'Palantir',           ticker:'PLTR' },
  { name:'Broadcom',           ticker:'AVGO' },
  { name:'TSMC',               ticker:'TSM' },
  { name:'Arm Holdings',       ticker:'ARM' },
  { name:'Coinbase',           ticker:'COIN' },
]

// ── 인증
const isAuthorized = ref(false)
const inputEmail    = ref('')
const inputPassword = ref('')
const loginError    = ref('')

// ── 데이터
const stocks     = ref([])
const savedNews  = ref([])

// ── UI 상태
const tab        = ref('dashboard')
const loading    = ref(true)
const saveStatus = ref(null)
const showAdd    = ref(false)
const editStock  = ref(null)
const refreshing = ref(false)
const sideOpen   = ref(false)
const isMobile   = ref(window.innerWidth <= 768)

// ── 뉴스
const newsMap         = ref({})   // { 종목명: { date:[...], sim:[...] } }
const newsLoading     = ref({})
const newsPage        = ref({})   // { 종목명: 현재페이지(0-based) }
const newsSort        = ref('date') // 'date' | 'sim'
const selectedStock   = ref(null)
const NEWS_PER_PAGE   = 15
const bookmarkedIds   = ref(new Set())

// ── 폼
const newStock = ref({ name:'', ticker:'', quantity:'', avg_price:'', memo:'', type:'long' })

// ── 모의투자
const simBalance  = ref(0)
const simHoldings = ref([])
const simTrades   = ref([])

// ── 헬스
const workouts      = ref([])
const weightLogs    = ref([])
const showAddWorkout = ref(false)
const showAddWeight  = ref(false)
const newWorkout = ref({ date: new Date().toISOString().slice(0,10), exercise:'', muscle_group:'가슴', sets:3, reps:10, weight:0, memo:'' })
const newWeight  = ref({ date: new Date().toISOString().slice(0,10), weight:'' })
const MUSCLE_GROUPS = ['가슴','등','어깨','팔','하체','복근','전신']
const showSimBuy  = ref(false)
const simSellTarget = ref(null)
const simBuyForm  = ref({ name:'', ticker:'', quantity:'', price:'' })
const simSellForm = ref({ quantity:'', price:'' })
const simSearchResults = ref([])

// ── 종목 검색 자동완성
const searchResults = ref([])
const searchLoading = ref(false)
let searchTimer = null

const searchStock = (query) => {
  if (!query || query.trim().length < 1) { searchResults.value = []; return }
  const q = query.trim().toLowerCase()
  searchResults.value = STOCK_DB.filter(s =>
    s.name.toLowerCase().includes(q) || s.ticker.toLowerCase().includes(q)
  ).slice(0, 6)
}

const selectSearchResult = (result, stock) => {
  stock.name   = result.name
  stock.ticker = result.ticker
  searchResults.value = []
}

const clearSearch = () => { setTimeout(() => { searchResults.value = [] }, 200) }

let toastTimer = null
const setToast = (s) => {
  saveStatus.value = s
  if (toastTimer) clearTimeout(toastTimer)
  if (s === 'saved' || s === 'error') toastTimer = setTimeout(() => { saveStatus.value = null }, 3000)
}

// ── 로그인
const login = async () => {
  loginError.value = ''
  const { error } = await supabase.auth.signInWithPassword({
    email: inputEmail.value.trim(),
    password: inputPassword.value
  })
  if (error) { loginError.value = '이메일 또는 비밀번호가 틀렸습니다.'; return }
  isAuthorized.value = true
  await fetchAll()
}

const logout = async () => {
  await supabase.auth.signOut()
  isAuthorized.value = false
  inputEmail.value = ''
  inputPassword.value = ''
}

// ── 데이터 불러오기
const fetchAll = async () => {
  loading.value = true
  try {
    const [stockRes, newsRes, balRes, holdRes, tradeRes, workoutRes, weightRes] = await Promise.all([
      supabase.from('stock_items').select('*').order('created_at'),
      supabase.from('saved_news').select('*').order('created_at', { ascending: false }),
      supabase.from('sim_balance').select('*').eq('id', 1).maybeSingle(),
      supabase.from('sim_holdings').select('*').order('created_at'),
      supabase.from('sim_trades').select('*').order('traded_at', { ascending: false }),
      supabase.from('workouts').select('*').order('date', { ascending: false }),
      supabase.from('weight_logs').select('*').order('date')
    ])
    if (stockRes.data) stocks.value = stockRes.data
    if (newsRes.data)  {
      savedNews.value = newsRes.data
      bookmarkedIds.value = new Set(newsRes.data.map(n => n.url))
    }
    simBalance.value  = balRes.data?.cash ?? 10000000
    if (holdRes.data)  simHoldings.value = holdRes.data
    if (tradeRes.data) simTrades.value   = tradeRes.data
    if (workoutRes.data) workouts.value  = workoutRes.data
    if (weightRes.data)  weightLogs.value = weightRes.data
  } catch (e) { console.error(e) }
  loading.value = false
  autoRefreshPrices()
}

const autoRefreshPrices = async () => {
  const targets = stocks.value.filter(s => s.ticker)
  if (!targets.length) return
  const tickers = targets.map(s => s.ticker)
  const prices  = await fetchPrices(tickers)
  for (const stock of targets) {
    const price = prices[stock.ticker]
    if (price) await updateCurrentPrice(stock, price)
  }
}

// ── 현재가 (KIS API via Edge Function)
const fetchPrices = async (tickers) => {
  try {
    const res  = await fetch(KIS_PRICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_KEY}`
      },
      body: JSON.stringify({ tickers })
    })
    const data = await res.json()
    return data?.ok ? data.prices : {}
  } catch { return {} }
}

const refreshAllPrices = async () => {
  const targets = stocks.value.filter(s => s.ticker)
  if (!targets.length) { alert('티커가 등록된 종목이 없어요.\n종목 수정에서 티커(예: 005930.KS)를 입력해주세요.'); return }
  refreshing.value = true
  const tickers = targets.map(s => s.ticker)
  const prices  = await fetchPrices(tickers)
  let updated = 0
  for (const stock of targets) {
    const price = prices[stock.ticker]
    if (price) { await updateCurrentPrice(stock, price); updated++ }
  }
  refreshing.value = false
  alert(`${updated}/${targets.length}개 업데이트 완료!`)
}

// ── 뉴스
const fetchNews = async (stockName, sort = newsSort.value) => {
  if (newsMap.value[stockName]?.[sort]) return
  newsLoading.value[stockName] = true
  try {
    const q   = `${stockName} 주식`
    const res = await fetch(NEWS_FETCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_KEY}` },
      body: JSON.stringify({ q, sort })
    })
    if (!newsMap.value[stockName]) newsMap.value[stockName] = {}
    newsMap.value[stockName][sort] = await res.json()
  } catch {
    if (!newsMap.value[stockName]) newsMap.value[stockName] = {}
    newsMap.value[stockName][sort] = []
  }
  newsLoading.value[stockName] = false
}

const selectStock = async (name) => {
  selectedStock.value = selectedStock.value === name ? null : name
  if (selectedStock.value) {
    newsPage.value[name] = 0
    await fetchNews(name)
  }
}
const setNewsSort = async (sort) => {
  newsSort.value = sort
  const name = selectedStock.value
  if (name) {
    newsPage.value[name] = 0
    await fetchNews(name, sort)
  }
}
const currentNewsArticles = computed(() => {
  const name = selectedStock.value
  if (!name) return []
  return newsMap.value[name]?.[newsSort.value] ?? []
})
const newsPagedArticles = computed(() => {
  const page = newsPage.value[selectedStock.value] ?? 0
  return currentNewsArticles.value.slice(page * NEWS_PER_PAGE, (page + 1) * NEWS_PER_PAGE)
})
const newsTotalPages = computed(() => {
  return Math.ceil(currentNewsArticles.value.length / NEWS_PER_PAGE) || 1
})

const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1)  return `${Math.floor(diff/60000)}분 전`
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h/24)}일 전`
}

// ── 스크랩 저장/삭제
const toggleBookmark = async (article, stockName) => {
  if (bookmarkedIds.value.has(article.url)) {
    const target = savedNews.value.find(n => n.url === article.url)
    if (!target) return
    const { error } = await supabase.from('saved_news').delete().eq('id', target.id)
    if (!error) {
      savedNews.value = savedNews.value.filter(n => n.url !== article.url)
      bookmarkedIds.value.delete(article.url)
    }
  } else {
    const payload = { title: article.title, url: article.url, stock_name: stockName, pub_date: article.pubDate, source: article.source }
    const { data, error } = await supabase.from('saved_news').insert(payload).select().single()
    if (!error && data) {
      savedNews.value.unshift(data)
      bookmarkedIds.value.add(article.url)
    }
  }
}

const deleteScrap = async (id, url) => {
  const { error } = await supabase.from('saved_news').delete().eq('id', id)
  if (!error) {
    savedNews.value = savedNews.value.filter(n => n.id !== id)
    bookmarkedIds.value.delete(url)
  }
}

// ── CRUD
const addStock = async () => {
  if (!newStock.value.name.trim()) return
  setToast('saving')
  const payload = {
    name:          newStock.value.name?.trim() ?? '',
    ticker:        newStock.value.ticker?.trim() ?? '',
    quantity:      Number(newStock.value.quantity)      || 0,
    avg_price:     Number(newStock.value.avg_price) || 0,
    current_price: 0,
    memo:          newStock.value.memo,
    type:          newStock.value.type
  }
  const { data, error } = await supabase.from('stock_items').insert(payload).select().single()
  if (!error && data) {
    stocks.value.push(data)
    newStock.value = { name:'', ticker:'', quantity:'', avg_price:'', memo:'', type:'long' }
    showAdd.value = false
    setToast('saved')
    if (data.ticker) {
      const prices = await fetchPrices([data.ticker])
      if (prices[data.ticker]) await updateCurrentPrice(data, prices[data.ticker])
    }
  } else { setToast('error'); alert('추가 실패: ' + error.message) }
}

const saveEdit = async () => {
  setToast('saving')
  const { id, created_at, ...fields } = editStock.value
  const payload = { ...fields, name: fields.name?.trim() ?? '', ticker: fields.ticker?.trim() ?? '', quantity: Number(fields.quantity)||0, avg_price: Number(fields.avg_price)||0, current_price: Number(fields.current_price)||0 }
  const { error } = await supabase.from('stock_items').update(payload).eq('id', id)
  if (!error) {
    const idx = stocks.value.findIndex(s => s.id === id)
    if (idx >= 0) stocks.value[idx] = { id, created_at, ...payload }
    setToast('saved'); editStock.value = null
  } else { setToast('error'); alert('수정 실패: ' + error.message) }
}

const deleteStock = async (id) => {
  if (!confirm('삭제할까요?')) return
  setToast('saving')
  const { error } = await supabase.from('stock_items').delete().eq('id', id)
  if (!error) { stocks.value = stocks.value.filter(s => s.id !== id); setToast('saved') }
  else { setToast('error'); alert('삭제 실패: ' + error.message) }
}

const updateCurrentPrice = async (stock, price) => {
  const { error } = await supabase.from('stock_items').update({ current_price: price }).eq('id', stock.id)
  if (!error) stock.current_price = price
}

const quickUpdatePrice = async (stock, val) => {
  const price = Number(val); if (!price || price < 0) return
  await updateCurrentPrice(stock, price)
}

// ── 실시간
const onResize = () => { isMobile.value = window.innerWidth <= 768 }

let channel
onMounted(async () => {
  window.addEventListener('resize', onResize)
  const { data: { session } } = await supabase.auth.getSession()
  if (session) { isAuthorized.value = true; await fetchAll() }
  channel = supabase.channel('stock-realtime')
    .on('postgres_changes', { event:'*', schema:'public', table:'stock_items' }, (p) => {
      if (p.eventType==='INSERT') { if (!stocks.value.find(s=>s.id===p.new.id)) stocks.value.push(p.new) }
      else if (p.eventType==='UPDATE') { const i=stocks.value.findIndex(s=>s.id===p.new.id); if(i>=0) stocks.value[i]=p.new }
      else if (p.eventType==='DELETE') stocks.value=stocks.value.filter(s=>s.id!==p.old.id)
    }).subscribe()
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (channel) supabase.removeChannel(channel)
  if (toastTimer) clearTimeout(toastTimer)
})

// ── 계산
const longStocks  = computed(() => stocks.value.filter(s => s.type === 'long'))
const shortStocks = computed(() => stocks.value.filter(s => s.type === 'short'))

const calcGroup = (list) => {
  const invest = list.reduce((s,st) => s + st.quantity * st.avg_price,     0)
  const value  = list.reduce((s,st) => s + st.quantity * st.current_price, 0)
  const pnl    = value - invest
  const rate   = invest ? pnl / invest * 100 : 0
  return { invest, value, pnl, rate }
}

const total = computed(() => calcGroup(stocks.value))
const long  = computed(() => calcGroup(longStocks.value))
const short = computed(() => calcGroup(shortStocks.value))

const stockPnl   = s => s.quantity * (s.current_price - s.avg_price)
const stockRate  = s => s.avg_price ? (s.current_price - s.avg_price) / s.avg_price * 100 : 0
const stockValue = s => s.quantity * s.current_price

// 파이차트
const pieData = computed(() => {
  const t = total.value.value; if (!t) return []
  let angle = 0
  return stocks.value.map((s, i) => {
    const val = stockValue(s); if (!val) return null
    const sweep = val / t * 360
    const seg = { name: s.name, val, d: arc(100,100,80,angle,angle+sweep), color: COLORS[i % COLORS.length] }
    angle += sweep; return seg
  }).filter(Boolean)
})

const typePieData = computed(() => {
  const t = total.value.value; if (!t) return []
  let angle = 0
  const groups = [
    { name:'장기투자', val: long.value.value,  color:'#2563eb' },
    { name:'단기투자', val: short.value.value, color:'#7c3aed' }
  ].filter(g => g.val > 0)
  return groups.map(g => {
    const sweep = g.val / t * 360
    const seg = { ...g, d: arc(100,100,80,angle,angle+sweep) }
    angle += sweep; return seg
  })
})

function arc(cx,cy,r,sa,ea) {
  if(ea-sa>=360) ea=sa+359.99
  const rad=a=>(a-90)*Math.PI/180
  const x1=cx+r*Math.cos(rad(sa)),y1=cy+r*Math.sin(rad(sa))
  const x2=cx+r*Math.cos(rad(ea)),y2=cy+r*Math.sin(rad(ea))
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${ea-sa>180?1:0} 1 ${x2},${y2} Z`
}

const fmt     = n => Number(n||0).toLocaleString()
const fmtInput  = v => (v !== '' && v != null) ? Number(String(v).replace(/[^0-9]/g,'')||0).toLocaleString('ko-KR') : ''
const parseInput = v => Number(String(v).replace(/[^0-9]/g,'')) || 0
const fmtRate = r => (r >= 0 ? '+' : '') + Number(r).toFixed(2) + '%'
const isProfit= r => r >= 0

// ── 모의투자 계산
const simCurrentPrice = (h) => {
  const s = stocks.value.find(s => s.name === h.name || s.ticker === h.ticker)
  return s?.current_price || h.avg_price
}
const simHoldingPnl  = (h) => (simCurrentPrice(h) - h.avg_price) * h.quantity
const simHoldingRate = (h) => h.avg_price ? (simCurrentPrice(h) - h.avg_price) / h.avg_price * 100 : 0
const simHoldingValue = computed(() => simHoldings.value.reduce((s, h) => s + h.quantity * simCurrentPrice(h), 0))
const simCostBasis    = computed(() => simHoldings.value.reduce((s, h) => s + h.quantity * h.avg_price, 0))
const simTotalPnl     = computed(() => simHoldingValue.value - simCostBasis.value)
const simTotalRate    = computed(() => simCostBasis.value ? simTotalPnl.value / simCostBasis.value * 100 : 0)
const simTotalAsset   = computed(() => simBalance.value + simHoldingValue.value)

const simSearchStock = (q) => {
  if (!q || q.trim().length < 1) { simSearchResults.value = []; return }
  const query = q.trim().toLowerCase()
  simSearchResults.value = STOCK_DB.filter(s => s.name.toLowerCase().includes(query) || s.ticker.toLowerCase().includes(query)).slice(0, 6)
}

const clearSimSearch = () => { setTimeout(() => { simSearchResults.value = [] }, 200) }

const simSelectStock = async (r) => {
  simBuyForm.value.name   = r.name
  simBuyForm.value.ticker = r.ticker
  simSearchResults.value  = []
  if (r.ticker) {
    const prices = await fetchPrices([r.ticker])
    if (prices[r.ticker]) simBuyForm.value.price = prices[r.ticker]
  }
}

const simBuy = async () => {
  const qty   = Number(simBuyForm.value.quantity)
  const price = Number(simBuyForm.value.price)
  if (!simBuyForm.value.name || !qty || !price) return alert('종목명, 수량, 가격을 입력해주세요')
  const total = qty * price
  if (total > simBalance.value) return alert(`잔고 부족! (필요: ${fmt(total)}원, 보유: ${fmt(simBalance.value)}원)`)

  const existing = simHoldings.value.find(h => h.name === simBuyForm.value.name)
  if (existing) {
    const newQty  = existing.quantity + qty
    const newAvg  = Math.round((existing.quantity * existing.avg_price + qty * price) / newQty)
    await supabase.from('sim_holdings').update({ quantity: newQty, avg_price: newAvg }).eq('id', existing.id)
    existing.quantity = newQty; existing.avg_price = newAvg
  } else {
    const { data } = await supabase.from('sim_holdings').insert({ name: simBuyForm.value.name, ticker: simBuyForm.value.ticker, quantity: qty, avg_price: price }).select().single()
    if (data) simHoldings.value.push(data)
  }
  const newCash = simBalance.value - total
  await supabase.from('sim_balance').update({ cash: newCash }).eq('id', 1)
  simBalance.value = newCash
  const { data: t } = await supabase.from('sim_trades').insert({ name: simBuyForm.value.name, ticker: simBuyForm.value.ticker, type:'buy', quantity: qty, price, total }).select().single()
  if (t) simTrades.value.unshift(t)
  simBuyForm.value = { name:'', ticker:'', quantity:'', price:'' }
  showSimBuy.value = false
}

const openSimSell = (h) => {
  simSellTarget.value = h
  const stock = stocks.value.find(s => s.name === h.name || s.ticker === h.ticker)
  simSellForm.value = { quantity: '', price: stock?.current_price || h.avg_price || '' }
}

const simSell = async () => {
  const h     = simSellTarget.value
  const qty   = Number(simSellForm.value.quantity)
  const price = Number(simSellForm.value.price)
  if (!qty || !price) return alert('수량과 가격을 입력해주세요')
  if (qty > h.quantity) return alert(`보유 수량 초과! (보유: ${h.quantity}주)`)
  const total = qty * price

  if (qty === h.quantity) {
    await supabase.from('sim_holdings').delete().eq('id', h.id)
    simHoldings.value = simHoldings.value.filter(x => x.id !== h.id)
  } else {
    await supabase.from('sim_holdings').update({ quantity: h.quantity - qty }).eq('id', h.id)
    h.quantity -= qty
  }
  const newCash = simBalance.value + total
  await supabase.from('sim_balance').update({ cash: newCash }).eq('id', 1)
  simBalance.value = newCash
  const { data: t } = await supabase.from('sim_trades').insert({ name: h.name, ticker: h.ticker, type:'sell', quantity: qty, price, total }).select().single()
  if (t) simTrades.value.unshift(t)
  simSellTarget.value = null
  simSellForm.value = { quantity:'', price:'' }
}

const simReset = async () => {
  if (!confirm('모의투자를 초기화할까요? (잔고 1000만원으로 리셋)')) return
  await Promise.all([
    supabase.from('sim_balance').update({ cash: 10000000 }).eq('id', 1),
    supabase.from('sim_holdings').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    supabase.from('sim_trades').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  ])
  simBalance.value = 10000000; simHoldings.value = []; simTrades.value = []
}

// ── 헬스 CRUD
const addWorkout = async () => {
  if (!newWorkout.value.exercise.trim()) return
  const { data, error } = await supabase.from('workouts').insert({ ...newWorkout.value }).select().single()
  if (!error && data) {
    workouts.value.unshift(data)
    newWorkout.value = { date: new Date().toISOString().slice(0,10), exercise:'', muscle_group:'가슴', sets:3, reps:10, weight:0, memo:'' }
    showAddWorkout.value = false
  }
}
const deleteWorkout = async (id) => {
  const { error } = await supabase.from('workouts').delete().eq('id', id)
  if (!error) workouts.value = workouts.value.filter(w => w.id !== id)
}
const addWeight = async () => {
  if (!newWeight.value.weight) return
  const { data, error } = await supabase.from('weight_logs').insert({ ...newWeight.value }).select().single()
  if (!error && data) {
    weightLogs.value.push(data)
    weightLogs.value.sort((a,b) => a.date.localeCompare(b.date))
    newWeight.value = { date: new Date().toISOString().slice(0,10), weight:'' }
    showAddWeight.value = false
  }
}
const deleteWeight = async (id) => {
  const { error } = await supabase.from('weight_logs').delete().eq('id', id)
  if (!error) weightLogs.value = weightLogs.value.filter(w => w.id !== id)
}

// ── 헬스 분석
const muscleBalance = computed(() => {
  const map = {}
  MUSCLE_GROUPS.forEach(g => map[g] = 0)
  workouts.value.forEach(w => { if (map[w.muscle_group] !== undefined) map[w.muscle_group]++ })
  return map
})
const recentWeights = computed(() => weightLogs.value.slice(-12))
const weightPlateau = computed(() => {
  if (weightLogs.value.length < 4) return false
  const last4 = weightLogs.value.slice(-4).map(w => w.weight)
  const diff = Math.max(...last4) - Math.min(...last4)
  return diff < 0.5
})
const strengthByExercise = computed(() => {
  const map = {}
  ;[...workouts.value].reverse().forEach(w => {
    if (!map[w.exercise]) map[w.exercise] = []
    map[w.exercise].push({ date: w.date, weight: w.weight })
  })
  return map
})

// 스크랩 종목별 그룹
const scrapByStock = computed(() => {
  const map = {}
  savedNews.value.forEach(n => {
    const key = n.stock_name || '기타'
    if (!map[key]) map[key] = []
    map[key].push(n)
  })
  return map
})
</script>

<template>
  <div class="root">
    <!-- 로그인 -->
    <div v-if="!isAuthorized" class="login-screen">
      <div class="login-box">
        <div class="login-icon">📈</div>
        <h2>나만의 주식 포트폴리오</h2>
        <input v-model="inputEmail" type="email" placeholder="이메일" @keyup.enter="login" class="pw-input" style="margin-bottom:10px" />
        <input v-model="inputPassword" type="password" placeholder="비밀번호" @keyup.enter="login" class="pw-input" />
        <div v-if="loginError" style="color:#ef4444;font-size:13px;margin-top:8px">{{ loginError }}</div>
        <button @click="login" class="btn-primary" style="margin-top:16px">입장하기</button>
      </div>
    </div>

    <template v-else>
      <div v-if="loading" class="loading-screen">
        <div class="spinner"></div><p>불러오는 중...</p>
      </div>

      <div v-else class="layout">
        <div v-if="sideOpen" class="side-overlay" @click="sideOpen=false"></div>

        <!-- 사이드바 -->
        <aside class="sidebar" :class="{ open: sideOpen }">
          <div class="sidebar-logo">
            <span>📈</span>
            <span class="logo-text">KOSPI PLAN</span>
          </div>
          <nav class="sidebar-nav">
            <button v-for="item in [
              { key:'dashboard', icon:'🏠', label:'대시보드'  },
              { key:'long',      icon:'📈', label:'장기투자'  },
              { key:'short',     icon:'⚡', label:'단기투자'  },
              { key:'chart',     icon:'📊', label:'차트'      },
              { key:'news',      icon:'📰', label:'뉴스'      },
              { key:'scrap',     icon:'🔖', label:'스크랩', badge: savedNews.length || null },
              { key:'sim',       icon:'🎮', label:'모의투자' },
              { key:'health',    icon:'💪', label:'헬스'      },
            ]" :key="item.key"
              class="nav-item" :class="{ active: tab===item.key }"
              @click="tab=item.key; sideOpen=false">
              <span class="nav-icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
              <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
            </button>
          </nav>
          <div class="sidebar-summary">
            <div class="ss-label">총 평가금액</div>
            <div class="ss-value">{{ fmt(Math.round(total.value)) }}원</div>
            <div class="ss-rate" :class="isProfit(total.rate) ? 'profit' : 'loss'">{{ fmtRate(total.rate) }}</div>
            <button @click="logout" class="btn-logout">로그아웃</button>
          </div>
        </aside>

        <!-- 메인 -->
        <div class="main">
          <header class="top-bar">
            <button class="hamburger" @click="sideOpen=!sideOpen">☰</button>
            <h1 class="page-title">
              {{ {dashboard:'대시보드',long:'장기투자',short:'단기투자',chart:'차트',news:'뉴스',scrap:'스크랩',sim:'모의투자',health:'헬스'}[tab] }}
            </h1>
            <div class="top-actions">
              <button class="btn-refresh" @click="refreshAllPrices" :disabled="refreshing">
                {{ refreshing ? '조회 중...' : '🔄 현재가 업데이트' }}
              </button>
              <button class="btn-add-top" @click="showAdd=true">+ 종목 추가</button>
            </div>
          </header>

          <div class="toast" :class="{ visible: saveStatus }">
            <span v-if="saveStatus==='saving'">💾 저장 중...</span>
            <span v-else-if="saveStatus==='saved'">✅ 저장됨</span>
            <span v-else-if="saveStatus==='error'">❌ 저장 실패</span>
          </div>

          <div class="content">

            <!-- ── 대시보드 ── -->
            <template v-if="tab==='dashboard'">
              <div class="summary-grid">
                <div class="summary-card total">
                  <div class="sc-label">전체 포트폴리오</div>
                  <div class="sc-value">{{ fmt(Math.round(total.value)) }}원</div>
                  <div class="sc-sub">
                    <span>투자금 {{ fmt(Math.round(total.invest)) }}원</span>
                    <span class="sc-rate" :class="isProfit(total.rate)?'profit':'loss'">{{ fmtRate(total.rate) }}</span>
                  </div>
                  <div class="sc-pnl" :class="isProfit(total.pnl)?'profit':'loss'">
                    {{ isProfit(total.pnl)?'+':'' }}{{ fmt(Math.round(total.pnl)) }}원
                  </div>
                </div>
                <div class="summary-card long-card" @click="tab='long'" style="cursor:pointer">
                  <div class="sc-label">📈 장기투자 ({{ longStocks.length }}개)</div>
                  <div class="sc-value sm">{{ fmt(Math.round(long.value)) }}원</div>
                  <div class="sc-sub">
                    <span>투자금 {{ fmt(Math.round(long.invest)) }}원</span>
                    <span class="sc-rate" :class="isProfit(long.rate)?'profit':'loss'">{{ fmtRate(long.rate) }}</span>
                  </div>
                  <div class="sc-pnl" :class="isProfit(long.pnl)?'profit':'loss'">{{ isProfit(long.pnl)?'+':'' }}{{ fmt(Math.round(long.pnl)) }}원</div>
                </div>
                <div class="summary-card short-card" @click="tab='short'" style="cursor:pointer">
                  <div class="sc-label">⚡ 단기투자 ({{ shortStocks.length }}개)</div>
                  <div class="sc-value sm">{{ fmt(Math.round(short.value)) }}원</div>
                  <div class="sc-sub">
                    <span>투자금 {{ fmt(Math.round(short.invest)) }}원</span>
                    <span class="sc-rate" :class="isProfit(short.rate)?'profit':'loss'">{{ fmtRate(short.rate) }}</span>
                  </div>
                  <div class="sc-pnl" :class="isProfit(short.pnl)?'profit':'loss'">{{ isProfit(short.pnl)?'+':'' }}{{ fmt(Math.round(short.pnl)) }}원</div>
                </div>
              </div>

              <div class="card mt16">
                <div class="card-title">전체 종목 ({{ stocks.length }}개)</div>
                <!-- PC 테이블 -->
                <div v-if="!isMobile" class="table-wrap">
                  <table class="stock-table">
                    <thead>
                      <tr><th>종목명</th><th>구분</th><th>수량</th><th>평균단가</th><th>현재가</th><th>평가금액</th><th>손익</th><th>수익률</th><th></th></tr>
                    </thead>
                    <tbody>
                      <tr v-for="(s,i) in stocks" :key="s.id">
                        <td><div class="td-name"><span class="color-dot" :style="{ background: COLORS[i%COLORS.length] }"></span><div><div class="name-text">{{ s.name }}</div><div v-if="s.ticker" class="ticker-text">{{ s.ticker }}</div></div></div></td>
                        <td><span class="type-badge" :class="s.type">{{ s.type==='long'?'장기':'단기' }}</span></td>
                        <td>{{ fmt(s.quantity) }}주</td>
                        <td>{{ fmt(s.avg_price) }}원</td>
                        <td>{{ fmt(s.current_price) }}원</td>
                        <td>{{ fmt(Math.round(stockValue(s))) }}원</td>
                        <td :class="isProfit(stockPnl(s))?'profit':'loss'">{{ isProfit(stockPnl(s))?'+':'' }}{{ fmt(Math.round(stockPnl(s))) }}원</td>
                        <td :class="isProfit(stockRate(s))?'profit':'loss'">{{ fmtRate(stockRate(s)) }}</td>
                        <td><div class="td-actions"><button @click="editStock={...s}" class="btn-sm">수정</button><button @click="deleteStock(s.id)" class="btn-sm del">삭제</button></div></td>
                      </tr>
                      <tr v-if="stocks.length===0"><td colspan="9" class="empty-td">종목을 추가해보세요</td></tr>
                    </tbody>
                  </table>
                </div>
                <!-- 모바일 카드 -->
                <div v-else class="ms-list">
                  <div v-for="(s,i) in stocks" :key="s.id" class="ms-card">
                    <div class="ms-top">
                      <div class="td-name"><span class="color-dot" :style="{background:COLORS[i%COLORS.length]}"></span><div><div class="name-text">{{ s.name }}</div><div v-if="s.ticker" class="ticker-text">{{ s.ticker }}</div></div></div>
                      <span class="type-badge" :class="s.type">{{ s.type==='long'?'장기':'단기' }}</span>
                    </div>
                    <div class="ms-row"><span class="ms-lbl">평단</span><span>{{ fmt(s.avg_price) }}원</span><span class="ms-lbl">수량</span><span>{{ fmt(s.quantity) }}주</span></div>
                    <div class="ms-row"><span class="ms-lbl">현재가</span><span>{{ fmt(s.current_price) }}원</span><span class="ms-lbl">평가</span><span>{{ fmt(Math.round(stockValue(s))) }}원</span></div>
                    <div class="ms-row"><span class="ms-lbl">손익</span><span :class="isProfit(stockPnl(s))?'profit':'loss'">{{ isProfit(stockPnl(s))?'+':'' }}{{ fmt(Math.round(stockPnl(s))) }}원</span><span class="ms-lbl">수익률</span><span :class="isProfit(stockRate(s))?'profit':'loss'">{{ fmtRate(stockRate(s)) }}</span></div>
                    <div class="ms-actions"><button @click="editStock={...s}" class="btn-sm">수정</button><button @click="deleteStock(s.id)" class="btn-sm del">삭제</button></div>
                  </div>
                  <div v-if="stocks.length===0" class="empty-td">종목을 추가해보세요</div>
                </div>
              </div>
            </template>

            <!-- ── 장기 / 단기 ── -->
            <template v-if="tab==='long' || tab==='short'">
              <div class="invest-header">
                <div class="summary-card" :class="tab==='long'?'long-card':'short-card'" style="flex:1">
                  <div class="sc-label">{{ tab==='long'?'📈 장기투자':'⚡ 단기투자' }} 요약</div>
                  <div class="sc-value">{{ fmt(Math.round(tab==='long'?long.value:short.value)) }}원</div>
                  <div class="sc-sub">
                    <span>투자금 {{ fmt(Math.round(tab==='long'?long.invest:short.invest)) }}원</span>
                    <span class="sc-rate" :class="isProfit(tab==='long'?long.rate:short.rate)?'profit':'loss'">{{ fmtRate(tab==='long'?long.rate:short.rate) }}</span>
                  </div>
                  <div class="sc-pnl" :class="isProfit(tab==='long'?long.pnl:short.pnl)?'profit':'loss'">
                    {{ isProfit(tab==='long'?long.pnl:short.pnl)?'+':'' }}{{ fmt(Math.round(tab==='long'?long.pnl:short.pnl)) }}원
                  </div>
                </div>
              </div>
              <div class="card mt16">
                <div class="card-title">{{ tab==='long'?'장기':'단기' }} 종목 ({{ (tab==='long'?longStocks:shortStocks).length }}개)</div>
                <!-- PC 테이블 -->
                <div v-if="!isMobile" class="table-wrap">
                  <table class="stock-table">
                    <thead>
                      <tr><th>종목명</th><th>수량</th><th>평균단가</th><th>현재가</th><th>평가금액</th><th>손익</th><th>수익률</th><th></th></tr>
                    </thead>
                    <tbody>
                      <tr v-for="(s,i) in (tab==='long'?longStocks:shortStocks)" :key="s.id">
                        <td><div class="td-name"><span class="color-dot" :style="{ background: COLORS[i%COLORS.length] }"></span><div><div class="name-text">{{ s.name }}</div><div v-if="s.ticker" class="ticker-text">{{ s.ticker }}</div></div></div></td>
                        <td>{{ fmt(s.quantity) }}주</td>
                        <td>{{ fmt(s.avg_price) }}원</td>
                        <td>{{ fmt(s.current_price) }}원</td>
                        <td>{{ fmt(Math.round(stockValue(s))) }}원</td>
                        <td :class="isProfit(stockPnl(s))?'profit':'loss'">{{ isProfit(stockPnl(s))?'+':'' }}{{ fmt(Math.round(stockPnl(s))) }}원</td>
                        <td :class="isProfit(stockRate(s))?'profit':'loss'">{{ fmtRate(stockRate(s)) }}</td>
                        <td><div class="td-actions"><button @click="editStock={...s}" class="btn-sm">수정</button><button @click="deleteStock(s.id)" class="btn-sm del">삭제</button></div></td>
                      </tr>
                      <tr v-if="(tab==='long'?longStocks:shortStocks).length===0"><td colspan="8" class="empty-td">종목을 추가해보세요</td></tr>
                    </tbody>
                  </table>
                </div>
                <!-- 모바일 카드 -->
                <div v-else class="ms-list">
                  <div v-for="(s,i) in (tab==='long'?longStocks:shortStocks)" :key="s.id" class="ms-card">
                    <div class="ms-top">
                      <div class="td-name"><span class="color-dot" :style="{background:COLORS[i%COLORS.length]}"></span><div><div class="name-text">{{ s.name }}</div><div v-if="s.ticker" class="ticker-text">{{ s.ticker }}</div></div></div>
                    </div>
                    <div class="ms-row"><span class="ms-lbl">평단</span><span>{{ fmt(s.avg_price) }}원</span><span class="ms-lbl">수량</span><span>{{ fmt(s.quantity) }}주</span></div>
                    <div class="ms-row"><span class="ms-lbl">현재가</span><span>{{ fmt(s.current_price) }}원</span><span class="ms-lbl">평가</span><span>{{ fmt(Math.round(stockValue(s))) }}원</span></div>
                    <div class="ms-row"><span class="ms-lbl">손익</span><span :class="isProfit(stockPnl(s))?'profit':'loss'">{{ isProfit(stockPnl(s))?'+':'' }}{{ fmt(Math.round(stockPnl(s))) }}원</span><span class="ms-lbl">수익률</span><span :class="isProfit(stockRate(s))?'profit':'loss'">{{ fmtRate(stockRate(s)) }}</span></div>
                    <div class="ms-actions"><button @click="editStock={...s}" class="btn-sm">수정</button><button @click="deleteStock(s.id)" class="btn-sm del">삭제</button></div>
                  </div>
                  <div v-if="(tab==='long'?longStocks:shortStocks).length===0" class="empty-td">종목을 추가해보세요</div>
                </div>
              </div>
            </template>

            <!-- ── 차트 ── -->
            <template v-if="tab==='chart'">
              <div class="chart-grid">
                <div class="card">
                  <div class="card-title">종목별 비중</div>
                  <div v-if="pieData.length > 0" class="chart-wrap">
                    <svg viewBox="0 0 200 200" width="180" height="180">
                      <path v-for="seg in pieData" :key="seg.name" :d="seg.d" :fill="seg.color" stroke="white" stroke-width="2" />
                      <circle cx="100" cy="100" r="50" fill="white" />
                      <text x="100" y="97"  text-anchor="middle" font-size="9"  fill="#888">총 평가</text>
                      <text x="100" y="113" text-anchor="middle" font-size="10" fill="#333" font-weight="bold">{{ Math.round(total.value/10000) }}만</text>
                    </svg>
                    <div class="legend">
                      <div v-for="(seg,i) in pieData" :key="seg.name" class="legend-row">
                        <span class="leg-dot" :style="{ background: seg.color }"></span>
                        <span class="leg-name">{{ seg.name }}</span>
                        <span class="leg-pct">{{ Math.round(seg.val/total.value*100) }}%</span>
                        <span class="leg-val">{{ fmt(Math.round(seg.val)) }}원</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-chart">종목을 추가해보세요</div>
                </div>
                <div class="card">
                  <div class="card-title">장기 / 단기 비중</div>
                  <div v-if="typePieData.length > 0" class="chart-wrap">
                    <svg viewBox="0 0 200 200" width="180" height="180">
                      <path v-for="seg in typePieData" :key="seg.name" :d="seg.d" :fill="seg.color" stroke="white" stroke-width="2" />
                      <circle cx="100" cy="100" r="50" fill="white" />
                    </svg>
                    <div class="legend">
                      <div v-for="seg in typePieData" :key="seg.name" class="legend-row">
                        <span class="leg-dot" :style="{ background: seg.color }"></span>
                        <span class="leg-name">{{ seg.name }}</span>
                        <span class="leg-pct">{{ Math.round(seg.val/total.value*100) }}%</span>
                        <span class="leg-val">{{ fmt(Math.round(seg.val)) }}원</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-chart">종목을 추가해보세요</div>
                </div>
                <div class="card full-width">
                  <div class="card-title">종목별 수익률</div>
                  <div v-if="stocks.length > 0" class="bar-chart">
                    <div v-for="(s,i) in [...stocks].sort((a,b)=>stockRate(b)-stockRate(a))" :key="s.id" class="bar-row">
                      <div class="bar-label">
                        <span class="color-dot" :style="{ background: COLORS[i%COLORS.length] }"></span>
                        <span>{{ s.name }}</span>
                        <span class="type-badge" :class="s.type" style="margin-left:6px">{{ s.type==='long'?'장기':'단기' }}</span>
                      </div>
                      <div class="bar-track">
                        <div class="bar-fill" :style="{ width: Math.min(Math.abs(stockRate(s)),100)+'%', background: isProfit(stockRate(s))?'#ef4444':'#2563eb', marginLeft: isProfit(stockRate(s))?'50%':`${50-Math.min(Math.abs(stockRate(s)),50)}%` }"></div>
                        <div class="bar-center"></div>
                      </div>
                      <div class="bar-rate" :class="isProfit(stockRate(s))?'profit':'loss'">{{ fmtRate(stockRate(s)) }}</div>
                    </div>
                  </div>
                  <div v-else class="empty-chart">종목을 추가해보세요</div>
                </div>
              </div>
            </template>

            <!-- ── 뉴스 ── -->
            <template v-if="tab==='news'">
              <div v-if="stocks.length === 0" class="card">
                <div class="empty-chart">종목을 먼저 추가해보세요</div>
              </div>
              <div v-else class="news-layout">
                <!-- 종목 목록 (모바일: 종목 선택 후 숨김) -->
                <div v-if="!isMobile || !selectedStock" class="news-stock-list">
                  <div class="card-title" style="padding:16px 16px 8px">보유 종목</div>
                  <button v-for="(s,i) in stocks" :key="s.id"
                    class="news-stock-btn" :class="{ active: selectedStock===s.name }"
                    @click="selectStock(s.name)">
                    <span class="color-dot" :style="{ background: COLORS[i%COLORS.length] }"></span>
                    <span class="ns-name">{{ s.name }}</span>
                    <span class="type-badge" :class="s.type">{{ s.type==='long'?'장기':'단기' }}</span>
                  </button>
                </div>

                <!-- 뉴스 패널 -->
                <div class="news-panel">
                  <div v-if="!selectedStock" class="card news-empty-state">
                    <div style="text-align:center;padding:60px 20px;color:#9ca3af">
                      <div style="font-size:48px;margin-bottom:16px">📰</div>
                      <div style="font-size:16px;font-weight:600;margin-bottom:8px">왼쪽에서 종목을 선택하세요</div>
                      <div style="font-size:13px">선택한 종목의 최신 뉴스를 불러옵니다</div>
                    </div>
                  </div>

                  <div v-else class="card">
                    <button v-if="isMobile" @click="selectedStock=null" class="news-back-btn">← 종목 목록</button>
                    <div class="news-panel-header">
                      <div class="card-title" style="margin:0">📰 {{ selectedStock }} 뉴스</div>
                      <div class="news-sort-btns">
                        <button @click="setNewsSort('date')" :class="['sort-btn', newsSort==='date'?'active':'']">최신순</button>
                        <button @click="setNewsSort('sim')" :class="['sort-btn', newsSort==='sim'?'active':'']">관련도순</button>
                      </div>
                      <button class="btn-refresh-news" @click="newsMap[selectedStock]={}; fetchNews(selectedStock)">새로고침</button>
                    </div>

                    <div v-if="newsLoading[selectedStock]" class="news-loading">
                      <div class="spinner sm"></div>
                      <span>뉴스 불러오는 중...</span>
                    </div>
                    <div v-else-if="currentNewsArticles.length === 0 && newsMap[selectedStock]?.[newsSort]" class="empty-chart">관련 뉴스가 없습니다</div>


                    <div v-else class="news-list">
                      <div v-for="article in newsPagedArticles" :key="article.url" class="news-item">
                        <div class="news-item-main">
                          <a :href="article.url" target="_blank" rel="noopener" class="news-title">{{ article.title }}</a>
                          <div class="news-meta">
                            <span class="news-source">{{ article.source }}</span>
                            <span class="news-time">{{ timeAgo(article.pubDate) }}</span>
                          </div>
                        </div>
                        <button class="bookmark-btn" :class="{ saved: bookmarkedIds.has(article.url) }" @click="toggleBookmark(article, selectedStock)" :title="bookmarkedIds.has(article.url)?'스크랩 해제':'스크랩 저장'">
                          {{ bookmarkedIds.has(article.url) ? '🔖' : '🤍' }}
                        </button>
                      </div>
                      <div v-if="newsTotalPages > 1" class="news-pagination">
                        <button @click="newsPage[selectedStock]--" :disabled="(newsPage[selectedStock]??0) === 0" class="pg-btn">◀</button>
                        <span class="pg-info">{{ (newsPage[selectedStock]??0)+1 }} / {{ newsTotalPages }}</span>
                        <button @click="newsPage[selectedStock]++" :disabled="(newsPage[selectedStock]??0) >= newsTotalPages-1" class="pg-btn">▶</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- ── 스크랩 ── -->
            <template v-if="tab==='scrap'">
              <div v-if="savedNews.length === 0" class="card">
                <div style="text-align:center;padding:60px 20px;color:#9ca3af">
                  <div style="font-size:48px;margin-bottom:16px">🔖</div>
                  <div style="font-size:16px;font-weight:600;margin-bottom:8px">저장된 기사가 없어요</div>
                  <div style="font-size:13px">뉴스 탭에서 마음에 드는 기사를 스크랩해보세요</div>
                </div>
              </div>

              <div v-else>
                <div v-for="(articles, stockName) in scrapByStock" :key="stockName" class="card mt16" style="margin-top:16px">
                  <div class="card-title">{{ stockName }} ({{ articles.length }}개)</div>
                  <div class="news-list">
                    <div v-for="n in articles" :key="n.id" class="news-item">
                      <div class="news-item-main">
                        <a :href="n.url" target="_blank" rel="noopener" class="news-title">{{ n.title }}</a>
                        <div class="news-meta">
                          <span class="news-source">{{ n.source }}</span>
                          <span class="news-time">{{ timeAgo(n.pub_date) }}</span>
                          <span class="news-saved-at">저장: {{ new Date(n.created_at).toLocaleDateString('ko-KR') }}</span>
                        </div>
                      </div>
                      <button class="bookmark-btn saved" @click="deleteScrap(n.id, n.url)" title="스크랩 해제">🔖</button>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- ── 모의투자 ── -->
            <template v-if="tab==='sim'">
              <div class="sim-header">
                <div class="summary-card total">
                  <div class="sc-label">총 자산</div>
                  <div class="sc-value">{{ fmt(Math.round(simTotalAsset)) }}원</div>
                  <div class="sc-sub">
                    <span>현금 {{ fmt(simBalance) }}원</span>
                    <span>보유주식 {{ fmt(Math.round(simHoldingValue)) }}원</span>
                    <span :class="simTotalPnl>=0?'profit':'loss'" style="font-weight:600">
                      {{ simTotalPnl>=0?'+':'' }}{{ fmt(Math.round(simTotalPnl)) }}원 ({{ simTotalRate>=0?'+':'' }}{{ simTotalRate.toFixed(2) }}%)
                    </span>
                  </div>
                </div>
                <div class="sim-actions">
                  <button class="btn-add-top" @click="showSimBuy=true">📈 매수</button>
                  <button class="btn-cancel" style="font-size:13px" @click="simReset">초기화</button>
                </div>
              </div>

              <div class="card mt16">
                <div class="card-title">보유 종목</div>
                <div class="table-wrap">
                  <table class="stock-table">
                    <thead><tr><th>종목명</th><th>수량</th><th>평단</th><th>현재가</th><th>손익</th><th>수익률</th><th></th></tr></thead>
                    <tbody>
                      <tr v-for="h in simHoldings" :key="h.id">
                        <td><div class="td-name"><div><div class="name-text">{{ h.name }}</div><div v-if="h.ticker" class="ticker-text">{{ h.ticker }}</div></div></div></td>
                        <td>{{ fmt(h.quantity) }}</td>
                        <td>{{ fmt(h.avg_price) }}</td>
                        <td>{{ fmt(simCurrentPrice(h)) }}</td>
                        <td :class="simHoldingPnl(h)>=0?'profit':'loss'">{{ simHoldingPnl(h)>=0?'+':'' }}{{ fmt(Math.round(simHoldingPnl(h))) }}</td>
                        <td :class="simHoldingRate(h)>=0?'profit':'loss'">{{ simHoldingRate(h)>=0?'+':'' }}{{ simHoldingRate(h).toFixed(2) }}%</td>
                        <td><button class="btn-sm del" @click="openSimSell(h)">매도</button></td>
                      </tr>
                      <tr v-if="simHoldings.length===0"><td colspan="7" class="empty-td">보유 종목이 없어요</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="card mt16">
                <div class="card-title">거래 내역</div>
                <div class="table-wrap">
                  <table class="stock-table">
                    <thead><tr><th>일시</th><th>종목</th><th>구분</th><th>수량</th><th>가격</th><th>금액</th></tr></thead>
                    <tbody>
                      <tr v-for="t in simTrades" :key="t.id">
                        <td style="font-size:12px;color:#9ca3af">{{ new Date(t.traded_at).toLocaleDateString('ko-KR') }}</td>
                        <td><div class="name-text">{{ t.name }}</div></td>
                        <td><span class="type-badge" :class="t.type==='buy'?'long':'short'">{{ t.type==='buy'?'매수':'매도' }}</span></td>
                        <td>{{ fmt(t.quantity) }}주</td>
                        <td>{{ fmt(t.price) }}원</td>
                        <td :class="t.type==='buy'?'loss':'profit'">{{ t.type==='buy'?'-':'+' }}{{ fmt(t.total) }}원</td>
                      </tr>
                      <tr v-if="simTrades.length===0"><td colspan="6" class="empty-td">거래 내역이 없어요</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>

            <!-- 헬스 탭 -->
            <template v-if="tab==='health'">
              <!-- 요약 카드 -->
              <div class="summary-grid">
                <div class="summary-card">
                  <div class="sc-label">총 운동 기록</div>
                  <div class="sc-value sm">{{ workouts.length }}회</div>
                </div>
                <div class="summary-card">
                  <div class="sc-label">최근 체중</div>
                  <div class="sc-value sm">{{ weightLogs.length ? weightLogs[weightLogs.length-1].weight + 'kg' : '-' }}</div>
                </div>
                <div class="summary-card" :class="weightPlateau ? 'loss' : ''">
                  <div class="sc-label">체중 정체기</div>
                  <div class="sc-value sm" style="font-size:16px">{{ weightPlateau ? '⚠️ 정체기' : '✅ 변화중' }}</div>
                </div>
                <div class="summary-card">
                  <div class="sc-label">이번 주 운동</div>
                  <div class="sc-value sm">{{ workouts.filter(w => new Date(w.date) >= new Date(Date.now()-7*86400000)).length }}회</div>
                </div>
              </div>

              <!-- 부위 밸런스 -->
              <div class="card mt16">
                <div class="card-title">부위별 운동 횟수</div>
                <div class="muscle-balance">
                  <div v-for="(cnt, group) in muscleBalance" :key="group" class="muscle-row">
                    <span class="muscle-name">{{ group }}</span>
                    <div class="muscle-bar-wrap">
                      <div class="muscle-bar" :style="{ width: (cnt / Math.max(...Object.values(muscleBalance), 1) * 100) + '%' }"></div>
                    </div>
                    <span class="muscle-cnt">{{ cnt }}회</span>
                  </div>
                </div>
              </div>

              <!-- 체중 기록 -->
              <div class="card mt16">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                  <div class="card-title" style="margin:0">체중 기록</div>
                  <button @click="showAddWeight=true" class="btn-add-top">+ 체중 추가</button>
                </div>
                <div class="table-wrap">
                  <table class="stock-table">
                    <thead><tr><th>날짜</th><th>체중 (kg)</th><th></th></tr></thead>
                    <tbody>
                      <tr v-for="w in [...weightLogs].reverse().slice(0,10)" :key="w.id">
                        <td>{{ w.date }}</td>
                        <td>{{ w.weight }}kg</td>
                        <td><button @click="deleteWeight(w.id)" class="btn-sm del">삭제</button></td>
                      </tr>
                      <tr v-if="!weightLogs.length"><td colspan="3" class="empty-td">체중을 기록해보세요</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- 운동 기록 -->
              <div class="card mt16">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                  <div class="card-title" style="margin:0">운동 기록</div>
                  <button @click="showAddWorkout=true" class="btn-add-top">+ 운동 추가</button>
                </div>
                <div class="table-wrap">
                  <table class="stock-table">
                    <thead><tr><th>날짜</th><th>운동</th><th>부위</th><th>세트</th><th>횟수</th><th>무게</th><th></th></tr></thead>
                    <tbody>
                      <tr v-for="w in workouts.slice(0,20)" :key="w.id">
                        <td>{{ w.date }}</td>
                        <td>{{ w.exercise }}</td>
                        <td>{{ w.muscle_group }}</td>
                        <td>{{ w.sets }}</td>
                        <td>{{ w.reps }}</td>
                        <td>{{ w.weight }}kg</td>
                        <td><button @click="deleteWorkout(w.id)" class="btn-sm del">삭제</button></td>
                      </tr>
                      <tr v-if="!workouts.length"><td colspan="7" class="empty-td">운동을 기록해보세요</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>

          </div>
        </div>
      </div>

      <!-- 체중 추가 모달 -->
      <div v-if="showAddWeight" class="modal-overlay" @click.self="showAddWeight=false">
        <div class="modal">
          <h3>체중 기록</h3>
          <div class="form-group"><label>날짜</label><input v-model="newWeight.date" type="date" class="input-field" /></div>
          <div class="form-group"><label>체중 (kg)</label><input v-model="newWeight.weight" type="number" step="0.1" class="input-field" placeholder="72.5" /></div>
          <div class="modal-btns">
            <button @click="showAddWeight=false" class="btn-cancel">취소</button>
            <button @click="addWeight" class="btn-primary">저장</button>
          </div>
        </div>
      </div>

      <!-- 운동 추가 모달 -->
      <div v-if="showAddWorkout" class="modal-overlay" @click.self="showAddWorkout=false">
        <div class="modal">
          <h3>운동 기록</h3>
          <div class="form-row">
            <div class="form-group"><label>날짜</label><input v-model="newWorkout.date" type="date" class="input-field" /></div>
            <div class="form-group">
              <label>부위</label>
              <select v-model="newWorkout.muscle_group" class="input-field">
                <option v-for="g in MUSCLE_GROUPS" :key="g">{{ g }}</option>
              </select>
            </div>
          </div>
          <div class="form-group"><label>운동 이름</label><input v-model="newWorkout.exercise" class="input-field" placeholder="벤치프레스" /></div>
          <div class="form-row">
            <div class="form-group"><label>세트</label><input v-model.number="newWorkout.sets" type="number" class="input-field" /></div>
            <div class="form-group"><label>횟수</label><input v-model.number="newWorkout.reps" type="number" class="input-field" /></div>
            <div class="form-group"><label>무게 (kg)</label><input v-model.number="newWorkout.weight" type="number" class="input-field" /></div>
          </div>
          <div class="form-group"><label>메모</label><input v-model="newWorkout.memo" class="input-field" placeholder="컨디션, 느낀점 등" /></div>
          <div class="modal-btns">
            <button @click="showAddWorkout=false" class="btn-cancel">취소</button>
            <button @click="addWorkout" class="btn-primary">저장</button>
          </div>
        </div>
      </div>

      <!-- 매수 모달 -->
      <div v-if="showSimBuy" class="modal-overlay" @click.self="showSimBuy=false">
        <div class="modal">
          <h3>📈 매수</h3>
          <div class="form-row">
            <div class="form-group" style="position:relative">
              <label>종목명 *</label>
              <input v-model="simBuyForm.name" placeholder="삼성전자" class="input-field"
                @input="simSearchStock(simBuyForm.name)" @blur="clearSimSearch" />
              <div v-if="simSearchResults.length > 0" class="search-dropdown">
                <div v-for="r in simSearchResults" :key="r.ticker" class="search-item"
                  @mousedown.prevent="simSelectStock(r)">
                  <div class="si-name">{{ r.name }}</div>
                  <div class="si-ticker">{{ r.ticker }}</div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>티커</label>
              <input v-model="simBuyForm.ticker" placeholder="005930.KS" class="input-field" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>수량 (주) *</label>
              <input v-model.number="simBuyForm.quantity" type="number" class="input-field" />
            </div>
            <div class="form-group">
              <label>가격 (원) *</label>
              <input v-model.number="simBuyForm.price" type="number" class="input-field" />
            </div>
          </div>
          <div v-if="simBuyForm.quantity && simBuyForm.price" class="sim-calc">
            주문금액: <b>{{ fmt(simBuyForm.quantity * simBuyForm.price) }}원</b>
            &nbsp;|&nbsp; 잔고: <b>{{ fmt(simBalance) }}원</b>
          </div>
          <div class="modal-btns">
            <button @click="showSimBuy=false" class="btn-cancel">취소</button>
            <button @click="simBuy" class="btn-primary">매수</button>
          </div>
        </div>
      </div>

      <!-- 매도 모달 -->
      <div v-if="simSellTarget" class="modal-overlay" @click.self="simSellTarget=null">
        <div class="modal">
          <h3>📉 매도 — {{ simSellTarget.name }}</h3>
          <div class="sim-calc" style="margin-bottom:16px">
            보유 수량: <b>{{ simSellTarget.quantity }}주</b> &nbsp;|&nbsp; 평균단가: <b>{{ fmt(simSellTarget.avg_price) }}원</b>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>수량 (주) *</label>
              <input v-model.number="simSellForm.quantity" type="number" :max="simSellTarget.quantity" class="input-field" />
            </div>
            <div class="form-group">
              <label>가격 (원) *</label>
              <input v-model.number="simSellForm.price" type="number" class="input-field" />
            </div>
          </div>
          <div v-if="simSellForm.quantity && simSellForm.price" class="sim-calc">
            매도금액: <b>{{ fmt(simSellForm.quantity * simSellForm.price) }}원</b>
          </div>
          <div class="modal-btns">
            <button @click="simSellTarget=null" class="btn-cancel">취소</button>
            <button @click="simSell" class="btn-primary" style="background:#ef4444">매도</button>
          </div>
        </div>
      </div>

      <!-- 종목 추가 모달 -->
      <div v-if="showAdd" class="modal-overlay" @click.self="showAdd=false">
        <div class="modal">
          <h3>종목 추가</h3>
          <div class="form-row">
            <div class="form-group" style="position:relative">
              <label>종목명 *</label>
              <input v-model="newStock.name" placeholder="삼성전자" class="input-field"
                @input="searchStock(newStock.name)" @blur="clearSearch" />
              <div v-if="searchResults.length > 0 || searchLoading" class="search-dropdown">
                <div v-if="searchLoading" class="search-loading">🔍 검색 중...</div>
                <div v-for="r in searchResults" :key="r.ticker" class="search-item"
                  @mousedown.prevent="selectSearchResult(r, newStock)">
                  <div class="si-name">{{ r.name }}</div>
                  <div class="si-ticker">{{ r.ticker }}</div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>티커 <span class="label-opt">(자동입력 또는 직접입력)</span></label>
              <input v-model="newStock.ticker" placeholder="005930.KS" class="input-field" />
              <div class="field-hint">
                📌 야후파이낸스 티커 형식<br>
                · 국내주식: 종목코드 + <b>.KS</b> → <code>005930.KS</code> (삼성전자)<br>
                · 코스닥: 종목코드 + <b>.KQ</b> → <code>035720.KQ</code> (카카오)<br>
                · 미국주식: 그대로 → <code>AAPL</code>, <code>TSLA</code><br>
                ※ 티커 없어도 종목 추가는 가능해요
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>수량 (주)</label><input type="text" inputmode="numeric" :value="fmtInput(newStock.quantity)" @input="newStock.quantity = parseInput($event.target.value)" class="input-field" placeholder="10" /></div>
            <div class="form-group"><label>평균단가 (원)</label><input type="text" inputmode="numeric" :value="fmtInput(newStock.avg_price)" @input="newStock.avg_price = parseInput($event.target.value)" class="input-field" placeholder="75,400" /></div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>구분</label>
              <div class="type-select">
                <button :class="{ active: newStock.type==='long'  }" @click="newStock.type='long'">📈 장기투자</button>
                <button :class="{ active: newStock.type==='short' }" @click="newStock.type='short'">⚡ 단기투자</button>
              </div>
            </div>
            <div class="form-group"><label>메모</label><input v-model="newStock.memo" placeholder="메모" class="input-field" /></div>
          </div>
          <div class="modal-btns">
            <button @click="showAdd=false" class="btn-cancel">취소</button>
            <button @click="addStock" class="btn-primary" :disabled="saveStatus==='saving'">추가</button>
          </div>
        </div>
      </div>

      <!-- 종목 수정 모달 -->
      <div v-if="editStock" class="modal-overlay" @click.self="editStock=null">
        <div class="modal">
          <h3>종목 수정</h3>
          <div class="form-row">
            <div class="form-group" style="position:relative">
              <label>종목명</label>
              <input v-model="editStock.name" class="input-field"
                @input="searchStock(editStock.name)" @blur="clearSearch" />
              <div v-if="searchResults.length > 0 || searchLoading" class="search-dropdown">
                <div v-if="searchLoading" class="search-loading">🔍 검색 중...</div>
                <div v-for="r in searchResults" :key="r.ticker" class="search-item"
                  @mousedown.prevent="selectSearchResult(r, editStock)">
                  <div class="si-name">{{ r.name }}</div>
                  <div class="si-ticker">{{ r.ticker }}</div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>티커 <span class="label-opt">(자동입력 또는 직접입력)</span></label>
              <input v-model="editStock.ticker" placeholder="005930.KS" class="input-field" />
              <div class="field-hint">
                📌 야후파이낸스 티커 형식<br>
                · 국내주식: 종목코드 + <b>.KS</b> → <code>005930.KS</code> (삼성전자)<br>
                · 코스닥: 종목코드 + <b>.KQ</b> → <code>035720.KQ</code> (카카오)<br>
                · 미국주식: 그대로 → <code>AAPL</code>, <code>TSLA</code>
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>수량 (주)</label><input type="text" inputmode="numeric" :value="fmtInput(editStock.quantity)" @input="editStock.quantity = parseInput($event.target.value)" class="input-field" /></div>
            <div class="form-group"><label>평균단가 (원)</label><input type="text" inputmode="numeric" :value="fmtInput(editStock.avg_price)" @input="editStock.avg_price = parseInput($event.target.value)" class="input-field" /></div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>구분</label>
              <div class="type-select">
                <button :class="{ active: editStock.type==='long'  }" @click="editStock.type='long'">📈 장기투자</button>
                <button :class="{ active: editStock.type==='short' }" @click="editStock.type='short'">⚡ 단기투자</button>
              </div>
            </div>
            <div class="form-group"><label>메모</label><input v-model="editStock.memo" class="input-field" /></div>
          </div>
          <div class="modal-btns">
            <button @click="editStock=null" class="btn-cancel">취소</button>
            <button @click="saveEdit" class="btn-primary" :disabled="saveStatus==='saving'">저장</button>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }
.root { min-height: 100vh; background: #eef2ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

.login-screen { display:flex; align-items:center; justify-content:center; min-height:100vh; background:#1e3a8a; }
.login-box { background:white; padding:48px 36px; border-radius:24px; box-shadow:0 20px 60px rgba(0,0,0,0.3); text-align:center; width:90%; max-width:360px; }
.login-icon { font-size:52px; margin-bottom:12px; }
.login-box h2 { font-size:20px; color:#1e3a8a; font-weight:700; margin-bottom:28px; }
.pw-input { width:100%; padding:14px; border:2px solid #e0e7ff; border-radius:12px; font-size:16px; text-align:center; margin-bottom:16px; }
.pw-input:focus { outline:none; border-color:#2563eb; }

.loading-screen { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; color:#6b7280; gap:16px; }
.spinner { width:40px; height:40px; border:3px solid #dbeafe; border-top-color:#2563eb; border-radius:50%; animation:spin 0.8s linear infinite; }
.spinner.sm { width:22px; height:22px; border-width:2px; }
@keyframes spin { to { transform:rotate(360deg); } }

.layout { display:flex; min-height:100vh; }

.sidebar { width:240px; flex-shrink:0; background:#1e3a8a; color:white; display:flex; flex-direction:column; position:fixed; left:0; top:0; bottom:0; z-index:50; transition:transform 0.25s; }
.sidebar-logo { display:flex; align-items:center; gap:10px; padding:24px 20px 20px; font-size:20px; font-weight:800; border-bottom:1px solid rgba(255,255,255,0.1); }
.logo-text { font-size:16px; letter-spacing:1px; }
.sidebar-nav { padding:16px 12px; flex:1; display:flex; flex-direction:column; gap:4px; }
.nav-item { display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:12px; border:none; background:none; color:rgba(255,255,255,0.65); font-size:14px; font-weight:600; cursor:pointer; width:100%; text-align:left; transition:0.15s; }
.nav-item:hover { background:rgba(255,255,255,0.1); color:white; }
.nav-item.active { background:rgba(255,255,255,0.2); color:white; }
.nav-icon { font-size:18px; }
.nav-badge { margin-left:auto; background:rgba(255,255,255,0.25); border-radius:10px; padding:1px 8px; font-size:11px; font-weight:700; }
.sidebar-summary { padding:16px 20px; border-top:1px solid rgba(255,255,255,0.1); }
.btn-logout { margin-top:12px; width:100%; padding:7px; border:1px solid rgba(255,255,255,0.3); border-radius:8px; background:none; color:rgba(255,255,255,0.7); font-size:12px; cursor:pointer; }
.btn-logout:hover { background:rgba(255,255,255,0.1); }
.ss-label { font-size:11px; opacity:0.6; margin-bottom:4px; }
.ss-value { font-size:18px; font-weight:700; margin-bottom:4px; }
.ss-rate { font-size:14px; font-weight:700; }

.main { margin-left:240px; flex:1; min-height:100vh; display:flex; flex-direction:column; }
.top-bar { background:white; border-bottom:1px solid #e0e7ff; padding:0 24px; height:60px; display:flex; align-items:center; gap:12px; position:sticky; top:0; z-index:40; }
.hamburger { display:none; background:none; border:none; font-size:22px; cursor:pointer; color:#374151; padding:6px; }
.page-title { font-size:18px; font-weight:700; color:#1e3a8a; flex:1; }
.top-actions { display:flex; gap:10px; }
.btn-refresh { padding:8px 16px; border:1px solid #e0e7ff; border-radius:8px; background:white; color:#2563eb; font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap; }
.btn-refresh:hover { background:#eff6ff; }
.btn-refresh:disabled { opacity:0.6; cursor:not-allowed; }
.btn-add-top { padding:8px 18px; background:#2563eb; color:white; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; white-space:nowrap; }
.btn-add-top:hover { background:#1d4ed8; }

.content { padding:24px; flex:1; }
.mt16 { margin-top:16px; }

.toast { position:fixed; top:70px; right:20px; background:white; border-radius:20px; padding:8px 18px; font-size:13px; box-shadow:0 4px 14px rgba(0,0,0,0.12); opacity:0; transition:opacity 0.3s; z-index:300; pointer-events:none; }
.toast.visible { opacity:1; }

.summary-grid { display:grid; grid-template-columns:1.5fr 1fr 1fr; gap:16px; }
.summary-card { border-radius:16px; padding:20px 24px; color:white; }
.summary-card.total      { background:linear-gradient(135deg,#1d4ed8,#2563eb); }
.summary-card.long-card  { background:linear-gradient(135deg,#0891b2,#0284c7); transition:0.15s; }
.summary-card.long-card:hover  { transform:translateY(-2px); }
.summary-card.short-card { background:linear-gradient(135deg,#7c3aed,#6d28d9); transition:0.15s; }
.summary-card.short-card:hover { transform:translateY(-2px); }
.sc-label { font-size:13px; opacity:0.8; margin-bottom:8px; }
.sc-value { font-size:28px; font-weight:800; margin-bottom:8px; }
.sc-value.sm { font-size:22px; }
.sc-sub { display:flex; justify-content:space-between; font-size:13px; opacity:0.85; margin-bottom:6px; }
.sc-rate { font-weight:700; }
.sc-pnl { font-size:16px; font-weight:700; }

.card { background:white; border-radius:16px; padding:20px 24px; }
.card-title { font-size:15px; font-weight:700; color:#1e3a8a; margin-bottom:16px; }
.invest-header { display:flex; gap:16px; }

.table-wrap { overflow-x:auto; }
.stock-table { width:100%; border-collapse:collapse; font-size:14px; }
.stock-table th { padding:10px 12px; background:#f8faff; color:#6b7280; font-weight:600; text-align:left; border-bottom:2px solid #e0e7ff; white-space:nowrap; }
.stock-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align:middle; }
.stock-table tr:hover td { background:#fafbff; }
.td-name { display:flex; align-items:center; gap:8px; }
.color-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.name-text { font-weight:600; color:#111827; }
.ticker-text { font-size:12px; color:#9ca3af; }
.type-badge { font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px; }
.type-badge.long  { background:#dbeafe; color:#1d4ed8; }
.type-badge.short { background:#ede9fe; color:#6d28d9; }
.price-cell { display:flex; align-items:center; gap:6px; }
.inline-price-input { width:80px; padding:4px 6px; border:1px solid #e0e7ff; border-radius:6px; font-size:12px; }
.inline-price-input:focus { outline:none; border-color:#2563eb; }
.td-actions { display:flex; gap:4px; }
.btn-sm { padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; border:1px solid #e0e7ff; background:white; color:#374151; }
.btn-sm:hover { background:#f9fafb; }
.btn-sm.del { color:#dc2626; border-color:#fecaca; }
.btn-sm.del:hover { background:#fef2f2; }
.empty-td { text-align:center; color:#9ca3af; padding:40px; }

.chart-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.full-width { grid-column:1/-1; }
.chart-wrap { display:flex; align-items:center; gap:24px; }
.legend { flex:1; }
.legend-row { display:flex; align-items:center; gap:8px; margin-bottom:10px; font-size:13px; }
.leg-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.leg-name { flex:1; color:#374151; font-weight:500; }
.leg-pct { font-weight:700; color:#111827; min-width:36px; }
.leg-val { font-size:12px; color:#9ca3af; min-width:80px; text-align:right; }
.empty-chart { text-align:center; color:#9ca3af; padding:40px; }
.bar-chart { display:flex; flex-direction:column; gap:14px; }
.bar-row { display:flex; align-items:center; gap:12px; }
.bar-label { display:flex; align-items:center; gap:6px; width:160px; font-size:13px; font-weight:500; flex-shrink:0; }
.bar-track { flex:1; height:20px; background:#f3f4f6; border-radius:4px; position:relative; overflow:hidden; }
.bar-fill { position:absolute; height:100%; border-radius:4px; transition:width 0.4s; }
.bar-center { position:absolute; left:50%; top:0; bottom:0; width:2px; background:#d1d5db; }
.bar-rate { width:72px; text-align:right; font-size:13px; font-weight:700; flex-shrink:0; }

/* 뉴스 */
.news-layout { display:grid; grid-template-columns:220px 1fr; gap:16px; align-items:start; }
.news-stock-list { background:white; border-radius:16px; overflow:hidden; }
.news-stock-btn { display:flex; align-items:center; gap:8px; width:100%; padding:12px 16px; border:none; background:none; cursor:pointer; font-size:13px; font-weight:500; color:#374151; border-bottom:1px solid #f3f4f6; transition:0.15s; }
.news-stock-btn:hover { background:#f8faff; }
.news-stock-btn.active { background:#eff6ff; color:#1d4ed8; font-weight:700; }
.ns-name { flex:1; text-align:left; }

.news-panel { }
.news-empty-state { }
.news-panel-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.btn-refresh-news { padding:6px 14px; border:1px solid #e0e7ff; border-radius:8px; background:white; color:#6b7280; font-size:12px; cursor:pointer; }
.btn-refresh-news:hover { background:#f8faff; }

.news-loading { display:flex; align-items:center; gap:10px; padding:30px 0; color:#6b7280; font-size:14px; }
.news-list { display:flex; flex-direction:column; gap:0; }
.news-item { display:flex; align-items:flex-start; gap:12px; padding:14px 0; border-bottom:1px solid #f3f4f6; }
.news-item:last-child { border-bottom:none; }
.news-item-main { flex:1; min-width:0; }
.news-title { display:block; font-size:14px; font-weight:600; color:#111827; text-decoration:none; line-height:1.5; margin-bottom:6px; }
.news-title:hover { color:#2563eb; text-decoration:underline; }
.news-meta { display:flex; align-items:center; gap:10px; font-size:12px; color:#9ca3af; flex-wrap:wrap; }
.news-source { font-weight:600; color:#6b7280; }
.news-time { }
.news-saved-at { color:#c4b5fd; }
.bookmark-btn { flex-shrink:0; background:none; border:1px solid #e0e7ff; border-radius:8px; padding:6px 10px; cursor:pointer; font-size:16px; transition:0.15s; color:#9ca3af; }
.bookmark-btn:hover { background:#fef9f0; border-color:#fbbf24; }
.bookmark-btn.saved { border-color:#7c3aed; background:#faf5ff; }
.news-back-btn { display:none; }
.news-sort-btns { display:flex; gap:4px; }
.sort-btn { background:none; border:1px solid #3a3a5c; color:#888; border-radius:6px; padding:4px 12px; font-size:12px; cursor:pointer; transition:0.15s; }
.sort-btn.active { background:#6c47ff; border-color:#6c47ff; color:#fff; }
.sort-btn:hover:not(.active) { border-color:#6c47ff; color:#c0b0ff; }
.news-pagination { display:flex; align-items:center; justify-content:center; gap:12px; padding:14px 0 4px; }
.pg-btn { background:#252540; border:1px solid #3a3a5c; color:#c0c0e0; border-radius:6px; padding:6px 14px; cursor:pointer; font-size:14px; transition:0.15s; }
.pg-btn:hover:not(:disabled) { background:#3a3a5c; }
.pg-btn:disabled { opacity:0.3; cursor:default; }
.pg-info { color:#888; font-size:13px; min-width:50px; text-align:center; }
.muscle-balance { display:flex; flex-direction:column; gap:8px; }
.muscle-row { display:grid; grid-template-columns:50px 1fr 36px; align-items:center; gap:10px; font-size:13px; }
.muscle-name { color:#888; }
.muscle-bar-wrap { background:#2a2a45; border-radius:4px; height:10px; overflow:hidden; }
.muscle-bar { background:#6c47ff; height:100%; border-radius:4px; transition:width 0.4s; }
.muscle-cnt { color:#c0c0e0; text-align:right; font-size:12px; }

.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:200; padding:20px; }
.modal { background:white; border-radius:20px; padding:28px; width:100%; max-width:640px; max-height:90vh; overflow:visible; }
.modal-inner { max-height:calc(90vh - 56px); overflow-y:auto; }
.modal h3 { font-size:18px; font-weight:700; color:#1e3a8a; margin-bottom:20px; }
.form-row { display:flex; gap:16px; margin-bottom:16px; }
.form-group { flex:1; display:flex; flex-direction:column; gap:6px; min-width:0; }
.form-group label { font-size:12px; font-weight:600; color:#6b7280; }
.input-field { width:100%; padding:11px 13px; border:1px solid #e0e7ff; border-radius:10px; font-size:14px; background:#f8faff; }
.input-field:focus { outline:none; border-color:#2563eb; background:white; }
.type-select { display:flex; gap:8px; }
.type-select button { flex:1; padding:10px; border:2px solid #e0e7ff; border-radius:10px; background:white; font-size:13px; font-weight:600; cursor:pointer; color:#6b7280; }
.type-select button.active { border-color:#2563eb; background:#eff6ff; color:#2563eb; }
.modal-btns { display:flex; gap:10px; margin-top:20px; justify-content:flex-end; }
.btn-cancel { padding:11px 24px; border:1px solid #e0e7ff; border-radius:10px; cursor:pointer; background:white; font-size:14px; color:#6b7280; }
.btn-primary { padding:11px 28px; background:#2563eb; color:white; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; }
.btn-primary:disabled { opacity:0.6; }
.label-opt { font-weight:400; color:#9ca3af; }
.search-dropdown { position:absolute; top:100%; left:0; right:0; background:white; border:1px solid #e0e7ff; border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,0.12); z-index:100; overflow:hidden; margin-top:4px; }
.search-loading { padding:12px 16px; font-size:13px; color:#9ca3af; }
.search-item { display:flex; align-items:center; justify-content:space-between; padding:10px 16px; cursor:pointer; border-bottom:1px solid #f3f4f6; transition:0.1s; }
.search-item:last-child { border-bottom:none; }
.search-item:hover { background:#eff6ff; }
.si-name { font-size:13px; font-weight:600; color:#111827; }
.si-ticker { font-size:12px; color:#2563eb; font-weight:700; background:#dbeafe; padding:2px 8px; border-radius:6px; }
.field-hint { margin-top:6px; padding:10px 12px; background:#f8faff; border:1px solid #e0e7ff; border-radius:8px; font-size:12px; color:#6b7280; line-height:1.8; }
.field-hint code { background:#e0e7ff; color:#2563eb; padding:1px 5px; border-radius:4px; font-size:11px; }

.profit { color:#ef4444; }
.loss   { color:#2563eb; }

.sim-header { display:flex; align-items:stretch; gap:16px; }
.sim-actions { display:flex; flex-direction:column; gap:8px; justify-content:center; }
.sim-calc { padding:10px 14px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; font-size:13px; color:#0369a1; margin-bottom:4px; }
.side-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:49; }

@media (max-width:768px) {
  .sidebar { transform:translateX(-100%); }
  .sidebar.open { transform:translateX(0); }
  .main { margin-left:0; overflow-x:hidden; }
  .hamburger { display:block; }
  .summary-grid { grid-template-columns:1fr; gap:8px; }
  .chart-grid { grid-template-columns:1fr; }
  .form-row { flex-direction:column; }
  .top-actions { gap:6px; }
  .btn-refresh { font-size:12px; padding:6px 12px; }
  .news-layout { grid-template-columns:1fr; }
  .news-back-btn { display:block; background:none; border:none; color:#7c6aff; font-size:13px; font-weight:600; padding:0 0 12px; cursor:pointer; }
  .news-panel-header { flex-wrap:wrap; gap:8px; }

  /* 가로 스크롤 제거 */
  .root, .layout, .content { overflow-x:hidden; max-width:100vw; }
  .table-wrap { overflow-x:hidden; }

  /* 테이블 - 모바일에서 컬럼 숨기기 */
  .stock-table .hide-mobile { display:none; }

  /* 전체 여백 축소 */
  .content { padding:12px; }
  .card { padding:14px 12px; }
  .card-title { font-size:13px; margin-bottom:10px; }
  .mt16 { margin-top:10px; }

  /* 상단바 */
  .top-bar { height:50px; padding:0 12px; }
  .page-title { font-size:15px; }
  .btn-add-top { padding:6px 12px; font-size:12px; }

  /* 요약 카드 */
  .summary-card { padding:14px 16px; }
  .sc-value { font-size:20px; }
  .sc-value.sm { font-size:17px; }
  .sc-label { font-size:12px; margin-bottom:4px; }
  .sc-pnl { font-size:13px; }

  /* 테이블 */
  .stock-table { font-size:12px; }
  .stock-table th, .stock-table td { padding:8px 4px; }

  /* 모달 */
  .modal { padding:20px 16px; }
  .modal h3 { font-size:16px; margin-bottom:14px; }

  /* 사이드바 요약 */
  .ss-value { font-size:15px; }

  /* 심 헤더 */
  .sim-header { flex-direction:column; }
  .sim-actions { flex-direction:row; }

  /* 모바일 카드 목록 */
  .ms-list { display:flex; flex-direction:column; gap:12px; }
  .ms-card .name-text { color:#f0f0ff; }
  .ms-card .ticker-text { color:#8899bb; }
  .ms-card { background:#252540; border:1px solid #3a3a5c; border-radius:12px; padding:14px 16px; }
  .ms-top { display:flex; align-items:center; gap:8px; margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid #3a3a5c; }
  .ms-row { display:grid; grid-template-columns:44px 1fr 44px 1fr; align-items:center; gap:3px 10px; margin-bottom:7px; font-size:13.5px; color:#e0e0f0; }
  .ms-lbl { color:#7a8aaa; font-size:11px; white-space:nowrap; }
  .ms-actions { display:flex; gap:8px; margin-top:12px; padding-top:10px; border-top:1px solid #3a3a5c; justify-content:flex-end; }
}
</style>
