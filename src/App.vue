<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

const EDGE_FUNCTION_URL  = 'https://wqahhqssawaxynqigwtr.supabase.co/functions/v1/smooth-action'
const KIS_PRICE_URL     = 'https://wqahhqssawaxynqigwtr.supabase.co/functions/v1/price-auto-refresh'
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
  { name:'더존비즈온',         ticker:'012510.KQ' },
  { name:'솔브레인',           ticker:'036830.KQ' },
  { name:'클래시스',           ticker:'214150.KQ' },
  { name:'씨에스윈드',         ticker:'112610.KQ' },
  { name:'포스코DX',           ticker:'022100.KQ' },
  // 우선주
  { name:'삼성전자우',         ticker:'005935.KS' },
  { name:'현대차우',           ticker:'005387.KS' },
  { name:'현대차2우B',         ticker:'005385.KS' },
  { name:'기아우',             ticker:'000272.KS' },
  { name:'LG화학우',           ticker:'051915.KS' },
  { name:'삼성SDI우',          ticker:'006405.KS' },
  { name:'아모레퍼시픽우',     ticker:'090435.KS' },
  { name:'LG생활건강우',       ticker:'051905.KS' },
  { name:'S-Oil우',            ticker:'010955.KS' },
  { name:'SK이노베이션우',     ticker:'096775.KS' },
  { name:'두산밥캣우',         ticker:'241565.KS' },
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
  { name:'Snowflake',          ticker:'SNOW' },
  { name:'Super Micro',        ticker:'SMCI' },
  { name:'Palo Alto',          ticker:'PANW' },
  { name:'CrowdStrike',        ticker:'CRWD' },
  { name:'ServiceNow',         ticker:'NOW' },
  { name:'Salesforce',         ticker:'CRM' },
  { name:'Qualcomm',           ticker:'QCOM' },
  { name:'Intel',              ticker:'INTC' },
  { name:'JPMorgan',           ticker:'JPM' },
  { name:'Berkshire B',        ticker:'BRK.B' },
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
const simBalance      = ref(0)
const simHoldings     = ref([])
const simTrades       = ref([])
const tradeConditions = ref([])
const showCondForm    = ref(false)
const condForm        = ref({ name:'', ticker:'', condition_type:'buy', target_price:'', quantity:'' })
const condCurrentPrice = ref(null)
const condPriceFetching = ref(false)
const fetchCondPrice = async (ticker) => {
  if (!ticker) { condCurrentPrice.value = null; return }
  condPriceFetching.value = true
  const prices = await fetchPrices([ticker])
  condCurrentPrice.value = prices[ticker] || null
  if (condCurrentPrice.value && !condForm.value.target_price) condForm.value.target_price = condCurrentPrice.value
  condPriceFetching.value = false
}
const selectCondStock = (s) => {
  condForm.value.name   = s.name
  condForm.value.ticker = s.ticker
  searchResults.value   = []
  fetchCondPrice(s.ticker)
}
const adjustCondPrice = (delta) => {
  condForm.value.target_price = (Number(condForm.value.target_price) || condCurrentPrice.value || 0) + delta
}

// ── 장기/단기 매도
const stockTrades    = ref([])
const stockSellTarget = ref(null)
const stockSellForm  = ref({ quantity:'', price:'' })

// ── 헬스
const userExercises   = ref([])  // { id, exercise, muscle_group }
const workouts        = ref([])
const weightLogs      = ref([])
const reports         = ref([])
const workoutMemos    = ref([])
const memoDate        = ref(new Date().toISOString().slice(0,10))
const memoContent     = ref('')
const memoSaving      = ref(false)
const showAddWorkout  = ref(false)
const showAddWeight   = ref(false)
const selectedReport   = ref(null)
const reportGenerating = ref(false)
const showPasteReport  = ref(false)
const pasteForm = ref({ type:'weekly', period_label:'', content:'' })

// 보고서 연/월/주 선택
const reportSelYear = ref(new Date().getFullYear())
const reportSelMonth = ref(new Date().getMonth() + 1)
const reportSelWeek = ref('')

const reportYears = (type) => [...new Set(
  reports.value.filter(r => r.type === type && r.period_start)
    .map(r => parseInt(r.period_start.slice(0, 4)))
)].sort((a, b) => b - a)

const reportMonths = computed(() => [...new Set(
  reports.value.filter(r => r.type === 'monthly' && r.period_start?.startsWith(String(reportSelYear.value)))
    .map(r => parseInt(r.period_start.slice(5, 7)))
)].sort((a, b) => b - a))

const reportWeeks = computed(() =>
  reports.value.filter(r => r.type === 'weekly' && r.period_start?.startsWith(String(reportSelYear.value)))
    .sort((a, b) => b.period_start.localeCompare(a.period_start))
)

const foundMonthlyReport = computed(() =>
  reports.value.find(r => r.type === 'monthly' &&
    r.period_start?.startsWith(`${reportSelYear.value}-${String(reportSelMonth.value).padStart(2, '0')}`))
)
const foundWeeklyReport = computed(() =>
  reports.value.find(r => r.type === 'weekly' && r.period_start === reportSelWeek.value)
)
const deleteReport = async (id) => {
  const { error } = await supabase.from('reports').delete().eq('id', id)
  if (!error) {
    reports.value = reports.value.filter(r => r.id !== id)
    if (selectedReport.value?.id === id) selectedReport.value = null
  }
}
const editingReport = ref(false)
const editReportContent = ref('')
const startEditReport = () => {
  editReportContent.value = selectedReport.value.content
  editingReport.value = true
}
const saveEditReport = async () => {
  const { error } = await supabase.from('reports').update({ content: editReportContent.value }).eq('id', selectedReport.value.id)
  if (!error) {
    selectedReport.value.content = editReportContent.value
    const r = reports.value.find(r => r.id === selectedReport.value.id)
    if (r) r.content = editReportContent.value
    editingReport.value = false
  }
}

const savePastedReport = async () => {
  if (!pasteForm.value.content.trim() || !pasteForm.value.period_label.trim()) return
  const now = new Date()
  const { data, error } = await supabase.from('reports').insert({
    type: pasteForm.value.type,
    period_label: pasteForm.value.period_label,
    period_start: now.toISOString().slice(0,10),
    content: pasteForm.value.content.trim()
  }).select().single()
  if (!error && data) {
    reports.value.unshift(data)
    selectedReport.value = data
    showPasteReport.value = false
    pasteForm.value = { type:'weekly', period_label:'', content:'' }
  }
}
const newWorkout = ref({ date: new Date().toISOString().slice(0,10), exercise:'', muscle_group:'가슴', sets:3, reps:10, weight:0, memo:'', duration_min: null })
const newWeight  = ref({ date: new Date().toISOString().slice(0,10), weight:'' })

// 날짜별 일괄 입력
const showBatchWorkout  = ref(false)
const batchDate         = ref(new Date().toISOString().slice(0,10))
const batchItems        = ref([])
const batchSaving       = ref(false)
const batchMemo         = ref('')
const batchDuration     = ref(null)
const supersetMode      = ref(false)
const supersetGroupId   = ref(null)

const freshEntry = () => ({ muscle_group:'가슴', exercise:'', customExercise:'', set_type:'normal',
  set_logs:[{ weight:0, reps:10, type:'normal' }] })
const batchEntry = ref(freshEntry())

const addSetLog = () => {
  const last = batchEntry.value.set_logs.at(-1)
  batchEntry.value.set_logs.push({ weight: last?.weight ?? 0, reps: last?.reps ?? 10, type:'normal' })
}
const removeSetLog = (i) => { if (batchEntry.value.set_logs.length > 1) batchEntry.value.set_logs.splice(i, 1) }
const addDropSet = () => {
  const last = batchEntry.value.set_logs.at(-1)
  batchEntry.value.set_logs.push({ weight: Math.max(0, (last?.weight ?? 0) - 5), reps: last?.reps ?? 10, type:'dropset' })
}
const toggleFailure = (i) => {
  const s = batchEntry.value.set_logs[i]
  s.type = s.type === 'failure' ? 'normal' : 'failure'
}
const MUSCLE_GROUPS = ['가슴','등','어깨','하체','삼두','이두','코어','유산소']
const EXERCISE_DB = {
  '가슴': [
    '벤치프레스','스미스머신 벤치프레스','스미스머신 인클라인 벤치프레스',
    '덤벨 벤치프레스','인클라인 덤벨 벤치프레스','인클라인 벤치프레스','디클라인 벤치프레스',
    '덤벨 플라이','인클라인 덤벨 플라이','디클라인 덤벨 플라이',
    '스탠딩 케이블 플라이','인클라인 케이블 플라이','로우 풀리 케이블 플라이',
    '딥스','중량 딥스','어시스트 딥스 머신','시티드 딥스 머신',
    '푸시업','중량 푸시업','클로즈그립 푸시업','인클라인 푸시업','디클라인 푸시업',
    '체스트 프레스 머신','펙덱 플라이 머신','인클라인 벤치프레스 머신','디클라인 체스트 프레스 머신',
    '덤벨 풀오버','해머 벤치프레스','스포토 벤치프레스','바벨 플로어 프레스',
    '덤벨 스퀴즈 프레스','인클라인 덤벨 트위스트 프레스'
  ],
  '등': [
    '풀업','중량 풀업','어시스트 풀업 머신',
    '친업','중량 친업',
    '랫풀다운','맥그립 랫풀다운','패러럴그립 랫풀다운','언더그립 랫풀다운','비하인드 넥 풀다운',
    '원암 케이블 풀다운','원암 레터럴 와이드 풀다운',
    '바벨 로우','언더그립 바벨 로우','인클라인 바벨 로우','라잉 바벨 로우','정지 바벨 로우',
    '덤벨 로우','원암 덤벨 로우','인클라인 덤벨 로우',
    '시티드 케이블 로우','플로어 시티드 케이블 로우','원암 시티드 케이블 로우',
    '시티드 로우 머신','티바 로우 머신','로우 로우 머신','원암 로우 로우 머신',
    '하이 로우 머신','언더그립 하이 로우 머신','원암 하이 로우 머신',
    '인버티드 로우','스미스머신 로우','케이블 암 풀다운',
    '백 익스텐션','중량 하이퍼 익스텐션','굿모닝 엑서사이즈','바벨 풀오버'
  ],
  '어깨': [
    '오버헤드 프레스','스미스머신 오버헤드 프레스','푸시 프레스','비하인드 넥 프레스',
    '덤벨 숄더 프레스','아놀드 덤벨 프레스','시티드 덤벨 숄더 프레스','시티드 바벨 숄더 프레스',
    '플레이트 숄더 프레스','랜드마인 프레스','원암 랜드마인 프레스',
    '숄더 프레스 머신',
    '덤벨 레터럴 레이즈','케이블 레터럴 레이즈','원암 케이블 레터럴 레이즈','레터럴 레이즈 머신',
    '벤트오버 덤벨 레터럴 레이즈','시티드 덤벨 리어 레터럴 레이즈',
    '덤벨 프론트 레이즈','케이블 프론트 레이즈','이지바 프론트 레이즈',
    '덤벨 슈러그','바벨 슈러그','스미스머신 슈러그','케이블 슈러그','슈러그 머신',
    '페이스 풀','바벨 업라이트 로우','덤벨 업라이트 로우','이지바 업라이트 로우',
    '케이블 리버스 플라이','리어 델토이드 플라이 머신',
    '케이블 인터널 로테이션','케이블 익스터널 로테이션',
    'Y 레이즈','덤벨 Y 레이즈','핸드스탠드 푸시업'
  ],
  '하체': [
    '바벨 백스쿼트','프론트 스쿼트','박스 스쿼트','저처 스쿼트','에어 스쿼트','점프 스쿼트',
    '스미스머신 스쿼트','핵 스쿼트 머신',
    '덤벨 스쿼트','덤벨 고블릿 스쿼트','케틀벨 고블릿 스쿼트',
    '스플릿 스쿼트','불가리안 스플릿 스쿼트','스미스머신 스플릿 스쿼트','피스톨 스쿼트',
    '컨벤셔널 데드리프트','스미스머신 데드리프트',
    '루마니안 데드리프트','스모 데드리프트',
    '레그 프레스','레그 컬','레그 익스텐션',
    '힙 쓰러스트','힙 쓰러스트 머신','글루트 브릿지','덩키 킥',
    '런지','덤벨 런지','스텝업','카프 레이즈',
    '노르딕 햄스트링 컬'
  ],
  '삼두': [
    '케이블 푸시 다운','케이블 트라이셉 익스텐션','케이블 오버헤드 트라이셉 익스텐션','케이블 라잉 트라이셉 익스텐션',
    '덤벨 트라이셉 익스텐션','시티드 덤벨 트라이셉 익스텐션','덤벨 킥백',
    '스컬 크러셔','바벨 라잉 트라이셉 익스텐션',
    '클로즈 그립 벤치프레스','벤치 딥스','트라이셉 익스텐션 머신',
    '딥스','중량 딥스'
  ],
  '이두': [
    '바벨 컬','이지바 컬','덤벨 컬','인클라인 덤벨 컬',
    '덤벨 해머 컬','케이블 해머컬',
    '덤벨 프리쳐 컬','바벨 프리쳐 컬','이지바 프리쳐 컬','프리쳐 컬 머신',
    '암 컬 머신',
    '리버스 바벨 컬','리버스 덤벨 컬',
    '바벨 리스트 컬','이지바 리스트 컬','덤벨 리스트 컬',
    '리버스 바벨 리스트 컬','리버스 덤벨 리스트 컬'
  ],
  '코어': [
    '플랭크','사이드 플랭크','RKC 플랭크','플랭크 트위스트',
    '크런치','리버스 크런치','사이드 크런치','디클라인 크런치','중량 디클라인 크런치',
    '싯업','디클라인 싯업','중량 디클라인 싯업',
    '레그 레이즈','행잉 레그 레이즈','행잉 니 레이즈','캡틴스 체어 니 레이즈','시티드 니업',
    '러시안 트위스트','케이블 트위스트','토르소 로테이션 머신',
    '브이 업','할로우 락','할로우 포지션',
    '복근 롤아웃','복근 에어 바이크',
    '덤벨 사이드 벤드','45도 사이드 벤드','케이블 사이드 벤드',
    '토즈투 바','힐 터치',
    '케이블 크런치','복근 크런치 머신','복근 코스터 머신',
    '데드버그','버드독','필라테스 잭나이프','업도미널 힙 쓰러스트'
  ],
  '유산소': [
    '트레드밀','달리기','걷기',
    '싸이클','어썰트 바이크','일립티컬 머신',
    '로잉 머신','스키 머신',
    '줄넘기','이단 뛰기','하이니 스킵',
    '계단 오르기','스텝밀',
    '수영'
  ]
}
// ── 자동매매 조건
const addCondition = async () => {
  const f = condForm.value
  if (!f.name || !f.ticker || !f.target_price || !f.quantity) return alert('모든 항목을 입력해주세요')
  const { data, error } = await supabase.from('trade_conditions').insert({
    name: f.name, ticker: f.ticker, condition_type: f.condition_type,
    target_price: Number(f.target_price), quantity: Number(f.quantity), active: true
  }).select().single()
  if (error) return alert('저장 실패')
  tradeConditions.value.unshift(data)
  condForm.value = { name:'', ticker:'', condition_type:'buy', target_price:'', quantity:'' }
  condCurrentPrice.value = null
  showCondForm.value = false
}
const toggleCondition = async (cond) => {
  const newActive = !cond.active
  await supabase.from('trade_conditions').update({ active: newActive }).eq('id', cond.id)
  cond.active = newActive
}
const deleteCondition = async (cond) => {
  if (!confirm('삭제할까요?')) return
  await supabase.from('trade_conditions').delete().eq('id', cond.id)
  tradeConditions.value = tradeConditions.value.filter(c => c.id !== cond.id)
}

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

const addModalCurrentPrice  = ref(null)
const addModalPriceFetching = ref(false)
const selectSearchResult = async (result, stock) => {
  stock.name   = result.name
  stock.ticker = result.ticker
  searchResults.value = []
  if (stock === newStock.value && result.ticker) {
    addModalCurrentPrice.value = null
    addModalPriceFetching.value = true
    const prices = await fetchPrices([result.ticker])
    addModalCurrentPrice.value = prices[result.ticker] || null
    addModalPriceFetching.value = false
  }
}

const clearSearch = () => { setTimeout(() => { searchResults.value = [] }, 200) }
const closeAddModal = () => {
  newStock.value = { name:'', ticker:'', quantity:'', avg_price:'', memo:'', type:'long' }
  addModalCurrentPrice.value = null
  searchResults.value = []
  showAdd.value = false
}

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
  if (error) { loginError.value = '아이디 또는 비밀번호가 틀렸습니다.'; return }
  isAuthorized.value = true
  await fetchAll()
  startInactivityWatch()
}

const logout = async () => {
  stopInactivityWatch()
  await supabase.auth.signOut()
  isAuthorized.value = false
  inputEmail.value = ''
  inputPassword.value = ''
}

// 비활성 자동 로그아웃 (1시간)
let inactivityTimer = null
const INACTIVITY_LIMIT = 60 * 60 * 1000
const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer)
  if (isAuthorized.value) {
    inactivityTimer = setTimeout(() => { logout() }, INACTIVITY_LIMIT)
  }
}
const startInactivityWatch = () => {
  ['click','keydown','touchstart','scroll'].forEach(e =>
    window.addEventListener(e, resetInactivityTimer, { passive: true }))
  resetInactivityTimer()
}
const stopInactivityWatch = () => {
  clearTimeout(inactivityTimer)
  ;['click','keydown','touchstart','scroll'].forEach(e =>
    window.removeEventListener(e, resetInactivityTimer))
}

// ── 데이터 불러오기
const fetchAll = async () => {
  loading.value = true
  try {
    const [stockRes, newsRes, balRes, holdRes, tradeRes, condRes, stockTradeRes, workoutRes, weightRes, reportRes, profileRes, memoRes, userExRes] = await Promise.all([
      supabase.from('stock_items').select('*').order('created_at'),
      supabase.from('saved_news').select('*').order('created_at', { ascending: false }),
      supabase.from('sim_balance').select('*').eq('id', 1).maybeSingle(),
      supabase.from('sim_holdings').select('*').order('created_at'),
      supabase.from('sim_trades').select('*').order('traded_at', { ascending: false }),
      supabase.from('trade_conditions').select('*').order('created_at', { ascending: false }),
      supabase.from('stock_trades').select('*').order('traded_at', { ascending: false }),
      supabase.from('workouts').select('*').order('date', { ascending: false }).order('created_at', { ascending: true }),
      supabase.from('weight_logs').select('*').order('date'),
      supabase.from('reports').select('*').order('period_start', { ascending: false }),
      supabase.from('user_profile').select('*').eq('id', 1).maybeSingle(),
      supabase.from('workout_memos').select('*').order('date', { ascending: false }),
      supabase.from('user_exercises').select('*').order('created_at')
    ])
    if (stockRes.data) stocks.value = stockRes.data
    if (newsRes.data)  {
      savedNews.value = newsRes.data
      bookmarkedIds.value = new Set(newsRes.data.map(n => n.url))
    }
    simBalance.value  = balRes.data?.cash ?? 10000000
    if (holdRes.data)  simHoldings.value     = holdRes.data
    if (tradeRes.data) simTrades.value       = tradeRes.data
    if (condRes.data)       tradeConditions.value = condRes.data
    if (stockTradeRes.data) stockTrades.value     = stockTradeRes.data
    if (workoutRes.data) workouts.value  = workoutRes.data
    if (weightRes.data)  weightLogs.value = weightRes.data
    if (reportRes.data)  reports.value   = reportRes.data
    if (profileRes.data) profile.value  = { height: profileRes.data.height||'', age: profileRes.data.age||'', gender: profileRes.data.gender||'남', goal: profileRes.data.goal||'' }
    if (memoRes.data)    workoutMemos.value = memoRes.data
    if (userExRes.data)  userExercises.value = userExRes.data
  } catch (e) { console.error(e) }
  loading.value = false
  autoRefreshPrices()
}

const autoRefreshPrices = async () => {
  const targets = stocks.value.filter(s => s.ticker)
  if (!targets.length) return
  const tickers = targets.map(s => s.ticker)
  const prices  = await fetchPrices(tickers)
  await Promise.all(targets.map(stock => {
    const price = prices[stock.ticker]
    return price ? updateCurrentPrice(stock, price) : Promise.resolve()
  }))
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
  await Promise.all(targets.map(async stock => {
    const price = prices[stock.ticker]
    if (price) { await updateCurrentPrice(stock, price); updated++ }
  }))
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
  const name     = newStock.value.name.trim()
  const ticker   = newStock.value.ticker.trim()
  const qty      = Number(newStock.value.quantity) || 0
  const avgPrice = Number(newStock.value.avg_price) || 0
  const type     = newStock.value.type

  const existing = stocks.value.find(s => s.name === name && s.type === type)
  if (existing) {
    const newQty = existing.quantity + qty
    const newAvg = qty && avgPrice
      ? Math.round((existing.quantity * existing.avg_price + qty * avgPrice) / newQty)
      : existing.avg_price
    const { error } = await supabase.from('stock_items').update({ quantity: newQty, avg_price: newAvg }).eq('id', existing.id)
    if (!error) {
      existing.quantity  = newQty
      existing.avg_price = newAvg
      closeAddModal()
      setToast('saved')
    } else { setToast('error'); alert('수정 실패: ' + error.message) }
    return
  }

  const payload = { name, ticker, quantity: qty, avg_price: avgPrice, current_price: 0, memo: newStock.value.memo, type }
  const { data, error } = await supabase.from('stock_items').insert(payload).select().single()
  if (!error && data) {
    stocks.value.push(data)
    closeAddModal()
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

const openStockSell = (s) => {
  stockSellTarget.value = s
  stockSellForm.value = { quantity: '', price: s.current_price || s.avg_price || '' }
}
const stockSell = async () => {
  const s     = stockSellTarget.value
  const qty   = Number(stockSellForm.value.quantity)
  const price = Number(stockSellForm.value.price)
  if (!qty || !price) return alert('수량과 가격을 입력해주세요')
  if (qty > s.quantity) return alert('보유 수량 초과')
  const pnl = (price - s.avg_price) * qty
  await supabase.from('stock_trades').insert({ name: s.name, ticker: s.ticker, type: s.type, quantity: qty, avg_price: s.avg_price, sell_price: price, pnl })
  stockTrades.value.unshift({ name: s.name, ticker: s.ticker, type: s.type, quantity: qty, avg_price: s.avg_price, sell_price: price, pnl, traded_at: new Date().toISOString() })
  if (qty === s.quantity) {
    await supabase.from('stock_items').delete().eq('id', s.id)
    stocks.value = stocks.value.filter(x => x.id !== s.id)
  } else {
    await supabase.from('stock_items').update({ quantity: s.quantity - qty }).eq('id', s.id)
    s.quantity -= qty
  }
  stockSellTarget.value = null
  stockSellForm.value = { quantity:'', price:'' }
}

const resetStocks = async (type) => {
  const label = type === 'long' ? '장기투자' : '단기투자'
  if (!confirm(`${label} 데이터를 초기화할까요?\n보유 종목과 거래 기록이 모두 삭제됩니다.`)) return
  await supabase.from('stock_items').delete().eq('type', type)
  await supabase.from('stock_trades').delete().eq('type', type)
  stocks.value = stocks.value.filter(s => s.type !== type)
  stockTrades.value = stockTrades.value.filter(t => t.type !== type)
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
  if (session) { isAuthorized.value = true; await fetchAll(); startInactivityWatch() }
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
  stopInactivityWatch()
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

const realizedPnl = (type) => stockTrades.value.filter(t => t.type === type).reduce((s, t) => s + t.pnl, 0)
const longRealizedPnl  = computed(() => realizedPnl('long'))
const shortRealizedPnl = computed(() => realizedPnl('short'))
const longTotalPnl     = computed(() => long.value.pnl + longRealizedPnl.value)
const shortTotalPnl    = computed(() => short.value.pnl + shortRealizedPnl.value)
const longTotalInvest  = computed(() => long.value.invest + stockTrades.value.filter(t=>t.type==='long').reduce((s,t)=>s+t.avg_price*t.quantity,0))
const shortTotalInvest = computed(() => short.value.invest + stockTrades.value.filter(t=>t.type==='short').reduce((s,t)=>s+t.avg_price*t.quantity,0))
const longTotalRate    = computed(() => longTotalInvest.value ? longTotalPnl.value / longTotalInvest.value * 100 : 0)
const shortTotalRate   = computed(() => shortTotalInvest.value ? shortTotalPnl.value / shortTotalInvest.value * 100 : 0)

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
const SIM_INIT_CAPITAL = 10000000
const simOverallPnl  = computed(() => simTotalAsset.value - SIM_INIT_CAPITAL)
const simOverallRate = computed(() => simOverallPnl.value / SIM_INIT_CAPITAL * 100)

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
  const pnl = Math.round((price - h.avg_price) * qty)
  const { data: t } = await supabase.from('sim_trades').insert({ name: h.name, ticker: h.ticker, type:'sell', quantity: qty, price, total, avg_price: h.avg_price, pnl }).select().single()
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

// 커스텀 종목
const saveUserExercise = async (exercise, muscle_group) => {
  const exists = userExercises.value.some(e => e.exercise === exercise && e.muscle_group === muscle_group)
  if (exists) return
  const { data, error } = await supabase.from('user_exercises').insert({ exercise, muscle_group }).select().single()
  if (!error && data) userExercises.value.push(data)
}
const deleteUserExercise = async (id) => {
  const { error } = await supabase.from('user_exercises').delete().eq('id', id)
  if (!error) userExercises.value = userExercises.value.filter(e => e.id !== id)
}
// 즐겨찾기
const favorites = ref(JSON.parse(localStorage.getItem('workout_favorites') || '[]'))
const toggleFavorite = (exercise) => {
  if (!exercise || exercise === '__custom__') return
  const idx = favorites.value.indexOf(exercise)
  if (idx >= 0) favorites.value.splice(idx, 1)
  else favorites.value.push(exercise)
  localStorage.setItem('workout_favorites', JSON.stringify(favorites.value))
}
const isFavorite = (exercise) => favorites.value.includes(exercise)

const exerciseOptionsAll = (muscle_group) => {
  const preset = EXERCISE_DB[muscle_group] || []
  const custom = userExercises.value.filter(e => e.muscle_group === muscle_group).map(e => e.exercise)
  return [...new Set([...preset, ...custom])]
}
const exerciseFavsFor = (muscle_group) => {
  return exerciseOptionsAll(muscle_group).filter(ex => favorites.value.includes(ex))
}
const exerciseRecentFor = (muscle_group) => {
  const seen = new Set()
  const recent = []
  for (const w of workouts.value) {
    if (w.muscle_group === muscle_group && !seen.has(w.exercise)) {
      seen.add(w.exercise)
      recent.push(w.exercise)
      if (recent.length >= 5) break
    }
  }
  return recent
}
const exerciseRestFor = (muscle_group) => {
  const recentSet = new Set(exerciseRecentFor(muscle_group))
  return exerciseOptionsAll(muscle_group).filter(ex => !recentSet.has(ex))
}
const exerciseOptions = (muscle_group) => exerciseOptionsAll(muscle_group)

// 이전 기록 불러오기
const showPrevRecord = ref(false)
const lastWorkoutOf = (exerciseName) => {
  if (!exerciseName || exerciseName === '__custom__') return null
  return workouts.value.find(w => w.exercise === exerciseName) || null
}
const loadPrevRecord = (prev) => {
  if (!prev) return
  if (prev.set_logs?.length) {
    batchEntry.value.set_logs = JSON.parse(JSON.stringify(prev.set_logs))
  } else {
    batchEntry.value.set_logs = Array.from({ length: prev.sets }, () => ({ weight: prev.weight, reps: prev.reps, type: 'normal' }))
  }
  showPrevRecord.value = false
}

// ── 헬스 CRUD
const addBatchItem = () => {
  const exerciseName = batchEntry.value.exercise === '__custom__'
    ? batchEntry.value.customExercise.trim()
    : batchEntry.value.exercise.trim()
  if (!exerciseName || !batchEntry.value.set_logs.length) return
  if (batchEntry.value.exercise === '__custom__' && exerciseName) {
    saveUserExercise(exerciseName, batchEntry.value.muscle_group)
  }

  const logs    = batchEntry.value.set_logs
  const hasDropset = logs.some(s => s.type === 'dropset')
  const setType = hasDropset ? 'dropset' : (supersetMode.value ? 'superset' : 'normal')
  const bestSet = [...logs].sort((a,b) => (b.weight*b.reps)-(a.weight*a.reps))[0]

  if (supersetMode.value && !supersetGroupId.value) supersetGroupId.value = crypto.randomUUID()

  batchItems.value.push({
    muscle_group:    batchEntry.value.muscle_group,
    exercise:        exerciseName,
    sets:            logs.length,
    reps:            bestSet.reps,
    weight:          bestSet.weight,
    set_logs:        logs,
    set_type:        setType,
    superset_group:  supersetMode.value ? supersetGroupId.value : null
  })
  batchEntry.value = freshEntry()
}
const removeBatchItem = (i) => { batchItems.value.splice(i, 1) }
const saveBatchWorkout = async () => {
  if (!batchItems.value.length) return
  batchSaving.value = true
  const rows = batchItems.value.map((item, i) => ({ ...item, date: batchDate.value, memo: '', duration_min: batchDuration.value ? parseInt(batchDuration.value) : null, sort_order: i }))
  const { data, error } = await supabase.from('workouts').insert(rows).select()
  if (!error && data) {
    data.forEach(w => workouts.value.unshift(w))
    workouts.value.sort((a, b) => b.date.localeCompare(a.date))
    // 후기도 같이 저장
    if (batchMemo.value.trim()) {
      const { data: mData } = await supabase.from('workout_memos')
        .upsert({ date: batchDate.value, content: batchMemo.value.trim() }, { onConflict: 'date' })
        .select().single()
      if (mData) {
        const idx = workoutMemos.value.findIndex(m => m.date === mData.date)
        if (idx >= 0) workoutMemos.value[idx] = mData
        else workoutMemos.value.unshift(mData)
      }
    }
    batchItems.value = []
    batchMemo.value = ''
    batchDuration.value = null
    batchDate.value = new Date().toISOString().slice(0,10)
    supersetMode.value = false
    supersetGroupId.value = null
    showBatchWorkout.value = false
  }
  batchSaving.value = false
}

const addWorkout = async () => {
  const exerciseName = newWorkout.value.exercise === '__custom__'
    ? (newWorkout.value.customExercise || '').trim()
    : newWorkout.value.exercise.trim()
  if (!exerciseName) return
  if (newWorkout.value.exercise === '__custom__' && exerciseName) {
    saveUserExercise(exerciseName, newWorkout.value.muscle_group)
  }
  const { customExercise, ...payload } = newWorkout.value
  payload.exercise = exerciseName
  const { data, error } = await supabase.from('workouts').insert(payload).select().single()
  if (!error && data) {
    workouts.value.unshift(data)
    newWorkout.value = { date: new Date().toISOString().slice(0,10), exercise:'', muscle_group:'가슴', sets:3, reps:10, weight:0, memo:'', duration_min: null }
    showAddWorkout.value = false
  }
}
const deleteWorkout = async (id) => {
  if (!confirm('삭제하시겠습니까?')) return
  const { error } = await supabase.from('workouts').delete().eq('id', id)
  if (!error) workouts.value = workouts.value.filter(w => w.id !== id)
}

const showEditGroup   = ref(false)
const editGroupItems  = ref([])
const editGroupDuration = ref(null)
const orderSaved = ref(false)
const showEditWorkout = ref(false)
const editingWorkout  = ref(null)
const openEditGroup = (group) => {
  editGroupItems.value = [...group.items]
  editGroupDuration.value = group.items.find(w => w.duration_min)?.duration_min || null
  editOrderChanged.value = false
  showEditGroup.value = true
}
const editOrderChanged = ref(false)
const moveEditItem = (i, dir) => {
  const arr = editGroupItems.value
  const j = i + dir
  if (j < 0 || j >= arr.length) return
  const tmp = arr[i]; arr.splice(i, 1, arr[j]); arr.splice(j, 1, tmp)
  editOrderChanged.value = true
}

const saveEditGroup = async () => {
  const ids = editGroupItems.value.map(w => w.id)
  const val = editGroupDuration.value ? parseInt(editGroupDuration.value) : null
  const queries = [supabase.from('workouts').update({ duration_min: val }).in('id', ids)]
  if (editOrderChanged.value) {
    editGroupItems.value.forEach((w, i) => queries.push(supabase.from('workouts').update({ sort_order: i }).eq('id', w.id)))
  }
  const [durRes] = await Promise.all(queries)
  if (!durRes.error) {
    ids.forEach(id => {
      const w = workouts.value.find(w => w.id === id)
      if (w) w.duration_min = val
    })
    if (editOrderChanged.value) {
      editGroupItems.value.forEach((w, i) => {
        const wo = workouts.value.find(x => x.id === w.id)
        if (wo) wo.sort_order = i
      })
    }
    showEditGroup.value = false
  }
}
const openEditWorkout = (w) => {
  editingWorkout.value = {
    id: w.id,
    date: w.date,
    muscle_group: w.muscle_group,
    exercise: w.exercise || '',
    sets: w.sets,
    reps: w.reps,
    weight: w.weight,
    memo: w.memo || '',
    duration_min: w.duration_min || null,
    set_type: w.set_type || 'normal',
    set_logs: w.set_logs?.length ? JSON.parse(JSON.stringify(w.set_logs)) : null,
  }
  showEditGroup.value = false
  showEditWorkout.value = true
}
const editAddSetLog = () => {
  if (!editingWorkout.value.set_logs) return
  const last = editingWorkout.value.set_logs.at(-1)
  editingWorkout.value.set_logs.push({ weight: last?.weight ?? 0, reps: last?.reps ?? 10, type: 'normal' })
}
const editRemoveSetLog = (i) => {
  if (!editingWorkout.value.set_logs || editingWorkout.value.set_logs.length <= 1) return
  editingWorkout.value.set_logs.splice(i, 1)
}
const editToggleSetLogType = (i, type) => {
  const s = editingWorkout.value.set_logs[i]
  s.type = s.type === type ? 'normal' : type
}
const saveEditWorkout = async () => {
  if (!editingWorkout.value) return
  const { id, ...payload } = editingWorkout.value
  if (payload.set_logs?.length) {
    payload.sets = payload.set_logs.length
    const best = payload.set_logs.reduce((b, s) => (s.weight ?? 0) > (b.weight ?? 0) ? s : b, payload.set_logs[0])
    payload.reps = best.reps
    payload.weight = best.weight
  }
  const { data, error } = await supabase.from('workouts').update(payload).eq('id', id).select().single()
  if (!error && data) {
    const idx = workouts.value.findIndex(w => w.id === id)
    if (idx >= 0) workouts.value.splice(idx, 1, data)
    showEditWorkout.value = false
    editingWorkout.value = null
  }
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

const saveMemo = async () => {
  if (!memoContent.value.trim()) return
  memoSaving.value = true
  const { data, error } = await supabase.from('workout_memos')
    .upsert({ date: memoDate.value, content: memoContent.value.trim() }, { onConflict: 'date' })
    .select().single()
  if (!error && data) {
    const idx = workoutMemos.value.findIndex(m => m.date === data.date)
    if (idx >= 0) workoutMemos.value[idx] = data
    else workoutMemos.value.unshift(data)
    memoContent.value = ''
  }
  memoSaving.value = false
}
const deleteMemo = async (id) => {
  const { error } = await supabase.from('workout_memos').delete().eq('id', id)
  if (!error) workoutMemos.value = workoutMemos.value.filter(m => m.id !== id)
}
const loadMemoForDate = (date) => {
  const existing = workoutMemos.value.find(m => m.date === date)
  memoDate.value = date
  memoContent.value = existing?.content || ''
}

// ── 헬스 분석
const selectedExercise = ref('')
const reportTab        = ref('weekly')
const reportComment    = ref('')
const commentLoading   = ref(false)

// 프로필
const profile = ref({ height:'', age:'', gender:'남', goal:'' })
const saveProfile = async () => {
  await supabase.from('user_profile').upsert({ id:1, ...profile.value })
}

// 데이터 복사
const copyWorkoutData = () => {
  const p = profile.value
  const latestWeight = weightLogs.value.at(-1)?.weight
  const headerLines = ['=== 헬스 데이터 ===\n']
  if (p.height || p.age || p.gender) {
    headerLines.push('[프로필]')
    if (p.gender) headerLines.push(`성별: ${p.gender}`)
    if (p.age)    headerLines.push(`나이: ${p.age}세`)
    if (p.height) headerLines.push(`키: ${p.height}cm`)
    if (latestWeight) headerLines.push(`현재 체중: ${latestWeight}kg`)
    if (p.height && latestWeight) {
      const bmi = (latestWeight / ((p.height/100)**2)).toFixed(1)
      headerLines.push(`BMI: ${bmi}`)
    }
    if (p.goal)   headerLines.push(`목표: ${p.goal}`)
    headerLines.push('')
  }

  const byDate = {}
  workouts.value.forEach(w => {
    if (!byDate[w.date]) byDate[w.date] = []
    byDate[w.date].push(w)
  })
  const lines = [...headerLines, '=== 운동 기록 ===\n']
  Object.keys(byDate).sort().reverse().forEach(date => {
    lines.push(`[${date}]`)
    byDate[date].forEach(w => {
      lines.push(`• ${w.exercise} (${w.muscle_group})`)
      if (w.set_logs?.length) {
        w.set_logs.forEach((s, i) => {
          const tag = s.type === 'failure' ? ' (실패)' : s.type === 'dropset' ? ' (드롭)' : ''
          lines.push(`  Set ${i+1}: ${s.weight}kg × ${s.reps}회${tag}`)
        })
      } else {
        lines.push(`  ${w.sets}세트 × ${w.reps}회 / ${w.weight}kg`)
      }
    })
    lines.push('')
  })
  if (weightLogs.value.length) {
    lines.push('[체중 기록]')
    weightLogs.value.slice(-20).forEach(w => lines.push(`${w.date}: ${w.weight}kg`))
    lines.push('')
  }
  if (workoutMemos.value.length) {
    lines.push('[운동 일지]')
    workoutMemos.value.slice(-20).forEach(m => {
      lines.push(`${m.date}: ${m.content}`)
    })
    lines.push('')
  }
  lines.push('[집계]')
  lines.push(`총 운동 일수: ${new Set(workouts.value.map(w=>w.date)).size}일`)
  lines.push(`총 볼륨: ${workouts.value.reduce((s,w)=>s+calcVolume(w),0).toLocaleString('ko-KR')}kg`)
  MUSCLE_GROUPS.forEach(g => {
    const cnt = workouts.value.filter(w=>w.muscle_group===g).length
    if (cnt) lines.push(`${g}: ${cnt}회`)
  })
  navigator.clipboard.writeText(lines.join('\n'))
  alert('클립보드에 복사됐어요! Claude.ai에 붙여넣기 하세요.')
}

// 종목별 개인 최고 기록 (부위별 그룹)
const allTimePRs = computed(() => {
  const map = {}
  workouts.value.forEach(w => {
    if (!w.exercise) return
    const actualWeight = w.set_logs?.length
      ? Math.max(...w.set_logs.map(s => s.weight || 0))
      : (w.weight || 0)
    const oneRM = calcOneRM(w)
    if (!map[w.exercise]) map[w.exercise] = { exercise: w.exercise, muscle_group: w.muscle_group, bestWeight: 0, bestOneRM: 0 }
    if (actualWeight > map[w.exercise].bestWeight) map[w.exercise].bestWeight = actualWeight
    if (oneRM > map[w.exercise].bestOneRM) map[w.exercise].bestOneRM = oneRM
  })
  const byGroup = {}
  Object.values(map).forEach(p => {
    if (!byGroup[p.muscle_group]) byGroup[p.muscle_group] = []
    byGroup[p.muscle_group].push(p)
  })
  return MUSCLE_GROUPS.filter(g => byGroup[g]).map(g => ({ group: g, items: byGroup[g].sort((a,b) => b.bestOneRM - a.bestOneRM) }))
})

// 부위별 주간 볼륨 차트 (최근 6주)
const weeklyMuscleChart = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const chartStart = new Date(year === 2026 ? `${year}-06-01` : `${year}-01-01`)
  const weeks = []
  let cursor = new Date(chartStart)
  while (cursor <= now) {
    const weekStart = new Date(cursor)
    const weekEnd = new Date(cursor.getTime() + 7*86400000)
    const endLabel = new Date(weekEnd.getTime() - 86400000)
    const label = `${weekStart.getMonth()+1}/${weekStart.getDate()}~${endLabel.getMonth()+1}/${endLabel.getDate()}`
    const weekData = {}
    MUSCLE_GROUPS.forEach(g => weekData[g] = 0)
    workouts.value
      .filter(w => { const d = new Date(w.date); return d >= weekStart && d < weekEnd })
      .forEach(w => { if (weekData[w.muscle_group] !== undefined) weekData[w.muscle_group] += calcVolume(w) || 1 })
    weeks.push({ label, data: weekData })
    cursor = weekEnd
  }
  const maxVal = Math.max(...weeks.flatMap(w => Object.values(w.data)), 1)
  return { weeks: weeks.slice(-8), maxVal }
})

const MUSCLE_COLORS = {
  '가슴':'#6c47ff','등':'#22c55e','어깨':'#f59e0b','하체':'#ef4444',
  '삼두':'#3b82f6','이두':'#8b5cf6','코어':'#ec4899','유산소':'#14b8a6'
}

const calcVolume = (w) => {
  if (w.set_logs?.length) return w.set_logs.reduce((s, l) => s + (l.weight||0) * (l.reps||0), 0)
  return (w.sets||0) * (w.reps||0) * (w.weight||0)
}
const calcOneRM = (w) => {
  if (w.set_logs?.length) return Math.max(0, ...w.set_logs.map(l =>
    l.weight > 0 && l.reps > 0 ? Math.round(l.weight * (1 + l.reps / 30)) : 0))
  return w.weight > 0 && w.reps > 0 ? Math.round(w.weight * (1 + w.reps / 30)) : 0
}

const weeklyReport = computed(() => {
  const now = new Date()
  const dow = now.getDay()
  const thisMonday = new Date(now)
  thisMonday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  thisMonday.setHours(0,0,0,0)
  const lastMonday = new Date(thisMonday); lastMonday.setDate(thisMonday.getDate() - 7)

  const thisWeek = workouts.value.filter(w => new Date(w.date) >= thisMonday)
  const lastWeek = workouts.value.filter(w => { const d = new Date(w.date); return d >= lastMonday && d < thisMonday })

  const thisVolume = thisWeek.reduce((s, w) => s + calcVolume(w), 0)
  const lastVolume = lastWeek.reduce((s, w) => s + calcVolume(w), 0)
  const thisDays = new Set(thisWeek.map(w => w.date)).size
  const lastDays = new Set(lastWeek.map(w => w.date)).size

  const groups = {}; MUSCLE_GROUPS.forEach(g => groups[g] = 0)
  thisWeek.forEach(w => { if (groups[w.muscle_group] !== undefined) groups[w.muscle_group]++ })
  const topGroup = Object.entries(groups).sort((a,b) => b[1]-a[1])[0]
  const missingGroups = Object.entries(groups).filter(([,c]) => c === 0).map(([g]) => g)

  const prs = []
  const seen = new Set()
  thisWeek.forEach(w => {
    if (seen.has(w.exercise) || !calcOneRM(w)) return
    const prevMax = Math.max(0, ...workouts.value
      .filter(x => x.exercise === w.exercise && new Date(x.date) < thisMonday)
      .map(calcOneRM))
    if (calcOneRM(w) > prevMax) { prs.push({ exercise: w.exercise, oneRM: calcOneRM(w) }); seen.add(w.exercise) }
  })

  const wWeights = weightLogs.value.filter(w => new Date(w.date) >= thisMonday)
  const lwWeights = weightLogs.value.filter(w => { const d = new Date(w.date); return d >= lastMonday && d < thisMonday })
  const startW = lwWeights.length ? lwWeights[lwWeights.length-1].weight : wWeights[0]?.weight ?? null
  const endW   = wWeights.length  ? wWeights[wWeights.length-1].weight  : null

  const thisSunday = new Date(thisMonday); thisSunday.setDate(thisMonday.getDate() + 6)
  const label = `${thisMonday.getMonth()+1}/${thisMonday.getDate()} ~ ${thisSunday.getMonth()+1}/${thisSunday.getDate()}`
  return { label, thisDays, lastDays, thisVolume, lastVolume, topGroup: topGroup?.[0], topGroupCnt: topGroup?.[1]||0, missingGroups, prs, startW, endW }
})

const monthlyReport = computed(() => {
  const now = new Date()
  const yr = now.getFullYear(), mo = now.getMonth()
  const lyr = mo === 0 ? yr-1 : yr, lmo = mo === 0 ? 11 : mo-1

  const thisM = workouts.value.filter(w => { const d = new Date(w.date); return d.getFullYear()===yr && d.getMonth()===mo })
  const lastM = workouts.value.filter(w => { const d = new Date(w.date); return d.getFullYear()===lyr && d.getMonth()===lmo })

  const thisVolume = thisM.reduce((s,w) => s+calcVolume(w), 0)
  const lastVolume = lastM.reduce((s,w) => s+calcVolume(w), 0)
  const thisDays   = new Set(thisM.map(w => w.date)).size
  const daysInMonth = new Date(yr, mo+1, 0).getDate()

  const exCount = {}
  thisM.forEach(w => { exCount[w.exercise] = (exCount[w.exercise]||0)+1 })
  const topEx = Object.entries(exCount).sort((a,b)=>b[1]-a[1])[0]

  const exRM = {}
  thisM.forEach(w => {
    if (!exRM[w.exercise]) exRM[w.exercise] = []
    exRM[w.exercise].push(calcOneRM(w))
  })
  const mostImproved = Object.entries(exRM)
    .map(([ex, rms]) => ({ ex, gain: rms[rms.length-1] - rms[0] }))
    .filter(x => x.gain > 0).sort((a,b) => b.gain-a.gain)[0]

  const mWeights = weightLogs.value.filter(w => { const d = new Date(w.date); return d.getFullYear()===yr && d.getMonth()===mo })
  return { month: mo+1, thisDays, daysInMonth, thisVolume, lastVolume, topEx: topEx?.[0], topExCnt: topEx?.[1]||0, mostImproved, startW: mWeights[0]?.weight??null, endW: mWeights[mWeights.length-1]?.weight??null }
})

// ── 보고서 생성 (Claude API 연결 전 placeholder)
const buildReportPayload = (type) => {
  const now = new Date()
  const dow = now.getDay()
  const thisMonday = new Date(now); thisMonday.setDate(now.getDate() - (dow===0?6:dow-1)); thisMonday.setHours(0,0,0,0)
  const mo = now.getMonth(), yr = now.getFullYear()

  let periodStart, periodEnd, periodLabel, targetWorkouts, targetWeights

  if (type === 'weekly') {
    periodStart = thisMonday.toISOString().slice(0,10)
    periodEnd   = now.toISOString().slice(0,10)
    periodLabel = `${now.getFullYear()}년 ${thisMonday.getMonth()+1}월 ${thisMonday.getDate()}일 주`
    targetWorkouts = workouts.value.filter(w => w.date >= periodStart)
    targetWeights  = weightLogs.value.filter(w => w.date >= periodStart)
    // 직전 8주 데이터도 함께
    const eightWeeksAgo = new Date(thisMonday); eightWeeksAgo.setDate(thisMonday.getDate()-56)
    var prevWorkouts = workouts.value.filter(w => w.date >= eightWeeksAgo.toISOString().slice(0,10) && w.date < periodStart)
    var prevWeights  = weightLogs.value.filter(w => w.date >= eightWeeksAgo.toISOString().slice(0,10) && w.date < periodStart)
  } else {
    periodStart = `${yr}-${String(mo+1).padStart(2,'0')}-01`
    periodEnd   = now.toISOString().slice(0,10)
    periodLabel = `${yr}년 ${mo+1}월`
    targetWorkouts = workouts.value.filter(w => w.date >= periodStart)
    targetWeights  = weightLogs.value.filter(w => w.date >= periodStart)
    const threeMonthsAgo = new Date(yr, mo-3, 1)
    var prevWorkouts = workouts.value.filter(w => { const d = new Date(w.date); return d >= threeMonthsAgo && w.date < periodStart })
    var prevWeights  = weightLogs.value.filter(w => { const d = new Date(w.date); return d >= threeMonthsAgo && w.date < periodStart })
  }

  return { type, periodStart, periodEnd, periodLabel, targetWorkouts, targetWeights, prevWorkouts, prevWeights }
}

const generateReport = async (type) => {
  reportGenerating.value = true
  const payload = buildReportPayload(type)

  // TODO: Claude API 연결 후 아래 내용 교체
  // const response = await fetch(CLAUDE_EDGE_URL, { method:'POST', ... body: JSON.stringify(payload) })
  // const { content } = await response.json()

  // 현재는 placeholder 저장
  const placeholder = `[${payload.periodLabel} 보고서]\n\nClaude API 연결 후 자동 생성됩니다.\n\n이번 기간 운동 기록: ${payload.targetWorkouts.length}건\n체중 기록: ${payload.targetWeights.length}건`

  const { data, error } = await supabase.from('reports').insert({
    type: payload.type,
    period_label: payload.periodLabel,
    period_start: payload.periodStart,
    content: placeholder
  }).select().single()

  if (!error && data) {
    reports.value.unshift(data)
    selectedReport.value = data
  }
  reportGenerating.value = false
}

const muscleBalance = computed(() => {
  const map = {}
  MUSCLE_GROUPS.forEach(g => map[g] = 0)
  workouts.value.forEach(w => { if (map[w.muscle_group] !== undefined) map[w.muscle_group]++ })
  return map
})
const recentWeights = computed(() => weightLogs.value.slice(-12))
const totalWorkoutDays = computed(() => new Set(workouts.value.map(w => w.date)).size)
const thisMonthWorkoutDays = computed(() => {
  const month = new Date().toISOString().slice(0, 7)
  return new Set(workouts.value.filter(w => w.date.startsWith(month)).map(w => w.date)).size
})
const thisWeekWorkoutDays = computed(() => {
  const now = new Date()
  const dow = now.getDay()
  const mon = new Date(now); mon.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  const monStr = mon.toISOString().slice(0, 10)
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
  const sunStr = sun.toISOString().slice(0, 10)
  return new Set(workouts.value.filter(w => w.date >= monStr && w.date <= sunStr).map(w => w.date)).size
})
const restDaysThisYear = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const start = year === 2026 ? `${year}-06-01` : `${year}-01-01`
  const today = now.toISOString().slice(0, 10)
  const totalDays = Math.floor((new Date(today) - new Date(start)) / 86400000) + 1
  const worked = new Set(workouts.value.filter(w => w.date >= start && w.date <= today).map(w => w.date)).size
  return Math.max(0, totalDays - worked)
})
const weightPlateau = computed(() => {
  if (weightLogs.value.length < 4) return false
  const last4 = weightLogs.value.slice(-4).map(w => w.weight)
  const diff = Math.max(...last4) - Math.min(...last4)
  return diff < 2.0
})
const strengthByExercise = computed(() => {
  const map = {}
  ;[...workouts.value].reverse().forEach(w => {
    if (!map[w.exercise]) map[w.exercise] = []
    map[w.exercise].push({ date: w.date, weight: w.weight })
  })
  return map
})
const workoutDateMap = computed(() => {
  const map = {}
  workouts.value.forEach(w => {
    if (!map[w.date]) map[w.date] = []
    map[w.date].push(w)
  })
  Object.values(map).forEach(arr => arr.sort((a, b) => {
    const od = (a.sort_order ?? 999) - (b.sort_order ?? 999)
    if (od !== 0) return od
    return new Date(a.created_at) - new Date(b.created_at)
  }))
  return map
})

// 달력
const calendarMonth = ref(new Date().toISOString().slice(0, 7))
const selectedCalendarDate = ref(null)
const calendarLabel = computed(() => {
  const [y, m] = calendarMonth.value.split('-')
  return `${y}년 ${parseInt(m)}월`
})
const calendarDays = computed(() => {
  const [y, m] = calendarMonth.value.split('-').map(Number)
  const firstDow = new Date(y, m - 1, 1).getDay()
  const daysInMonth = new Date(y, m, 0).getDate()
  const days = []
  for (let i = 0; i < firstDow; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${calendarMonth.value}-${String(d).padStart(2, '0')}`
    days.push({ day: d, date, hasWorkout: !!workoutDateMap.value[date] })
  }
  return days
})
const prevMonth = () => {
  const [y, m] = calendarMonth.value.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  calendarMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  selectedCalendarDate.value = null
}
const nextMonth = () => {
  const [y, m] = calendarMonth.value.split('-').map(Number)
  const d = new Date(y, m, 1)
  calendarMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  selectedCalendarDate.value = null
}
const selectCalendarDate = (cell) => {
  if (!cell?.hasWorkout) return
  selectedCalendarDate.value = selectedCalendarDate.value === cell.date ? null : cell.date
}
const selectedDateGroup = computed(() => {
  if (!selectedCalendarDate.value) return null
  const items = workoutDateMap.value[selectedCalendarDate.value]
  return items ? { date: selectedCalendarDate.value, items } : null
})

// 날짜 변경
const calDateChangeIds = ref([])
const calDateChangeTarget = ref('')
const toggleCalDateSelect = (id) => {
  const idx = calDateChangeIds.value.indexOf(id)
  if (idx >= 0) calDateChangeIds.value.splice(idx, 1)
  else calDateChangeIds.value.push(id)
}
const changeWorkoutDate = async () => {
  if (!calDateChangeIds.value.length || !calDateChangeTarget.value) return
  if (!confirm(`${calDateChangeTarget.value}로 날짜를 변경하시겠습니까?`)) return
  const ids = [...calDateChangeIds.value]
  const newDate = calDateChangeTarget.value
  const { error } = await supabase.from('workouts').update({ date: newDate }).in('id', ids)
  if (!error) {
    ids.forEach(id => {
      const w = workouts.value.find(x => x.id === id)
      if (w) w.date = newDate
    })
    calDateChangeIds.value = []
    calDateChangeTarget.value = ''
    selectedCalendarDate.value = null
  }
}

// PR 그룹 아코디언
const expandedPRGroups = ref([])
const togglePRGroup = (group) => {
  const idx = expandedPRGroups.value.indexOf(group)
  if (idx >= 0) expandedPRGroups.value.splice(idx, 1)
  else expandedPRGroups.value.push(group)
}
const isPRGroupExpanded = (group) => expandedPRGroups.value.includes(group)

// PR 내 무게 추이
const selectedPRExercise = ref(null)
const togglePRExercise = (ex) => { selectedPRExercise.value = selectedPRExercise.value === ex ? null : ex }
const prExerciseChart = computed(() => {
  if (!selectedPRExercise.value) return []
  return (strengthByExercise.value[selectedPRExercise.value] || []).slice(-10)
})

// 주간 데이터 복사
const showCopyPicker = ref(false)
const availableCopyWeeks = computed(() => {
  const now = new Date()
  const dow = now.getDay()
  const thisMonday = new Date(now)
  thisMonday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  thisMonday.setHours(0,0,0,0)
  const weeks = []
  for (let i = 0; i < 8; i++) {
    const monday = new Date(thisMonday); monday.setDate(thisMonday.getDate() - i * 7)
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6)
    const startStr = monday.toISOString().slice(0,10)
    const endStr = sunday.toISOString().slice(0,10)
    const hasData = workouts.value.some(w => w.date >= startStr && w.date <= endStr)
    if (hasData) weeks.push({ label: `${monday.getMonth()+1}/${monday.getDate()}(월) ~ ${sunday.getMonth()+1}/${sunday.getDate()}(일)`, startStr, endStr })
  }
  return weeks
})
const copyWeekData = (startStr, endStr) => {
  showCopyPicker.value = false
  const p = profile.value
  const latestWeight = weightLogs.value.at(-1)?.weight
  const lines = ['=== 헬스 데이터 ===\n']
  if (p.height || p.age) {
    lines.push('[프로필]')
    if (p.gender) lines.push(`성별: ${p.gender}`)
    if (p.age)    lines.push(`나이: ${p.age}세`)
    if (p.height) lines.push(`키: ${p.height}cm`)
    if (latestWeight) lines.push(`현재 체중: ${latestWeight}kg`)
    if (p.height && latestWeight) lines.push(`BMI: ${(latestWeight/((p.height/100)**2)).toFixed(1)}`)
    if (p.goal)   lines.push(`목표: ${p.goal}`)
    lines.push('')
  }
  const weekWorkouts = workouts.value.filter(w => w.date >= startStr && w.date <= endStr)
  lines.push(`=== 운동 기록 (${startStr} ~ ${endStr}) ===\n`)
  const byDate = {}
  weekWorkouts.forEach(w => { if (!byDate[w.date]) byDate[w.date] = []; byDate[w.date].push(w) })
  Object.keys(byDate).sort().reverse().forEach(date => {
    lines.push(`[${date}]`)
    byDate[date].forEach(w => {
      lines.push(`• ${w.exercise} (${w.muscle_group})`)
      if (w.set_logs?.length) {
        w.set_logs.forEach((s,i) => {
          const tag = s.type==='failure' ? ' (실패)' : s.type==='dropset' ? ' (드롭)' : ''
          lines.push(`  Set ${i+1}: ${s.weight}kg × ${s.reps}회${tag}`)
        })
      } else {
        lines.push(`  ${w.sets}세트 × ${w.reps}회 / ${w.weight}kg`)
      }
    })
    lines.push('')
  })
  const weekWeights = weightLogs.value.filter(w => w.date >= startStr && w.date <= endStr)
  if (weekWeights.length) {
    lines.push('[체중 기록]')
    weekWeights.forEach(w => lines.push(`${w.date}: ${w.weight}kg`))
    lines.push('')
  }
  const weekMemos = workoutMemos.value.filter(m => m.date >= startStr && m.date <= endStr)
  if (weekMemos.length) {
    lines.push('[운동 일지]')
    weekMemos.forEach(m => lines.push(`${m.date}: ${m.content}`))
    lines.push('')
  }
  lines.push('[집계]')
  lines.push(`운동 일수: ${new Set(weekWorkouts.map(w=>w.date)).size}일`)
  lines.push(`총 볼륨: ${weekWorkouts.reduce((s,w)=>s+calcVolume(w),0).toLocaleString('ko-KR')}kg`)
  MUSCLE_GROUPS.forEach(g => { const cnt = weekWorkouts.filter(w=>w.muscle_group===g).length; if(cnt) lines.push(`${g}: ${cnt}회`) })
  navigator.clipboard.writeText(lines.join('\n'))
  alert('클립보드에 복사됐어요! Claude.ai에 붙여넣기 하세요.')
}

const weeklyVolume = computed(() => {
  const weeks = []
  for (let i = 7; i >= 0; i--) {
    const start = new Date(Date.now() - (i + 1) * 7 * 86400000)
    const end   = new Date(Date.now() - i * 7 * 86400000)
    const label = `${start.getMonth()+1}/${start.getDate()}`
    const cnt = workouts.value.filter(w => { const d = new Date(w.date); return d >= start && d < end }).length
    weeks.push({ label, cnt })
  }
  return weeks
})
const exerciseProgress = computed(() => {
  if (!selectedExercise.value) return []
  const entries = (strengthByExercise.value[selectedExercise.value] || []).slice(-10)
  return entries
})
const muscleImbalance = computed(() => {
  const vals = Object.values(muscleBalance.value)
  const maxVal = Math.max(...vals, 0)
  if (maxVal === 0) return []
  return Object.entries(muscleBalance.value)
    .filter(([, cnt]) => cnt / maxVal < 0.3)
    .map(([g]) => g)
})
const allExercises = computed(() => Object.keys(strengthByExercise.value).sort())

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

              <div class="summary-grid mt16">
                <div class="summary-card sim-card" @click="tab='sim'" style="cursor:pointer">
                  <div class="sc-label">🎮 모의투자</div>
                  <div class="sc-value sm">{{ fmt(Math.round(simTotalAsset)) }}원</div>
                  <div class="sc-sub">
                    <span>보유 {{ simHoldings.length }}종목</span>
                    <span class="sc-rate" :class="simOverallRate>=0?'profit':'loss'">{{ fmtRate(simOverallRate) }}</span>
                  </div>
                  <div class="sc-pnl" :class="simOverallPnl>=0?'profit':'loss'">{{ simOverallPnl>=0?'+':'' }}{{ fmt(Math.round(simOverallPnl)) }}원</div>
                </div>
              </div>

              <div class="card mt16" @click="tab='sim'" style="cursor:pointer">
                <div class="report-header">
                  <div class="card-title" style="margin:0">🎮 모의투자</div>
                  <div style="display:flex;gap:12px;align-items:center">
                    <span style="font-size:13px;color:#6b7280">총 {{ fmt(Math.round(simTotalAsset)) }}원</span>
                    <span style="font-size:13px;font-weight:700" :class="simOverallRate>=0?'profit':'loss'">{{ fmtRate(simOverallRate) }}</span>
                  </div>
                </div>
                <div class="table-wrap" v-if="simHoldings.length">
                  <table class="stock-table">
                    <thead><tr><th>종목명</th><th>수량</th><th>평단</th><th>현재가</th><th>손익</th><th>수익률</th></tr></thead>
                    <tbody>
                      <tr v-for="h in simHoldings" :key="h.id">
                        <td><div class="name-text">{{ h.name }}</div><div v-if="h.ticker" class="ticker-text">{{ h.ticker }}</div></td>
                        <td>{{ fmt(h.quantity) }}주</td>
                        <td>{{ fmt(h.avg_price) }}원</td>
                        <td>{{ fmt(simCurrentPrice(h)) }}원</td>
                        <td :class="simHoldingPnl(h)>=0?'profit':'loss'">{{ simHoldingPnl(h)>=0?'+':'' }}{{ fmt(Math.round(simHoldingPnl(h))) }}원</td>
                        <td :class="simHoldingRate(h)>=0?'profit':'loss'">{{ fmtRate(simHoldingRate(h)) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="empty-td">보유 종목이 없어요</div>
              </div>
            </template>

            <!-- ── 장기 / 단기 ── -->
            <template v-if="tab==='long' || tab==='short'">
              <div class="invest-header">
                <div class="summary-card" :class="tab==='long'?'long-card':'short-card'" style="flex:1">
                  <div class="sc-label">{{ tab==='long'?'📈 장기투자':'⚡ 단기투자' }} 요약</div>
                  <div class="sc-value">{{ fmt(Math.round(tab==='long'?long.value:short.value)) }}원</div>
                  <div class="sc-sub">
                    <span>미실현 투자금 {{ fmt(Math.round(tab==='long'?long.invest:short.invest)) }}원</span>
                    <span class="sc-rate" :class="isProfit(tab==='long'?long.rate:short.rate)?'profit':'loss'">{{ fmtRate(tab==='long'?long.rate:short.rate) }}</span>
                  </div>
                  <div class="sc-pnl" :class="isProfit(tab==='long'?long.pnl:short.pnl)?'profit':'loss'">
                    미실현 {{ isProfit(tab==='long'?long.pnl:short.pnl)?'+':'' }}{{ fmt(Math.round(tab==='long'?long.pnl:short.pnl)) }}원
                  </div>
                  <div class="sc-sub" style="margin-top:4px;border-top:1px solid #e5e7eb;padding-top:4px">
                    <span style="color:#6b7280;font-size:12px">누적 (실현+미실현)</span>
                    <span :class="isProfit(tab==='long'?longTotalPnl:shortTotalPnl)?'profit':'loss'" style="font-weight:700">
                      {{ isProfit(tab==='long'?longTotalPnl:shortTotalPnl)?'+':'' }}{{ fmt(Math.round(tab==='long'?longTotalPnl:shortTotalPnl)) }}원
                      ({{ fmtRate(tab==='long'?longTotalRate:shortTotalRate) }})
                    </span>
                  </div>
                </div>
                <div class="sim-actions">
                  <button class="btn-cancel" style="font-size:13px" @click="resetStocks(tab)">초기화</button>
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
                        <td><div class="td-actions"><button @click="openStockSell(s)" class="btn-sm">매도</button><button @click="editStock={...s}" class="btn-sm">수정</button><button @click="deleteStock(s.id)" class="btn-sm del">삭제</button></div></td>
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
                    <div class="ms-actions"><button @click="openStockSell(s)" class="btn-sm">매도</button><button @click="editStock={...s}" class="btn-sm">수정</button><button @click="deleteStock(s.id)" class="btn-sm del">삭제</button></div>
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
                  <div class="sc-sub" style="margin-top:4px;border-top:1px solid #e5e7eb;padding-top:4px">
                    <span style="color:#6b7280;font-size:12px">초기자본 1,000만원 기준 누적</span>
                    <span :class="simOverallPnl>=0?'profit':'loss'" style="font-weight:700">
                      {{ simOverallPnl>=0?'+':'' }}{{ fmt(Math.round(simOverallPnl)) }}원 ({{ simOverallRate>=0?'+':'' }}{{ simOverallRate.toFixed(2) }}%)
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
                    <thead><tr><th>일시</th><th>종목</th><th>구분</th><th>수량</th><th>가격</th><th>금액</th><th>손익</th></tr></thead>
                    <tbody>
                      <tr v-for="t in simTrades" :key="t.id">
                        <td style="font-size:12px;color:#9ca3af">{{ new Date(t.traded_at).toLocaleDateString('ko-KR') }}</td>
                        <td><div class="name-text">{{ t.name }}</div></td>
                        <td><span class="type-badge" :class="t.type==='buy'?'long':'short'">{{ t.type==='buy'?'매수':'매도' }}</span></td>
                        <td>{{ fmt(t.quantity) }}주</td>
                        <td>{{ fmt(t.price) }}원</td>
                        <td :class="t.type==='buy'?'loss':'profit'">{{ t.type==='buy'?'-':'+' }}{{ fmt(t.total) }}원</td>
                        <td v-if="t.type==='sell' && t.pnl != null" :class="t.pnl>=0?'profit':'loss'">{{ t.pnl>=0?'+':'' }}{{ fmt(t.pnl) }}원</td>
                        <td v-else style="color:#d1d5db">—</td>
                      </tr>
                      <tr v-if="simTrades.length===0"><td colspan="7" class="empty-td">거래 내역이 없어요</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="card mt16">
                <div class="report-header">
                  <div class="card-title" style="margin:0">자동매매 조건</div>
                  <button class="btn-add-top" @click="showCondForm=true">+ 조건 추가</button>
                </div>
                <div class="table-wrap">
                  <table class="stock-table">
                    <thead><tr><th>종목</th><th>구분</th><th>목표가</th><th>수량</th><th>상태</th><th></th></tr></thead>
                    <tbody>
                      <tr v-for="c in tradeConditions" :key="c.id">
                        <td><div class="name-text">{{ c.name }}</div><div class="ticker-text">{{ c.ticker }}</div></td>
                        <td><span class="type-badge" :class="c.condition_type==='buy'?'long':'short'">{{ c.condition_type==='buy'?'매수':'매도' }}</span></td>
                        <td>{{ fmt(c.target_price) }}원</td>
                        <td>{{ fmt(c.quantity) }}주</td>
                        <td>
                          <span @click="toggleCondition(c)" style="cursor:pointer;font-size:12px;font-weight:600"
                            :style="c.active?'color:#059669':'color:#9ca3af'">
                            {{ c.active ? '활성' : '비활성' }}
                          </span>
                        </td>
                        <td><button class="btn-sm del" @click="deleteCondition(c)">삭제</button></td>
                      </tr>
                      <tr v-if="!tradeConditions.length"><td colspan="6" class="empty-td">등록된 조건이 없어요</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>

            <!-- 헬스 탭 -->
            <template v-if="tab==='health'">

              <!-- 프로필 카드 -->
              <div class="card">
                <div class="report-header">
                  <div class="card-title" style="margin:0">내 프로필</div>
                  <button @click="showCopyPicker=true" class="btn-copy-data">📋 데이터 복사</button>
                </div>
                <div class="profile-grid">
                  <div class="form-group">
                    <label>성별</label>
                    <select v-model="profile.gender" class="input-field" @change="saveProfile">
                      <option>남</option><option>여</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>나이</label>
                    <input v-model="profile.age" type="number" class="input-field" placeholder="25" @change="saveProfile" />
                  </div>
                  <div class="form-group">
                    <label>키 (cm)</label>
                    <input v-model="profile.height" type="number" class="input-field" placeholder="175" @change="saveProfile" />
                  </div>
                  <div class="form-group">
                    <label>현재 체중</label>
                    <div class="input-field" style="background:#f0f0fa;color:#888">
                      {{ weightLogs.length ? weightLogs[weightLogs.length-1].weight + 'kg' : '-' }}
                    </div>
                  </div>
                </div>
                <div class="form-group" style="margin-top:8px">
                  <label>목표</label>
                  <input v-model="profile.goal" class="input-field" placeholder="예: 체지방 감량, 근육 증가, 벤치프레스 100kg" @change="saveProfile" />
                </div>
              </div>

              <!-- 보고서 -->
              <div class="card mt16">
                <div class="report-header">
                  <div class="card-title" style="margin:0">보고서</div>
                  <div class="report-tabs">
                    <button :class="['rtab', reportTab==='weekly'&&'rtab-on']" @click="reportTab='weekly';selectedReport=null">주간</button>
                    <button :class="['rtab', reportTab==='monthly'&&'rtab-on']" @click="reportTab='monthly';selectedReport=null">월간</button>
                  </div>
                </div>

                <!-- 보고서 뷰어 -->
                <template v-if="selectedReport">
                  <div class="report-viewer-header">
                    <button @click="selectedReport=null;editingReport=false" class="btn-back-report">← 목록</button>
                    <span class="rv-label">{{ selectedReport.period_label }}</span>
                    <div style="display:flex;gap:6px">
                      <button v-if="!editingReport" @click="startEditReport" class="btn-sm">수정</button>
                      <button v-if="editingReport" @click="saveEditReport" class="btn-sm" style="background:#6c47ff;color:#fff">저장</button>
                      <button v-if="editingReport" @click="editingReport=false" class="btn-sm">취소</button>
                      <button @click="deleteReport(selectedReport.id)" class="btn-sm del">삭제</button>
                    </div>
                  </div>
                  <textarea v-if="editingReport" v-model="editReportContent" class="report-edit-textarea"></textarea>
                  <div v-else class="report-viewer-body">{{ selectedReport.content }}</div>
                </template>

                <!-- 보고서 목록 -->
                <template v-else>
                  <!-- 이번 주/달 요약 수치 -->
                  <template v-if="reportTab==='weekly'">
                    <div class="report-label">{{ weeklyReport.label }}</div>
                    <div class="report-grid">
                      <div class="rg-item">
                        <div class="rg-val">{{ weeklyReport.thisDays }}일</div>
                        <div class="rg-label">운동 일수
                          <span v-if="weeklyReport.lastDays" :class="weeklyReport.thisDays >= weeklyReport.lastDays ? 'badge-up' : 'badge-down'">
                            {{ weeklyReport.thisDays >= weeklyReport.lastDays ? '▲' : '▼' }} 지난주 {{ weeklyReport.lastDays }}일
                          </span>
                        </div>
                      </div>
                      <div class="rg-item">
                        <div class="rg-val">{{ weeklyReport.thisVolume.toLocaleString('ko-KR') }}kg</div>
                        <div class="rg-label">총 볼륨
                          <span v-if="weeklyReport.lastVolume" :class="weeklyReport.thisVolume >= weeklyReport.lastVolume ? 'badge-up' : 'badge-down'">
                            {{ weeklyReport.thisVolume >= weeklyReport.lastVolume ? '+' : '' }}{{ weeklyReport.lastVolume ? Math.round((weeklyReport.thisVolume-weeklyReport.lastVolume)/weeklyReport.lastVolume*100) : 0 }}%
                          </span>
                        </div>
                      </div>
                      <div class="rg-item">
                        <div class="rg-val">{{ weeklyReport.topGroupCnt ? weeklyReport.topGroup : '-' }}</div>
                        <div class="rg-label">최다 부위</div>
                      </div>
                      <div class="rg-item">
                        <div class="rg-val">{{ weeklyReport.endW ? weeklyReport.endW+'kg' : '-' }}</div>
                        <div class="rg-label">현재 체중</div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="report-label">{{ monthlyReport.month }}월</div>
                    <div class="report-grid">
                      <div class="rg-item">
                        <div class="rg-val">{{ monthlyReport.thisDays }}일</div>
                        <div class="rg-label">운동 일수 / {{ monthlyReport.daysInMonth }}일</div>
                      </div>
                      <div class="rg-item">
                        <div class="rg-val">{{ monthlyReport.thisVolume.toLocaleString('ko-KR') }}kg</div>
                        <div class="rg-label">총 볼륨
                          <span v-if="monthlyReport.lastVolume" :class="monthlyReport.thisVolume >= monthlyReport.lastVolume ? 'badge-up' : 'badge-down'">
                            {{ monthlyReport.thisVolume >= monthlyReport.lastVolume ? '+' : '' }}{{ monthlyReport.lastVolume ? Math.round((monthlyReport.thisVolume-monthlyReport.lastVolume)/monthlyReport.lastVolume*100) : 0 }}%
                          </span>
                        </div>
                      </div>
                      <div class="rg-item">
                        <div class="rg-val">{{ monthlyReport.topEx || '-' }}</div>
                        <div class="rg-label">최다 운동</div>
                      </div>
                      <div class="rg-item">
                        <div class="rg-val">{{ monthlyReport.endW ? monthlyReport.endW+'kg' : '-' }}</div>
                        <div class="rg-label">체중
                          <span v-if="monthlyReport.startW && monthlyReport.endW">
                            {{ (monthlyReport.endW - monthlyReport.startW).toFixed(1) > 0 ? '+' : '' }}{{ (monthlyReport.endW - monthlyReport.startW).toFixed(1) }}kg
                          </span>
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- 보고서 버튼들 -->
                  <div style="display:flex;gap:8px;margin-top:12px">
                    <button @click="generateReport(reportTab)" class="btn-gen-report" style="flex:1" :disabled="reportGenerating">
                      {{ reportGenerating ? '생성 중...' : '📄 자동 생성 (API)' }}
                    </button>
                    <button @click="showPasteReport=true;pasteForm.type=reportTab" class="btn-paste-report">
                      ✏️ 직접 입력
                    </button>
                  </div>

                  <!-- 과거 보고서 목록 -->
                  <!-- 월간 보고서 선택 -->
                  <template v-if="reportTab==='monthly'">
                    <div class="report-selector">
                      <select v-model.number="reportSelYear" class="input-field" style="flex:1" @change="reportSelMonth=reportMonths[0]||1">
                        <option v-for="y in reportYears('monthly')" :key="y" :value="y">{{ y }}년</option>
                      </select>
                      <select v-model.number="reportSelMonth" class="input-field" style="flex:1">
                        <option v-for="m in reportMonths" :key="m" :value="m">{{ m }}월</option>
                      </select>
                      <button v-if="foundMonthlyReport" @click="selectedReport=foundMonthlyReport" class="btn-primary" style="flex:1">보기</button>
                    </div>
                    <div v-if="!foundMonthlyReport && reportMonths.length" class="empty-td" style="padding:12px;text-align:center;font-size:13px">해당 월 보고서 없음</div>
                    <div v-if="!reportYears('monthly').length" class="empty-td" style="padding:12px;text-align:center;font-size:13px">아직 저장된 보고서가 없어요</div>
                  </template>

                  <!-- 주간 보고서 선택 -->
                  <template v-else>
                    <div class="report-selector">
                      <select v-model.number="reportSelYear" class="input-field" style="flex:1" @change="reportSelWeek=''">
                        <option v-for="y in reportYears('weekly')" :key="y" :value="y">{{ y }}년</option>
                      </select>
                      <select v-model="reportSelWeek" class="input-field" style="flex:2">
                        <option value="">주 선택</option>
                        <option v-for="r in reportWeeks" :key="r.id" :value="r.period_start">{{ r.period_label }}</option>
                      </select>
                      <button v-if="foundWeeklyReport" @click="selectedReport=foundWeeklyReport" class="btn-primary" style="flex:1">보기</button>
                    </div>
                    <div v-if="!reportYears('weekly').length" class="empty-td" style="padding:12px;text-align:center;font-size:13px">아직 저장된 보고서가 없어요</div>
                  </template>
                </template>
              </div>

              <!-- 요약 카드 -->
              <div class="summary-grid health-summary-grid">
                <div class="summary-card total">
                  <div class="sc-label">총 운동</div>
                  <div class="sc-value sm">{{ totalWorkoutDays }}일</div>
                </div>
                <div class="summary-card long-card">
                  <div class="sc-label">이번 달</div>
                  <div class="sc-value sm">{{ thisMonthWorkoutDays }}일</div>
                </div>
                <div class="summary-card short-card">
                  <div class="sc-label">이번 주</div>
                  <div class="sc-value sm">{{ thisWeekWorkoutDays }}일</div>
                </div>
                <div class="summary-card long-card">
                  <div class="sc-label">올해 휴식</div>
                  <div class="sc-value sm">{{ restDaysThisYear }}일</div>
                </div>
                <div class="summary-card" :class="weightPlateau ? 'short-card' : 'long-card'">
                  <div class="sc-label">최근 체중</div>
                  <div class="sc-value sm">{{ weightLogs.length ? weightLogs[weightLogs.length-1].weight + 'kg' : '-' }}</div>
                  <div style="font-size:12px;opacity:0.9;margin-top:4px">{{ weightPlateau ? '⚠️ 정체기' : '✅ 변화중' }}</div>
                </div>
              </div>

              <!-- 부위 불균형 경고 -->
              <div v-if="muscleImbalance.length" class="alert-card mt16">
                ⚠️ 상대적으로 부족한 부위: <strong>{{ muscleImbalance.join(', ') }}</strong>
              </div>

              <!-- 운동 기록 -->
              <div class="card mt16">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                  <div class="card-title" style="margin:0">운동 기록</div>
                  <div style="display:flex;gap:6px">
                    <button @click="showBatchWorkout=true;batchDate=new Date().toISOString().slice(0,10);batchItems=[]" class="btn-add-top">날짜별 입력</button>
                    <button @click="showAddWorkout=true" class="btn-add-top">+ 1개</button>
                  </div>
                </div>
                <!-- 달력 -->
                <div class="cal-nav">
                  <button @click="prevMonth" class="btn-sm" style="font-size:16px;padding:2px 10px">‹</button>
                  <span class="cal-month-label">{{ calendarLabel }}</span>
                  <button @click="nextMonth" class="btn-sm" style="font-size:16px;padding:2px 10px">›</button>
                </div>
                <div class="cal-grid">
                  <div v-for="d in ['일','월','화','수','목','금','토']" :key="d" class="cal-dow">{{ d }}</div>
                  <template v-for="(cell, i) in calendarDays" :key="i">
                    <div v-if="!cell" class="cal-cell"></div>
                    <div v-else
                      :class="['cal-cell', cell.hasWorkout && 'has-workout', selectedCalendarDate === cell.date && 'selected']"
                      @click="selectCalendarDate(cell)">
                      {{ cell.day }}
                    </div>
                  </template>
                </div>
                <!-- 선택 날짜 기록 -->
                <template v-if="selectedDateGroup">
                  <div class="cal-detail-header">
                    <span>{{ selectedCalendarDate }}
                      <template v-if="selectedDateGroup.items.find(w=>w.duration_min)"> · {{ selectedDateGroup.items.find(w=>w.duration_min).duration_min }}분</template>
                    </span>
                    <button @click.stop="openEditGroup(selectedDateGroup)" class="btn-sm" style="font-size:11px;padding:2px 7px">수정</button>
                  </div>
                  <div v-if="calDateChangeIds.length" class="cal-date-change-bar">
                    <input type="date" v-model="calDateChangeTarget" style="border:1px solid #ccc;border-radius:6px;padding:3px 6px;font-size:13px" />
                    <button @click="changeWorkoutDate" class="btn-sm" style="background:#6c47ff;color:#fff">날짜 변경</button>
                    <button @click="calDateChangeIds=[]" class="btn-sm">취소</button>
                  </div>
                  <template v-for="(w, wi) in selectedDateGroup.items" :key="w.id">
                    <hr v-if="wi>0" class="wl-divider" />
                  <div class="wl-item">
                    <div class="wl-header">
                      <div class="wl-left" style="display:flex;align-items:center;gap:6px">
                        <input type="checkbox" :checked="calDateChangeIds.includes(w.id)" @change="toggleCalDateSelect(w.id)" style="cursor:pointer;width:15px;height:15px" />
                        <span v-if="w.set_type==='superset' || w.superset_group" class="tag-superset">슈퍼세트</span>
                        <span v-if="w.set_type==='dropset' || w.set_logs?.some(s=>s.type==='dropset')" class="tag-dropset">드롭세트</span>
                        <span class="wl-group">{{ w.muscle_group }}</span>
                      </div>
                      <button @click="deleteWorkout(w.id)" class="btn-sm del">삭제</button>
                    </div>
                    <div class="wl-name">{{ w.exercise }}</div>
                    <div class="wl-sets">
                      <template v-if="w.set_logs?.length">
                        <span v-for="(s, si) in w.set_logs" :key="si"
                          :class="['set-chip', s.type==='dropset'&&'chip-drop', s.type==='failure'&&'chip-fail']">
                          {{ s.weight }}kg × {{ s.reps }}{{ s.type==='failure' ? ' (실패)' : '' }}
                        </span>
                      </template>
                      <template v-else>
                        <span class="set-chip">{{ w.sets }}세트 × {{ w.reps }}회 / {{ w.weight }}kg</span>
                      </template>
                    </div>
                  </div>
                  </template>
                </template>
                <div v-if="!workouts.length" class="empty-td" style="padding:16px;text-align:center">운동을 기록해보세요</div>
              </div>

              <!-- 부위별 주간 볼륨 + 총 횟수 -->
              <div class="card mt16">
                <div class="card-title">부위별 운동량</div>
                <div class="muscle-legend">
                  <span v-for="g in MUSCLE_GROUPS" :key="g" class="legend-item">
                    <span class="legend-dot" :style="{background: MUSCLE_COLORS[g]}"></span>{{ g }}
                  </span>
                </div>
                <!-- 주간 볼륨 차트 -->
                <div class="muscle-week-chart">
                  <div v-for="week in weeklyMuscleChart.weeks" :key="week.label" class="mwc-col">
                    <div class="mwc-bars">
                      <div v-for="g in MUSCLE_GROUPS" :key="g" class="mwc-bar"
                        :style="{ height: (week.data[g] / weeklyMuscleChart.maxVal * 80) + 'px', background: MUSCLE_COLORS[g], opacity: week.data[g] ? 1 : 0 }"
                        :title="`${g}: ${week.data[g].toLocaleString()}kg`">
                      </div>
                    </div>
                    <div class="mwc-label">{{ week.label }}</div>
                  </div>
                </div>
                <!-- 부위별 총 횟수 -->
                <div class="muscle-count-row">
                  <div v-for="(cnt, g) in muscleBalance" :key="g" class="mc-item">
                    <div class="mc-dot" :style="{background: MUSCLE_COLORS[g]}"></div>
                    <div class="mc-name">{{ g }}</div>
                    <div class="mc-cnt">{{ cnt }}회</div>
                  </div>
                </div>
              </div>

              <!-- 종목별 개인 최고 기록 -->
              <div class="card mt16" v-if="allTimePRs.length">
                <div class="card-title">부위별 개인 최고 기록</div>
                <div v-for="group in allTimePRs" :key="group.group" class="pr-group">
                  <div class="pr-group-label" @click="togglePRGroup(group.group)">
                    <span class="pr-dot" :style="{background: MUSCLE_COLORS[group.group]}"></span>
                    <span :style="{color: MUSCLE_COLORS[group.group]}">{{ group.group }}</span>
                    <span class="pr-group-cnt">{{ group.items.length }}개</span>
                    <span class="pr-toggle">{{ isPRGroupExpanded(group.group) ? '▲' : '▼' }}</span>
                  </div>
                  <div v-if="isPRGroupExpanded(group.group)" class="pr-table">
                    <div class="pr-row pr-head">
                      <span class="pr-ex">종목</span>
                      <span class="pr-val">실제 최고</span>
                      <span class="pr-val">1RM 환산</span>
                    </div>
                    <div v-for="p in group.items" :key="p.exercise" class="pr-row">
                      <span class="pr-ex">{{ p.exercise }}</span>
                      <span class="pr-val">{{ p.bestWeight }}kg</span>
                      <span class="pr-val pr-orm">{{ p.bestOneRM }}kg</span>
                    </div>
                  </div>
                </div>
              </div>


              <!-- 체중 기록 + 그래프 -->
              <div class="card mt16">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                  <div class="card-title" style="margin:0">체중 변화</div>
                  <button @click="showAddWeight=true" class="btn-add-top">+ 체중 추가</button>
                </div>
                <div v-if="!weightLogs.length" class="empty-td" style="padding:16px;text-align:center">체중을 기록해보세요</div>
                <div v-else-if="recentWeights.length === 1" style="text-align:center;padding:12px;font-size:15px;font-weight:700">
                  {{ recentWeights[0].weight }}kg
                  <div style="font-size:12px;color:#aaa;margin-top:4px">{{ recentWeights[0].date }}</div>
                </div>
                <div v-else class="weight-chart">
                  <div v-for="(w, i) in recentWeights" :key="w.id" class="wt-col">
                    <div class="wt-bar-wrap">
                      <div class="wt-bar" :style="{
                        height: ((w.weight - Math.min(...recentWeights.map(x=>x.weight))) /
                          Math.max(Math.max(...recentWeights.map(x=>x.weight)) - Math.min(...recentWeights.map(x=>x.weight)), 0.1) * 70 + 10) + '%'
                      }" :class="i > 0 && w.weight < recentWeights[i-1].weight ? 'wt-down' : 'wt-up'"></div>
                    </div>
                    <div class="wt-val">{{ w.weight }}</div>
                    <div class="wt-date">{{ w.date.slice(5) }}</div>
                  </div>
                </div>
              </div>

              <!-- 운동 일지 -->
              <div class="card mt16" v-if="workoutMemos.length">
                <div class="card-title">운동 일지</div>
                <div class="memo-list">
                  <div v-for="m in workoutMemos.slice(0,10)" :key="m.id" class="memo-item">
                    <div class="memo-date">{{ m.date }}</div>
                    <div class="memo-content">{{ m.content }}</div>
                    <button @click="deleteMemo(m.id)" class="btn-sm del">삭제</button>
                  </div>
                </div>
              </div>

            </template>

          </div>
        </div>
      </div>

      <!-- 주간 데이터 복사 모달 -->
      <div v-if="showCopyPicker" class="modal-overlay" @click.self="showCopyPicker=false">
        <div class="modal">
          <div class="modal-handle"></div>
          <h3>주간 데이터 복사</h3>
          <p style="font-size:13px;color:#888;margin-bottom:16px">복사할 주를 선택하세요</p>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button v-for="w in availableCopyWeeks" :key="w.startStr"
              class="week-pick-btn" @click="copyWeekData(w.startStr, w.endStr)">
              {{ w.label }}
            </button>
            <div v-if="!availableCopyWeeks.length" style="text-align:center;color:#bbb;padding:20px">운동 기록이 없어요</div>
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

      <!-- 날짜별 일괄 입력 모달 -->
      <div v-if="showBatchWorkout" class="modal-overlay" @click.self="showBatchWorkout=false">
        <div class="modal batch-modal">
          <h3>날짜별 운동 입력</h3>

          <!-- 날짜 + 운동 시간 + 슈퍼세트 토글 -->
          <div class="form-row" style="margin-bottom:14px">
            <div class="form-group"><label>날짜</label><input v-model="batchDate" type="date" class="input-field" /></div>
            <div class="form-group"><label>운동 시간(분)</label><input v-model="batchDuration" type="number" min="1" max="300" class="input-field" placeholder="예: 60" /></div>
            <div class="form-group" style="justify-content:flex-end">
              <label style="margin-bottom:6px">슈퍼세트 모드</label>
              <button :class="['superset-toggle', supersetMode && 'superset-on']"
                @click="supersetMode=!supersetMode; supersetGroupId=null">
                {{ supersetMode ? '켜짐' : '꺼짐' }}
              </button>
            </div>
          </div>

          <!-- 운동 + 세트 입력 -->
          <div class="batch-entry-box">
            <!-- 부위 / 종목 / 즐겨찾기 -->
            <div class="form-row three-col">
              <div class="form-group">
                <label>부위</label>
                <select v-model="batchEntry.muscle_group" class="input-field" @change="batchEntry.exercise='';batchEntry.customExercise=''">
                  <option v-for="g in MUSCLE_GROUPS" :key="g">{{ g }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>종목</label>
                <select v-model="batchEntry.exercise" class="input-field">
                  <option value="" disabled>선택</option>
                  <optgroup v-if="exerciseRecentFor(batchEntry.muscle_group).length" label="🕐 최근 사용">
                    <option v-for="ex in exerciseRecentFor(batchEntry.muscle_group)" :key="'rec-'+ex" :value="ex">{{ ex }}</option>
                  </optgroup>
                  <optgroup label="전체">
                    <option v-for="ex in exerciseRestFor(batchEntry.muscle_group)" :key="'all-'+ex" :value="ex">{{ ex }}</option>
                  </optgroup>
                  <option value="__custom__">직접 입력...</option>
                </select>
              </div>
              <div class="form-group">
                <label>즐겨찾기 <button v-if="batchEntry.exercise && batchEntry.exercise!=='__custom__'" @click="toggleFavorite(batchEntry.exercise)" class="fav-label-btn" :class="isFavorite(batchEntry.exercise)&&'fav-on'">★</button></label>
                <select class="input-field" @change="e => { batchEntry.exercise = e.target.value; e.target.value = '' }">
                  <option value="">선택</option>
                  <option v-for="ex in exerciseFavsFor(batchEntry.muscle_group)" :key="ex" :value="ex">{{ ex }}</option>
                </select>
              </div>
            </div>
            <input v-if="batchEntry.exercise==='__custom__'" v-model="batchEntry.customExercise" class="input-field" style="margin-bottom:6px" placeholder="운동 이름" />
            <!-- 이전 기록 -->
            <template v-if="batchEntry.exercise && batchEntry.exercise !== '__custom__' && lastWorkoutOf(batchEntry.exercise)">
              <button @click="showPrevRecord=!showPrevRecord" class="btn-prev-record">
                {{ showPrevRecord ? '▲ 이전 기록 닫기' : '▼ 이전 기록 확인' }}
              </button>
              <div v-if="showPrevRecord" class="prev-record-box">
                <div class="prev-record-date">{{ lastWorkoutOf(batchEntry.exercise).date }}</div>
                <div class="prev-record-sets">
                  <template v-if="lastWorkoutOf(batchEntry.exercise).set_logs?.length">
                    <span v-for="(s, i) in lastWorkoutOf(batchEntry.exercise).set_logs" :key="i" class="set-chip">
                      {{ s.weight }}kg × {{ s.reps }}{{ s.type==='failure' ? ' (실패)' : '' }}
                    </span>
                  </template>
                  <template v-else>
                    <span class="set-chip">{{ lastWorkoutOf(batchEntry.exercise).sets }}세트 × {{ lastWorkoutOf(batchEntry.exercise).reps }}회 / {{ lastWorkoutOf(batchEntry.exercise).weight }}kg</span>
                  </template>
                </div>
                <button @click="loadPrevRecord(lastWorkoutOf(batchEntry.exercise))" class="btn-primary" style="width:100%;margin-top:8px;font-size:13px">불러오기</button>
              </div>
            </template>

            <!-- 세트별 입력 -->
            <div class="set-logs-header">
              <span>세트</span><span>무게(kg)</span><span>횟수</span><span>실패</span><span></span>
            </div>
            <div v-for="(s, i) in batchEntry.set_logs" :key="i" :class="['set-log-row', s.type==='dropset'&&'row-drop', s.type==='failure'&&'row-fail']">
              <span class="set-num-badge" :class="s.type==='dropset'?'badge-drop':s.type==='failure'?'badge-fail':''">
                {{ s.type==='dropset' ? '↓' : s.type==='failure' ? 'F' : i+1 }}
              </span>
              <div class="set-stepper">
                <button @click="s.weight = Math.max(0, parseFloat((s.weight - 2.5).toFixed(1)))" class="step-btn">-</button>
                <input v-model.number="s.weight" type="number" class="set-mini-input" placeholder="0" />
                <button @click="s.weight = parseFloat((s.weight + 2.5).toFixed(1))" class="step-btn">+</button>
              </div>
              <div class="set-stepper">
                <button @click="s.reps = Math.max(0, s.reps - 1)" class="step-btn">-</button>
                <input v-model.number="s.reps" type="number" class="set-mini-input" placeholder="0" />
                <button @click="s.reps++" class="step-btn">+</button>
              </div>
              <button :class="['fail-btn', s.type==='failure'&&'fail-on']" @click="toggleFailure(i)">●</button>
              <button @click="removeSetLog(i)" class="btn-sm del" style="padding:2px 6px">✕</button>
            </div>

            <!-- 세트 추가 버튼들 -->
            <div class="set-add-row">
              <button @click="addSetLog" class="set-add-btn">+ 일반</button>
              <button @click="addDropSet" class="set-add-btn drop">+ 드롭</button>
            </div>

            <button @click="addBatchItem" class="btn-primary" style="width:100%;margin-top:8px"
              :disabled="!batchEntry.exercise || batchEntry.exercise==='__custom__'&&!batchEntry.customExercise">
              {{ supersetMode ? '+ 슈퍼세트로 추가' : '+ 목록에 추가' }}
            </button>
          </div>

          <!-- 추가된 운동 목록 -->
          <div v-if="batchItems.length" class="batch-list">
            <div class="batch-list-title">추가된 운동 ({{ batchItems.length }}개)</div>
            <div v-for="(item, i) in batchItems" :key="i" :class="['batch-item', item.set_type==='superset'&&'batch-superset']">
              <div class="bi-info">
                <div style="display:flex;align-items:center;gap:6px">
                  <span v-if="item.set_type==='superset' || item.superset_group" class="tag-superset">슈퍼세트</span>
                  <span v-if="item.set_type==='dropset' || item.set_logs?.some(s=>s.type==='dropset')" class="tag-dropset">드롭세트</span>
                  <span class="bi-group">{{ item.muscle_group }}</span>
                </div>
                <span class="bi-name">{{ item.exercise }}</span>
                <div class="bi-sets">
                  <span v-for="(s, si) in item.set_logs" :key="si" :class="['set-chip', s.type==='dropset'&&'chip-drop', s.type==='failure'&&'chip-fail']">
                    {{ s.weight }}kg×{{ s.reps }}{{ s.type==='failure'?'(F)':'' }}
                  </span>
                </div>
              </div>
              <button @click="removeBatchItem(i)" class="btn-sm del">✕</button>
            </div>
          </div>

          <!-- 오늘 운동 후기 -->
          <div class="form-group" style="margin-top:12px">
            <label>오늘 후기 (선택)</label>
            <textarea v-model="batchMemo" class="input-field" rows="2"
              placeholder="컨디션, 느낀 점, 특이사항 등..."></textarea>
          </div>

          <div class="modal-btns" style="margin-top:12px">
            <button @click="showBatchWorkout=false" class="btn-cancel">닫기</button>
            <button @click="saveBatchWorkout" class="btn-primary" :disabled="!batchItems.length || batchSaving">
              {{ batchSaving ? '저장 중...' : `전체 저장 (${batchItems.length}개)` }}
            </button>
          </div>
        </div>
      </div>

      <!-- 보고서 직접 입력 모달 -->
      <div v-if="showPasteReport" class="modal-overlay" @click.self="showPasteReport=false">
        <div class="modal">
          <h3>보고서 직접 입력</h3>
          <p style="font-size:13px;color:#888;margin-bottom:14px">
            📋 데이터 복사 → Claude.ai에 붙여넣기 → 받은 보고서를 여기에 저장
          </p>
          <div class="form-row">
            <div class="form-group">
              <label>종류</label>
              <select v-model="pasteForm.type" class="input-field">
                <option value="weekly">주간</option>
                <option value="monthly">월간</option>
              </select>
            </div>
            <div class="form-group">
              <label>기간 이름</label>
              <input v-model="pasteForm.period_label" class="input-field" placeholder="예: 2026년 6월 4주차" />
            </div>
          </div>
          <div class="form-group" style="margin-top:8px">
            <label>보고서 내용 붙여넣기</label>
            <textarea v-model="pasteForm.content" class="input-field paste-textarea"
              placeholder="Claude.ai에서 받은 보고서 내용을 여기에 붙여넣으세요"></textarea>
          </div>
          <div class="modal-btns" style="margin-top:14px">
            <button @click="showPasteReport=false" class="btn-cancel">취소</button>
            <button @click="savePastedReport" class="btn-primary"
              :disabled="!pasteForm.content.trim() || !pasteForm.period_label.trim()">저장</button>
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
              <select v-model="newWorkout.muscle_group" class="input-field" @change="newWorkout.exercise=''; newWorkout.customExercise=''">
                <option v-for="g in MUSCLE_GROUPS" :key="g">{{ g }}</option>
              </select>
            </div>
          </div>
          <div class="form-row three-col">
            <div class="form-group">
              <label>종목</label>
              <select v-model="newWorkout.exercise" class="input-field">
                <option value="" disabled>선택</option>
                <optgroup v-if="exerciseRecentFor(newWorkout.muscle_group).length" label="🕐 최근 사용">
                  <option v-for="ex in exerciseRecentFor(newWorkout.muscle_group)" :key="'rec-'+ex" :value="ex">{{ ex }}</option>
                </optgroup>
                <optgroup label="전체">
                  <option v-for="ex in exerciseRestFor(newWorkout.muscle_group)" :key="'all-'+ex" :value="ex">{{ ex }}</option>
                </optgroup>
                <option value="__custom__">직접 입력...</option>
              </select>
            </div>
            <div class="form-group">
              <label>즐겨찾기 <button v-if="newWorkout.exercise && newWorkout.exercise!=='__custom__'" @click="toggleFavorite(newWorkout.exercise)" class="fav-label-btn" :class="isFavorite(newWorkout.exercise)&&'fav-on'">★</button></label>
              <select class="input-field" @change="e => { newWorkout.exercise = e.target.value; e.target.value = '' }">
                <option value="">선택</option>
                <option v-for="ex in exerciseFavsFor(newWorkout.muscle_group)" :key="ex" :value="ex">{{ ex }}</option>
              </select>
            </div>
          </div>
          <input v-if="newWorkout.exercise === '__custom__'" v-model="newWorkout.customExercise" class="input-field" style="margin-bottom:6px" placeholder="운동 이름 직접 입력" />
          <div class="form-row">
            <div class="form-group"><label>세트</label><input v-model.number="newWorkout.sets" type="number" class="input-field" /></div>
            <div class="form-group">
              <label>횟수</label>
              <div class="set-stepper">
                <button @click="newWorkout.reps = Math.max(0, newWorkout.reps - 1)" class="step-btn">-</button>
                <input v-model.number="newWorkout.reps" type="number" class="input-field" style="text-align:center" />
                <button @click="newWorkout.reps++" class="step-btn">+</button>
              </div>
            </div>
            <div class="form-group">
              <label>무게 (kg)</label>
              <div class="set-stepper">
                <button @click="newWorkout.weight = Math.max(0, parseFloat((newWorkout.weight - 2.5).toFixed(1)))" class="step-btn">-</button>
                <input v-model.number="newWorkout.weight" type="number" class="input-field" style="text-align:center" />
                <button @click="newWorkout.weight = parseFloat((newWorkout.weight + 2.5).toFixed(1))" class="step-btn">+</button>
              </div>
            </div>
          </div>
          <div class="form-group"><label>메모</label><input v-model="newWorkout.memo" class="input-field" placeholder="컨디션, 느낀점 등" /></div>
          <div class="modal-btns">
            <button @click="showAddWorkout=false" class="btn-cancel">취소</button>
            <button @click="addWorkout" class="btn-primary">저장</button>
          </div>
        </div>
      </div>

      <!-- 날짜별 종목 선택 모달 -->
      <div v-if="showEditGroup" class="modal-overlay" @click.self="showEditGroup=false">
        <div class="modal">
          <h3>{{ editGroupItems[0]?.date }} 수정</h3>
          <div class="form-row" style="margin-bottom:14px;align-items:flex-end">
            <div class="form-group" style="flex:1"><label>총 운동 시간(분)</label><input v-model.number="editGroupDuration" type="number" min="1" max="300" class="input-field" placeholder="예: 60" /></div>
          </div>
          <div style="font-size:12px;color:#888;margin-bottom:8px">종목 수정 / 순서 조정</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <div v-for="(w, i) in editGroupItems" :key="w.id"
              style="padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;display:flex;justify-content:space-between;align-items:center">
              <div style="display:flex;flex-direction:column;gap:2px;cursor:pointer;flex:1" @click="openEditWorkout(w)">
                <span style="font-size:11px;color:#888">{{ w.muscle_group }}</span>
                <span style="font-size:13px;font-weight:600">{{ w.exercise }}</span>
                <span style="font-size:11px;color:#aaa">{{ w.weight }}kg</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;margin-left:8px">
                <button @click="moveEditItem(i, -1)" :disabled="i===0" class="btn-sm" style="padding:1px 8px;font-size:13px">↑</button>
                <button @click="moveEditItem(i, 1)" :disabled="i===editGroupItems.length-1" class="btn-sm" style="padding:1px 8px;font-size:13px">↓</button>
              </div>
            </div>
          </div>
          <div class="modal-btns" style="margin-top:14px">
            <button @click="showEditGroup=false" class="btn-cancel">닫기</button>
            <button @click="saveEditGroup" class="btn-primary">저장</button>
          </div>
        </div>
      </div>

      <!-- 운동 수정 모달 -->
      <div v-if="showEditWorkout && editingWorkout" class="modal-overlay" @click.self="showEditWorkout=false">
        <div class="modal">
          <h3>운동 수정</h3>
          <div class="form-row">
            <div class="form-group"><label>날짜</label><input v-model="editingWorkout.date" type="date" class="input-field" /></div>
            <div class="form-group">
              <label>부위</label>
              <select v-model="editingWorkout.muscle_group" class="input-field">
                <option v-for="g in MUSCLE_GROUPS" :key="g">{{ g }}</option>
              </select>
            </div>
          </div>
          <div class="form-group"><label>운동 종목</label><input v-model="editingWorkout.exercise" class="input-field" /></div>

          <!-- 세트 타입 -->
          <div class="form-group" style="margin-bottom:10px">
            <label>세트 타입</label>
            <div style="display:flex;gap:6px">
              <button v-for="t in [{v:'normal',l:'일반'},{v:'superset',l:'슈퍼세트'},{v:'dropset',l:'드롭세트'}]" :key="t.v"
                :class="['btn-sm', editingWorkout.set_type===t.v && 'btn-sm-active']"
                @click="editingWorkout.set_type=t.v">{{ t.l }}</button>
            </div>
          </div>

          <!-- 세트별 기록이 있으면 세트별로, 없으면 합산 -->
          <template v-if="editingWorkout.set_logs?.length">
            <label style="font-size:13px;font-weight:600;margin-bottom:6px;display:block">세트별 기록</label>
            <div v-for="(s, si) in editingWorkout.set_logs" :key="si"
              style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="font-size:12px;color:#888;width:20px">{{ si+1 }}.</span>
              <input v-model.number="s.weight" type="number" class="input-field" style="width:72px" placeholder="kg" />
              <span style="font-size:12px;color:#888">×</span>
              <input v-model.number="s.reps" type="number" class="input-field" style="width:62px" placeholder="횟수" />
              <button :class="['fail-btn', s.type==='dropset'&&'fail-on']" @click="editToggleSetLogType(si,'dropset')" style="font-size:10px;padding:0 5px">드</button>
              <button :class="['fail-btn', s.type==='failure'&&'fail-on']" @click="editToggleSetLogType(si,'failure')" style="font-size:10px;padding:0 5px">실</button>
              <button @click="editRemoveSetLog(si)" class="btn-sm del" style="padding:2px 6px">✕</button>
            </div>
            <button @click="editAddSetLog" class="btn-sm" style="margin-top:2px;margin-bottom:10px">+ 세트 추가</button>
          </template>
          <template v-else>
            <div class="form-row">
              <div class="form-group"><label>세트</label><input v-model.number="editingWorkout.sets" type="number" class="input-field" /></div>
              <div class="form-group"><label>횟수</label><input v-model.number="editingWorkout.reps" type="number" class="input-field" /></div>
              <div class="form-group"><label>무게 (kg)</label><input v-model.number="editingWorkout.weight" type="number" class="input-field" /></div>
            </div>
          </template>

          <div class="form-group"><label>메모</label><input v-model="editingWorkout.memo" class="input-field" placeholder="컨디션, 느낀점 등" /></div>
          <div class="modal-btns">
            <button @click="showEditWorkout=false" class="btn-cancel">취소</button>
            <button @click="saveEditWorkout" class="btn-primary">저장</button>
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
      <div v-if="stockSellTarget" class="modal-overlay" @click.self="stockSellTarget=null">
        <div class="modal">
          <h3>📉 매도 — {{ stockSellTarget.name }}</h3>
          <div class="sim-calc" style="margin-bottom:16px">
            보유 수량: <b>{{ stockSellTarget.quantity }}주</b> &nbsp;|&nbsp; 평균단가: <b>{{ fmt(stockSellTarget.avg_price) }}원</b>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>수량 (주) *</label>
              <input v-model.number="stockSellForm.quantity" type="number" :max="stockSellTarget.quantity" class="input-field" />
            </div>
            <div class="form-group">
              <label>가격 (원) *</label>
              <input v-model.number="stockSellForm.price" type="number" class="input-field" />
            </div>
          </div>
          <div v-if="stockSellForm.quantity && stockSellForm.price" class="sim-calc">
            매도금액: <b>{{ fmt(stockSellForm.quantity * stockSellForm.price) }}원</b> &nbsp;|&nbsp;
            손익: <b :class="(stockSellForm.price-stockSellTarget.avg_price)*stockSellForm.quantity>=0?'profit':'loss'">
              {{ (stockSellForm.price-stockSellTarget.avg_price)*stockSellForm.quantity>=0?'+':'' }}{{ fmt(Math.round((stockSellForm.price-stockSellTarget.avg_price)*stockSellForm.quantity)) }}원
            </b>
          </div>
          <div class="modal-btns">
            <button @click="stockSellTarget=null" class="btn-cancel">취소</button>
            <button @click="stockSell" class="btn-primary" style="background:#ef4444">매도</button>
          </div>
        </div>
      </div>

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
            &nbsp;|&nbsp; 손익:
            <b :class="(simSellForm.price - simSellTarget.avg_price) * simSellForm.quantity >= 0 ? 'profit' : 'loss'">
              {{ (simSellForm.price - simSellTarget.avg_price) * simSellForm.quantity >= 0 ? '+' : '' }}{{ fmt(Math.round((simSellForm.price - simSellTarget.avg_price) * simSellForm.quantity)) }}원
            </b>
          </div>
          <div class="modal-btns">
            <button @click="simSellTarget=null" class="btn-cancel">취소</button>
            <button @click="simSell" class="btn-primary" style="background:#ef4444">매도</button>
          </div>
        </div>
      </div>

      <!-- 자동매매 조건 추가 모달 -->
      <div v-if="showCondForm" class="modal-overlay" @click.self="showCondForm=false">
        <div class="modal">
          <h3>자동매매 조건 추가</h3>
          <div class="form-row">
            <div class="form-group" style="position:relative">
              <label>종목명</label>
              <input v-model="condForm.name" class="input-field" placeholder="삼성전자"
                @input="searchStock(condForm.name)" @blur="() => { setTimeout(()=>searchResults.value=[],200) }" />
              <div v-if="searchResults.length" class="search-dropdown">
                <div v-for="s in searchResults" :key="s.ticker" class="search-item"
                  @mousedown.prevent="selectCondStock(s)">
                  <div class="si-name">{{ s.name }}</div>
                  <div class="si-ticker">{{ s.ticker }}</div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>티커</label>
              <input v-model="condForm.ticker" class="input-field" placeholder="005930.KS" />
            </div>
          </div>
          <div v-if="condPriceFetching || condCurrentPrice" style="font-size:13px;padding:6px 2px;color:#374151">
            <span v-if="condPriceFetching" style="color:#9ca3af">현재가 조회 중...</span>
            <span v-else>현재가 <b>{{ condCurrentPrice?.toLocaleString() }}원</b></span>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>구분</label>
              <select v-model="condForm.condition_type" class="input-field">
                <option value="buy">매수</option>
                <option value="sell">매도</option>
              </select>
            </div>
            <div class="form-group">
              <label>목표가</label>
              <input v-model.number="condForm.target_price" type="number" class="input-field" placeholder="0" />
              <div v-if="condCurrentPrice" style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap">
                <button type="button" @click="adjustCondPrice(-10000)" class="adj-btn">-1만</button>
                <button type="button" @click="adjustCondPrice(-1000)"  class="adj-btn">-1천</button>
                <button type="button" @click="adjustCondPrice(-100)"   class="adj-btn">-100</button>
                <button type="button" @click="adjustCondPrice(-10)"    class="adj-btn">-10</button>
                <button type="button" @click="condForm.target_price=condCurrentPrice" class="adj-btn adj-btn-reset">현재가</button>
                <button type="button" @click="adjustCondPrice(10)"     class="adj-btn">+10</button>
                <button type="button" @click="adjustCondPrice(100)"    class="adj-btn">+100</button>
                <button type="button" @click="adjustCondPrice(1000)"   class="adj-btn">+1천</button>
                <button type="button" @click="adjustCondPrice(10000)"  class="adj-btn">+1만</button>
              </div>
            </div>
            <div class="form-group">
              <label>수량</label>
              <input v-model.number="condForm.quantity" type="number" class="input-field" placeholder="0" />
            </div>
          </div>
          <div class="modal-btns">
            <button @click="showCondForm=false" class="btn-cancel">취소</button>
            <button @click="addCondition" class="btn-primary">등록</button>
          </div>
        </div>
      </div>

      <!-- 종목 추가 모달 -->
      <div v-if="showAdd" class="modal-overlay" @click.self="closeAddModal">
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
          <div v-if="addModalPriceFetching || addModalCurrentPrice" style="font-size:13px;padding:6px 2px;color:#374151">
            <span v-if="addModalPriceFetching" style="color:#9ca3af">현재가 조회 중...</span>
            <span v-else>현재가 <b>{{ addModalCurrentPrice?.toLocaleString() }}원</b></span>
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
            <button @click="closeAddModal" class="btn-cancel">취소</button>
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
.health-summary-grid { grid-template-columns:repeat(5,1fr); gap:8px; }
.ws-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:8px; }
.ws-item { background:#f4f3ff; border-radius:10px; padding:10px 12px; }
.ws-label { font-size:11px; color:#9d7bea; font-weight:600; margin-bottom:4px; }
.ws-val { font-size:20px; font-weight:800; color:#1a1a3a; }
.ws-unit { font-size:12px; font-weight:500; color:#888; margin-left:2px; }
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

.report-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.report-tabs { display:flex; gap:4px; }
.rtab { padding:4px 14px; border-radius:20px; border:1px solid #d0d0e8; background:transparent; color:#888; font-size:13px; cursor:pointer; }
.rtab-on { background:#6c47ff; border-color:#6c47ff; color:#fff; }
.report-label { font-size:12px; color:#888; margin-bottom:10px; }
.report-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; margin-bottom:12px; }
.rg-item { background:#f5f5ff; border-radius:10px; padding:8px 6px; text-align:center; }
.rg-val { font-size:16px; font-weight:700; color:#1a1a3a; }
.rg-label { font-size:11px; color:#888; margin-top:2px; display:flex; flex-direction:column; gap:2px; }
.badge-up { color:#22c55e; font-size:11px; }
.badge-down { color:#ef4444; font-size:11px; }
.report-prs { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px; }
.pr-badge { background:#fef3c7; color:#92400e; border-radius:20px; padding:4px 10px; font-size:12px; font-weight:600; }
.pr-group { margin-bottom:14px; }
.pr-group:last-child { margin-bottom:0; }
.pr-group-label { display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; padding:8px 6px; border-radius:8px; background:#f8f8f8; margin-bottom:6px; cursor:pointer; }
.pr-group-label:active { opacity:0.7; }
.pr-group-cnt { margin-left:2px; color:#aaa; font-weight:500; }
.pr-toggle { margin-left:auto; color:#bbb; font-size:11px; }
.pr-clickable { cursor:pointer; }
.pr-clickable:active { background:#f8f8f8; }
.pr-chart { padding:10px 0 4px; }
.pr-table { display:flex; flex-direction:column; gap:4px; }
.pr-row { display:flex; align-items:center; padding:8px 4px; border-bottom:1px solid #f5f5f5; }
.pr-row:last-child { border-bottom:none; }
.pr-head { font-size:11px; font-weight:700; color:#aaa; padding-bottom:6px; }
.pr-ex { flex:1; display:flex; align-items:center; gap:6px; font-size:13px; color:#333; }
.pr-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
.pr-val { width:72px; text-align:right; font-size:13px; color:#555; }
.pr-orm { color:#6c47ff; font-weight:700; }
.report-missing { font-size:12px; color:#f59e0b; margin-bottom:8px; }
.report-comment-area { margin-top:12px; display:flex; flex-direction:column; gap:8px; }
.report-comment { background:#f0f0fa; border-radius:10px; padding:12px 14px; font-size:13px; color:#333; line-height:1.6; border-left:3px solid #6c47ff; }
.memo-input-row { display:flex; flex-direction:column; gap:8px; }
.memo-input { resize:vertical; font-size:13px; line-height:1.5; }
.memo-list { display:flex; flex-direction:column; gap:8px; margin-top:12px; border-top:1px solid #eee; padding-top:12px; }
.memo-item { display:flex; align-items:flex-start; gap:8px; background:#f8f8ff; border-radius:8px; padding:10px 12px; }
.memo-date { font-size:11px; color:#888; white-space:nowrap; padding-top:2px; }
.memo-content { flex:1; font-size:13px; color:#333; line-height:1.5; }
.btn-paste-report { background:#f0f0fa; color:#6c47ff; border:1px solid #6c47ff; border-radius:10px; padding:10px 16px; font-size:13px; cursor:pointer; white-space:nowrap; }
.paste-textarea { width:100%; min-height:200px; resize:vertical; font-size:13px; line-height:1.6; }
.btn-copy-data { background:#22c55e; color:#fff; border:none; border-radius:20px; padding:6px 14px; font-size:13px; cursor:pointer; }
.profile-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px; }
.muscle-legend { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px; }
.legend-item { display:flex; align-items:center; gap:4px; font-size:11px; color:#555; }
.legend-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }
.muscle-week-chart { display:flex; gap:4px; align-items:flex-end; }
.mwc-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; }
.mwc-bars { display:flex; gap:1px; align-items:flex-end; height:80px; }
.mwc-bar { width:6px; border-radius:2px 2px 0 0; transition:height 0.4s; min-height:0; }
.mwc-label { font-size:10px; color:#888; }
.muscle-count-row { display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; margin-top:14px; border-top:1px solid #eee; padding-top:12px; }
.mc-item { display:flex; flex-direction:column; align-items:center; gap:3px; }
.mc-dot { width:8px; height:8px; border-radius:50%; }
.mc-name { font-size:10px; color:#888; }
.mc-cnt { font-size:13px; font-weight:700; color:#1a1a3a; }
.btn-gen-report { width:100%; background:#6c47ff; color:#fff; border:none; border-radius:10px; padding:10px; font-size:14px; cursor:pointer; margin-top:12px; }
.btn-gen-report:disabled { opacity:0.6; cursor:default; }
.report-selector { display:flex; gap:6px; margin-top:12px; align-items:center; }
.pri-label { font-size:14px; font-weight:600; color:#1a1a3a; }
.pri-date { font-size:12px; color:#888; margin-left:auto; margin-right:8px; }
.pri-arrow { color:#6c47ff; font-size:18px; }
.report-viewer-header { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
.btn-back-report { background:none; border:1px solid #d0d0e8; border-radius:20px; padding:4px 12px; font-size:13px; color:#555; cursor:pointer; }
.rv-label { font-size:14px; font-weight:600; color:#1a1a3a; }
.report-viewer-body { white-space:pre-wrap; font-size:14px; line-height:1.8; color:#333; background:#f8f8ff; border-radius:10px; padding:16px; min-height:200px; }
.report-edit-textarea { width:100%; min-height:300px; font-size:14px; line-height:1.8; border:1px solid #c4b5ff; border-radius:10px; padding:16px; box-sizing:border-box; resize:vertical; }
.alert-card { background:#3a1a1a; border:1px solid #ef4444; border-radius:10px; padding:12px 16px; color:#fca5a5; font-size:13px; }
.batch-modal { max-height:90vh; overflow-y:auto; }
.batch-entry-box { background:#f8f8ff; border-radius:10px; padding:14px; margin-bottom:12px; }
.batch-list { display:flex; flex-direction:column; gap:6px; max-height:240px; overflow-y:auto; }
.batch-list-title { font-size:12px; color:#888; margin-bottom:4px; }
.batch-item { display:flex; align-items:flex-start; justify-content:space-between; background:#f0f0fa; border-radius:8px; padding:8px 10px; }
.batch-superset { border-left:3px solid #f59e0b; }
.bi-info { display:flex; flex-direction:column; gap:4px; flex:1; }
.bi-group { font-size:11px; color:#888; }
.bi-name { font-size:13px; font-weight:600; color:#1a1a3a; }
.bi-sets { display:flex; flex-wrap:wrap; gap:4px; margin-top:2px; }
.superset-toggle { padding:6px 14px; border-radius:20px; border:1px solid #d0d0e8; background:#f0f0fa; color:#888; cursor:pointer; font-size:13px; }
.superset-on { background:#f59e0b; border-color:#f59e0b; color:#fff; }
.set-logs-header { display:grid; grid-template-columns:28px 1fr 1fr 32px 28px; gap:4px; font-size:11px; color:#888; margin-bottom:4px; text-align:center; }
.set-stepper { display:flex; align-items:center; gap:2px; }
.set-stepper .set-mini-input { flex:1; min-width:0; }
.set-stepper .input-field { flex:1; min-width:0; }
.step-btn { flex-shrink:0; width:24px; height:28px; background:#ede8ff; border:none; border-radius:5px; font-size:14px; font-weight:700; color:#6c47ff; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; }
.step-btn:active { background:#d4c8ff; }
.three-col { grid-template-columns: repeat(3, 1fr) !important; }
.fav-label-btn { background:none; border:none; font-size:14px; color:#ccc; cursor:pointer; padding:0 2px; vertical-align:middle; }
.fav-label-btn.fav-on { color:#f5a623; }
.set-log-row { display:grid; grid-template-columns:28px 1fr 1fr 32px 28px; gap:4px; align-items:center; margin-bottom:4px; border-radius:6px; padding:2px 0; }
.row-drop { background:#fff7ed; }
.row-fail { background:#fef2f2; }
.set-num-badge { width:24px; height:24px; border-radius:50%; background:#e0e0f0; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#555; }
.badge-drop { background:#fed7aa; color:#c2410c; }
.badge-fail { background:#fecaca; color:#b91c1c; }
.set-mini-input { width:100%; border:1px solid #d0d0e8; border-radius:6px; padding:4px 6px; font-size:13px; text-align:center; }
.fail-btn { width:28px; height:28px; border-radius:50%; border:2px solid #d0d0e8; background:#fff; color:#ccc; cursor:pointer; font-size:14px; line-height:1; }
.fail-on { border-color:#ef4444; color:#ef4444; background:#fef2f2; }
.btn-sm-active { background:#6c47ff; color:#fff; border-color:#6c47ff; }
.set-add-row { display:flex; gap:6px; margin-top:8px; }
.set-add-btn { flex:1; padding:6px; border-radius:8px; border:1px dashed #d0d0e8; background:#f8f8ff; color:#555; cursor:pointer; font-size:12px; }
.set-add-btn.drop { border-color:#f59e0b; color:#d97706; background:#fffbeb; }
.set-chip { display:inline-block; background:#e8e8f8; border-radius:20px; padding:2px 8px; font-size:11px; color:#444; }
.chip-drop { background:#fed7aa; color:#c2410c; }
.chip-fail { background:#fecaca; color:#b91c1c; }
.tag-superset { background:#fef3c7; color:#92400e; border-radius:20px; padding:2px 8px; font-size:11px; font-weight:600; }
.tag-dropset { background:#fff7ed; color:#c2410c; border-radius:20px; padding:2px 8px; font-size:11px; font-weight:600; }
.workout-log-list { display:flex; flex-direction:column; gap:8px; }
.wl-item { background:#f8f8ff; border-radius:10px; padding:10px 12px; }
.wl-divider { border:none; border-top:1px solid #e0e0f0; margin:6px 0; }
.cal-date-change-bar { display:flex; align-items:center; gap:8px; padding:8px 0; flex-wrap:wrap; }
.wl-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
.wl-left { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.cal-nav { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.cal-month-label { font-size:15px; font-weight:800; color:#4a2fb8; }
.cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:4px; margin-bottom:12px; }
.cal-dow { text-align:center; font-size:11px; color:#9d7bea; font-weight:600; padding:4px 0; }
.cal-cell { text-align:center; padding:7px 0; border-radius:8px; font-size:13px; color:#bbb; min-height:32px; display:flex; align-items:center; justify-content:center; }
.cal-cell.has-workout { background:#6c47ff; color:#fff; font-weight:700; cursor:pointer; }
.cal-cell.has-workout:active { opacity:0.8; }
.cal-cell.selected { background:#3d1fa8; color:#fff; }
.cal-detail-header { display:flex; justify-content:space-between; align-items:center; font-size:13px; font-weight:700; color:#6c47ff; padding:8px 10px; border-radius:10px; background:#ede9ff; margin-bottom:8px; }
.wl-date-meta { font-size:12px; font-weight:500; color:#9d7bea; }
.btn-prev-record { width:100%; margin-top:6px; padding:6px; border-radius:8px; background:#f0edff; color:#6c47ff; font-size:12px; font-weight:600; border:none; cursor:pointer; }
.btn-prev-record:active { opacity:0.8; }
.prev-record-box { background:#f7f5ff; border-radius:10px; padding:10px 12px; margin-top:6px; }
.prev-record-date { font-size:11px; color:#9d7bea; font-weight:600; margin-bottom:6px; }
.prev-record-sets { display:flex; flex-wrap:wrap; gap:4px; }
.week-pick-btn { width:100%; padding:14px; border:1.5px solid #ede9ff; border-radius:12px; background:white; font-size:15px; color:#333; cursor:pointer; text-align:left; }
.week-pick-btn:active { background:#ede9ff; }
.wl-date { font-size:11px; color:#888; }
.wl-group { font-size:11px; color:#888; }
.wl-name { font-size:14px; font-weight:700; color:#1a1a3a; margin-bottom:6px; }
.wl-sets { display:flex; flex-wrap:wrap; gap:4px; }
.weekly-chart { display:flex; gap:6px; align-items:flex-end; height:100px; padding-top:8px; }
.wc-col { display:flex; flex-direction:column; align-items:center; flex:1; gap:2px; }
.wc-bar-wrap { width:100%; flex:1; display:flex; align-items:flex-end; }
.wc-bar { width:100%; background:#6c47ff; border-radius:4px 4px 0 0; transition:height 0.4s; min-height:4px; }
.wc-cnt { font-size:11px; color:#c0c0e0; }
.wc-label { font-size:10px; color:#888; }
.weight-chart { display:flex; gap:4px; align-items:flex-end; height:100px; padding-top:8px; overflow-x:auto; }
.wt-col { display:flex; flex-direction:column; align-items:center; flex:0 0 auto; min-width:36px; gap:2px; }
.wt-bar-wrap { width:20px; height:70px; display:flex; align-items:flex-end; }
.wt-bar { width:100%; border-radius:4px 4px 0 0; transition:height 0.4s; min-height:4px; }
.wt-up { background:#22c55e; }
.wt-down { background:#3b82f6; }
.wt-val { font-size:11px; color:#c0c0e0; }
.wt-date { font-size:10px; color:#888; }
.ex-chart { display:flex; gap:4px; align-items:flex-end; height:110px; padding-top:8px; overflow-x:auto; }
.ex-col { display:flex; flex-direction:column; align-items:center; flex:0 0 auto; min-width:48px; gap:2px; }
.ex-bar-wrap { width:28px; height:70px; display:flex; align-items:flex-end; }
.ex-bar { width:100%; background:#f59e0b; border-radius:4px 4px 0 0; transition:height 0.4s; min-height:4px; }
.ex-val { font-size:11px; color:#c0c0e0; }
.ex-date { font-size:10px; color:#888; }

.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:200; padding:20px; }
.modal { background:white; border-radius:20px; padding:28px; width:100%; max-width:640px; max-height:90vh; overflow-y:auto; }
.modal-inner { max-height:calc(90vh - 56px); overflow-y:auto; }
.modal h3 { font-size:18px; font-weight:700; color:#1e3a8a; margin-bottom:20px; }
.form-row { display:flex; gap:16px; margin-bottom:16px; }
.form-group { flex:1; display:flex; flex-direction:column; gap:6px; min-width:0; }
.form-group label { font-size:12px; font-weight:600; color:#6b7280; }
.input-field { width:100%; padding:11px 13px; border:1px solid #e0e7ff; border-radius:10px; font-size:14px; background:#f8faff; }
.input-field::placeholder { color:#c4ccd8; }
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
.cond-form { background:#f8f7ff; border-radius:10px; padding:14px; margin:12px 0; }
.adj-btn { padding:3px 7px; font-size:12px; border:1px solid #d1d5db; border-radius:5px; background:#fff; cursor:pointer; }
.adj-btn:hover { background:#f3f4f6; }
.adj-btn-reset { background:#ede9fe; border-color:#a78bfa; color:#5b21b6; }
.sim-card { background:linear-gradient(135deg,#1e3a5f,#2d6a4f) !important; color:#fff !important; }
.sim-card .sc-label { color:rgba(255,255,255,0.8) !important; }
.sim-card .sc-value { color:#fff !important; }
.sim-card .sc-sub span { color:rgba(255,255,255,0.75) !important; }
.sim-card .sc-pnl { color:#fff !important; }
.sim-actions { display:flex; flex-direction:column; gap:8px; justify-content:center; }
.sim-calc { padding:10px 14px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; font-size:13px; color:#0369a1; margin-bottom:4px; }
.side-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:49; }

@media (max-width:768px) {
  .sidebar { transform:translateX(-100%); }
  .sidebar.open { transform:translateX(0); }
  .main { margin-left:0; overflow-x:hidden; }
  .hamburger { display:block; }
  .summary-grid { grid-template-columns:1fr; gap:8px; }
  .health-summary-grid { grid-template-columns:repeat(2,1fr); }
  .ws-grid { grid-template-columns:repeat(3,1fr); }
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

  /* 달력 */
  .cal-cell { padding:5px 0; font-size:12px; min-height:28px; border-radius:6px; }
  .cal-month-label { font-size:14px; }

  /* 운동 통계 */
  .health-summary-grid { grid-template-columns:repeat(3,1fr); }

  /* 이전 기록 */
  .prev-record-box { padding:8px 10px; }

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
