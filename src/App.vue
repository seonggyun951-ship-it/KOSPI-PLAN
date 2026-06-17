<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://wqahhqssawaxynqigwtr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxYWhocXNzYXdheHlucWlnd3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMjMwMjUsImV4cCI6MjA5Njg5OTAyNX0.b8d5YFUG7XSerEuCX0LygAU-JfOuxxB2T03Jaur0JjQ'
)

const APP_PASSWORD = 'tjdrbs123!@#'
const COLORS = ['#2563eb','#7c3aed','#0891b2','#059669','#d97706','#dc2626','#db2777','#65a30d','#9333ea','#0284c7','#c2410c','#0f766e']

// ── 인증 ────────────────────────────────────────────────────
const isAuthorized = ref(localStorage.getItem('stock_auth') === 'true')
const inputPassword = ref('')

// ── 데이터 ──────────────────────────────────────────────────
const stocks = ref([])

// ── UI 상태 ─────────────────────────────────────────────────
const tab        = ref('dashboard') // dashboard | long | short | chart
const loading    = ref(true)
const saveStatus = ref(null)
const showAdd    = ref(false)
const editStock  = ref(null)
const refreshing = ref(false)
const sideOpen   = ref(false)

// ── 폼 ──────────────────────────────────────────────────────
const newStock = ref({ name:'', ticker:'', quantity:'', avg_price:'', current_price:'', memo:'', type:'long' })

let toastTimer = null
const setToast = (s) => {
  saveStatus.value = s
  if (toastTimer) clearTimeout(toastTimer)
  if (s === 'saved' || s === 'error') toastTimer = setTimeout(() => { saveStatus.value = null }, 3000)
}

// ── 로그인 ──────────────────────────────────────────────────
const login = async () => {
  if (inputPassword.value === APP_PASSWORD) {
    isAuthorized.value = true
    localStorage.setItem('stock_auth', 'true')
    await fetchAll()
  } else { alert('비밀번호가 틀렸습니다!'); inputPassword.value = '' }
}

// ── 데이터 불러오기 ──────────────────────────────────────────
const fetchAll = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase.from('stock_items').select('*').order('created_at')
    if (error) throw error
    if (data) stocks.value = data
  } catch (e) { console.error('불러오기 실패:', e) }
  loading.value = false
}

// ── Yahoo Finance 현재가 조회 (나중에 KIS API로 교체 예정) ───
const fetchYahooPrice = async (ticker) => {
  try {
    const url = `https://corsproxy.io/?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`)}`
    const res = await fetch(url)
    const data = await res.json()
    return data?.chart?.result?.[0]?.meta?.regularMarketPrice ?? null
  } catch (e) { return null }
}

const refreshAllPrices = async () => {
  const targets = stocks.value.filter(s => s.ticker)
  if (!targets.length) { alert('티커가 등록된 종목이 없어요.\n종목 수정에서 티커(예: 005930.KS)를 입력해주세요.'); return }
  refreshing.value = true
  let updated = 0
  for (const stock of targets) {
    const price = await fetchYahooPrice(stock.ticker)
    if (price) { await updateCurrentPrice(stock, price); updated++ }
  }
  refreshing.value = false
  alert(`${updated}/${targets.length}개 종목 업데이트 완료! (15~20분 지연)`)
}

// ── CRUD ────────────────────────────────────────────────────
const addStock = async () => {
  if (!newStock.value.name.trim()) return
  setToast('saving')
  const payload = {
    name:          newStock.value.name.trim(),
    ticker:        newStock.value.ticker.trim(),
    quantity:      Number(newStock.value.quantity)      || 0,
    avg_price:     Number(newStock.value.avg_price)     || 0,
    current_price: Number(newStock.value.current_price) || 0,
    memo:          newStock.value.memo,
    type:          newStock.value.type
  }
  const { data, error } = await supabase.from('stock_items').insert(payload).select().single()
  if (!error && data) {
    stocks.value.push(data)
    newStock.value = { name:'', ticker:'', quantity:'', avg_price:'', current_price:'', memo:'', type:'long' }
    showAdd.value = false
    setToast('saved')
  } else { setToast('error'); alert('추가 실패: ' + error.message) }
}

const saveEdit = async () => {
  setToast('saving')
  const { id, created_at, ...fields } = editStock.value
  const payload = {
    ...fields,
    name:          fields.name?.trim(),
    quantity:      Number(fields.quantity)      || 0,
    avg_price:     Number(fields.avg_price)     || 0,
    current_price: Number(fields.current_price) || 0,
  }
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

// ── 실시간 동기화 ────────────────────────────────────────────
let channel
onMounted(async () => {
  if (isAuthorized.value) await fetchAll()
  channel = supabase.channel('stock-realtime')
    .on('postgres_changes', { event:'*', schema:'public', table:'stock_items' }, (p) => {
      if (p.eventType==='INSERT') { if (!stocks.value.find(s=>s.id===p.new.id)) stocks.value.push(p.new) }
      else if (p.eventType==='UPDATE') { const i=stocks.value.findIndex(s=>s.id===p.new.id); if(i>=0) stocks.value[i]=p.new }
      else if (p.eventType==='DELETE') stocks.value=stocks.value.filter(s=>s.id!==p.old.id)
    }).subscribe()
})
onUnmounted(() => {
  if (channel) supabase.removeChannel(channel)
  if (toastTimer) clearTimeout(toastTimer)
})

// ── 계산 ────────────────────────────────────────────────────
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

// 파이차트 (종목별)
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

// 파이차트 (장기/단기 비중)
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

const fmt     = n  => Number(n||0).toLocaleString()
const fmtRate = r  => (r >= 0 ? '+' : '') + Number(r).toFixed(2) + '%'
const isProfit= r  => r >= 0
</script>

<template>
  <div class="root">
    <!-- 로그인 -->
    <div v-if="!isAuthorized" class="login-screen">
      <div class="login-box">
        <div class="login-icon">📈</div>
        <h2>나만의 주식 포트폴리오</h2>
        <input v-model="inputPassword" type="password" placeholder="비밀번호 입력" @keyup.enter="login" class="pw-input" />
        <button @click="login" class="btn-primary">입장하기</button>
      </div>
    </div>

    <template v-else>
      <div v-if="loading" class="loading-screen">
        <div class="spinner"></div><p>불러오는 중...</p>
      </div>

      <div v-else class="layout">
        <!-- 모바일 오버레이 -->
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
            ]" :key="item.key"
              class="nav-item" :class="{ active: tab===item.key }"
              @click="tab=item.key; sideOpen=false">
              <span class="nav-icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </button>
          </nav>

          <!-- 사이드바 하단 요약 -->
          <div class="sidebar-summary">
            <div class="ss-label">총 평가금액</div>
            <div class="ss-value">{{ fmt(Math.round(total.value)) }}원</div>
            <div class="ss-rate" :class="isProfit(total.rate) ? 'profit' : 'loss'">
              {{ fmtRate(total.rate) }}
            </div>
          </div>
        </aside>

        <!-- 메인 -->
        <div class="main">
          <!-- 상단 헤더 -->
          <header class="top-bar">
            <button class="hamburger" @click="sideOpen=!sideOpen">☰</button>
            <h1 class="page-title">
              {{ tab==='dashboard'?'대시보드':tab==='long'?'장기투자':tab==='short'?'단기투자':'차트' }}
            </h1>
            <div class="top-actions">
              <button class="btn-refresh" @click="refreshAllPrices" :disabled="refreshing">
                {{ refreshing ? '조회 중...' : '🔄 현재가 업데이트' }}
              </button>
              <button class="btn-add-top" @click="showAdd=true">+ 종목 추가</button>
            </div>
          </header>

          <!-- 토스트 -->
          <div class="toast" :class="{ visible: saveStatus }">
            <span v-if="saveStatus==='saving'">💾 저장 중...</span>
            <span v-else-if="saveStatus==='saved'">✅ 저장됨</span>
            <span v-else-if="saveStatus==='error'">❌ 저장 실패</span>
          </div>

          <div class="content">

            <!-- ── 대시보드 ── -->
            <template v-if="tab==='dashboard'">
              <!-- 요약 카드 3개 -->
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
                  <div class="sc-pnl" :class="isProfit(long.pnl)?'profit':'loss'">
                    {{ isProfit(long.pnl)?'+':'' }}{{ fmt(Math.round(long.pnl)) }}원
                  </div>
                </div>
                <div class="summary-card short-card" @click="tab='short'" style="cursor:pointer">
                  <div class="sc-label">⚡ 단기투자 ({{ shortStocks.length }}개)</div>
                  <div class="sc-value sm">{{ fmt(Math.round(short.value)) }}원</div>
                  <div class="sc-sub">
                    <span>투자금 {{ fmt(Math.round(short.invest)) }}원</span>
                    <span class="sc-rate" :class="isProfit(short.rate)?'profit':'loss'">{{ fmtRate(short.rate) }}</span>
                  </div>
                  <div class="sc-pnl" :class="isProfit(short.pnl)?'profit':'loss'">
                    {{ isProfit(short.pnl)?'+':'' }}{{ fmt(Math.round(short.pnl)) }}원
                  </div>
                </div>
              </div>

              <!-- 전체 종목 테이블 -->
              <div class="card mt16">
                <div class="card-title">전체 종목 ({{ stocks.length }}개)</div>
                <div class="table-wrap">
                  <table class="stock-table">
                    <thead>
                      <tr>
                        <th>종목명</th><th>구분</th><th>수량</th><th>평균단가</th>
                        <th>현재가</th><th>평가금액</th><th>손익</th><th>수익률</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(s,i) in stocks" :key="s.id">
                        <td>
                          <div class="td-name">
                            <span class="color-dot" :style="{ background: COLORS[i%COLORS.length] }"></span>
                            <div>
                              <div class="name-text">{{ s.name }}</div>
                              <div v-if="s.ticker" class="ticker-text">{{ s.ticker }}</div>
                            </div>
                          </div>
                        </td>
                        <td><span class="type-badge" :class="s.type">{{ s.type==='long'?'장기':'단기' }}</span></td>
                        <td>{{ fmt(s.quantity) }}주</td>
                        <td>{{ fmt(s.avg_price) }}원</td>
                        <td>
                          <div class="price-cell">
                            <span>{{ fmt(s.current_price) }}원</span>
                            <input type="number" placeholder="수정" class="inline-price-input"
                              @change="quickUpdatePrice(s, $event.target.value); $event.target.value=''" />
                          </div>
                        </td>
                        <td>{{ fmt(Math.round(stockValue(s))) }}원</td>
                        <td :class="isProfit(stockPnl(s))?'profit':'loss'">
                          {{ isProfit(stockPnl(s))?'+':'' }}{{ fmt(Math.round(stockPnl(s))) }}원
                        </td>
                        <td :class="isProfit(stockRate(s))?'profit':'loss'">
                          {{ fmtRate(stockRate(s)) }}
                        </td>
                        <td>
                          <div class="td-actions">
                            <button @click="editStock={ ...s }" class="btn-sm">수정</button>
                            <button @click="deleteStock(s.id)" class="btn-sm del">삭제</button>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="stocks.length===0">
                        <td colspan="9" class="empty-td">종목을 추가해보세요</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>

            <!-- ── 장기 / 단기 공통 뷰 ── -->
            <template v-if="tab==='long' || tab==='short'">
              <div class="invest-header">
                <div class="summary-card" :class="tab==='long'?'long-card':'short-card'" style="flex:1">
                  <div class="sc-label">{{ tab==='long'?'📈 장기투자':'⚡ 단기투자' }} 요약</div>
                  <div class="sc-value">{{ fmt(Math.round(tab==='long'?long.value:short.value)) }}원</div>
                  <div class="sc-sub">
                    <span>투자금 {{ fmt(Math.round(tab==='long'?long.invest:short.invest)) }}원</span>
                    <span class="sc-rate" :class="isProfit(tab==='long'?long.rate:short.rate)?'profit':'loss'">
                      {{ fmtRate(tab==='long'?long.rate:short.rate) }}
                    </span>
                  </div>
                  <div class="sc-pnl" :class="isProfit(tab==='long'?long.pnl:short.pnl)?'profit':'loss'">
                    {{ isProfit(tab==='long'?long.pnl:short.pnl)?'+':'' }}{{ fmt(Math.round(tab==='long'?long.pnl:short.pnl)) }}원
                  </div>
                </div>
              </div>

              <div class="card mt16">
                <div class="card-title">{{ tab==='long'?'장기':'단기' }} 종목 ({{ (tab==='long'?longStocks:shortStocks).length }}개)</div>
                <div class="table-wrap">
                  <table class="stock-table">
                    <thead>
                      <tr>
                        <th>종목명</th><th>수량</th><th>평균단가</th>
                        <th>현재가</th><th>평가금액</th><th>손익</th><th>수익률</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(s,i) in (tab==='long'?longStocks:shortStocks)" :key="s.id">
                        <td>
                          <div class="td-name">
                            <span class="color-dot" :style="{ background: COLORS[i%COLORS.length] }"></span>
                            <div>
                              <div class="name-text">{{ s.name }}</div>
                              <div v-if="s.ticker" class="ticker-text">{{ s.ticker }}</div>
                            </div>
                          </div>
                        </td>
                        <td>{{ fmt(s.quantity) }}주</td>
                        <td>{{ fmt(s.avg_price) }}원</td>
                        <td>
                          <div class="price-cell">
                            <span>{{ fmt(s.current_price) }}원</span>
                            <input type="number" placeholder="수정" class="inline-price-input"
                              @change="quickUpdatePrice(s, $event.target.value); $event.target.value=''" />
                          </div>
                        </td>
                        <td>{{ fmt(Math.round(stockValue(s))) }}원</td>
                        <td :class="isProfit(stockPnl(s))?'profit':'loss'">
                          {{ isProfit(stockPnl(s))?'+':'' }}{{ fmt(Math.round(stockPnl(s))) }}원
                        </td>
                        <td :class="isProfit(stockRate(s))?'profit':'loss'">
                          {{ fmtRate(stockRate(s)) }}
                        </td>
                        <td>
                          <div class="td-actions">
                            <button @click="editStock={ ...s }" class="btn-sm">수정</button>
                            <button @click="deleteStock(s.id)" class="btn-sm del">삭제</button>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="(tab==='long'?longStocks:shortStocks).length===0">
                        <td colspan="8" class="empty-td">종목을 추가해보세요</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>

            <!-- ── 차트 ── -->
            <template v-if="tab==='chart'">
              <div class="chart-grid">
                <!-- 종목별 비중 -->
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

                <!-- 장기/단기 비중 -->
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

                <!-- 수익률 비교 바차트 -->
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
                        <div class="bar-fill"
                          :style="{
                            width: Math.min(Math.abs(stockRate(s)), 100) + '%',
                            background: isProfit(stockRate(s)) ? '#ef4444' : '#2563eb',
                            marginLeft: isProfit(stockRate(s)) ? '50%' : `${50 - Math.min(Math.abs(stockRate(s)),50)}%`
                          }">
                        </div>
                        <div class="bar-center"></div>
                      </div>
                      <div class="bar-rate" :class="isProfit(stockRate(s))?'profit':'loss'">
                        {{ fmtRate(stockRate(s)) }}
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-chart">종목을 추가해보세요</div>
                </div>
              </div>
            </template>

          </div>
        </div>
      </div>

      <!-- ── 종목 추가 모달 ── -->
      <div v-if="showAdd" class="modal-overlay" @click.self="showAdd=false">
        <div class="modal">
          <h3>종목 추가</h3>
          <div class="form-row">
            <div class="form-group">
              <label>종목명 *</label>
              <input v-model="newStock.name" placeholder="삼성전자" class="input-field" />
            </div>
            <div class="form-group">
              <label>티커 (야후파이낸스)</label>
              <input v-model="newStock.ticker" placeholder="005930.KS" class="input-field" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>수량 (주)</label>
              <input v-model.number="newStock.quantity" type="number" class="input-field" />
            </div>
            <div class="form-group">
              <label>평균단가</label>
              <input v-model.number="newStock.avg_price" type="number" class="input-field" />
            </div>
            <div class="form-group">
              <label>현재가</label>
              <input v-model.number="newStock.current_price" type="number" class="input-field" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>구분</label>
              <div class="type-select">
                <button :class="{ active: newStock.type==='long'  }" @click="newStock.type='long'">📈 장기투자</button>
                <button :class="{ active: newStock.type==='short' }" @click="newStock.type='short'">⚡ 단기투자</button>
              </div>
            </div>
            <div class="form-group">
              <label>메모</label>
              <input v-model="newStock.memo" placeholder="메모" class="input-field" />
            </div>
          </div>
          <div class="modal-btns">
            <button @click="showAdd=false" class="btn-cancel">취소</button>
            <button @click="addStock" class="btn-primary" :disabled="saveStatus==='saving'">추가</button>
          </div>
        </div>
      </div>

      <!-- ── 종목 수정 모달 ── -->
      <div v-if="editStock" class="modal-overlay" @click.self="editStock=null">
        <div class="modal">
          <h3>종목 수정</h3>
          <div class="form-row">
            <div class="form-group">
              <label>종목명</label>
              <input v-model="editStock.name" class="input-field" />
            </div>
            <div class="form-group">
              <label>티커 (야후파이낸스)</label>
              <input v-model="editStock.ticker" placeholder="005930.KS" class="input-field" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>수량 (주)</label>
              <input v-model.number="editStock.quantity" type="number" class="input-field" />
            </div>
            <div class="form-group">
              <label>평균단가</label>
              <input v-model.number="editStock.avg_price" type="number" class="input-field" />
            </div>
            <div class="form-group">
              <label>현재가</label>
              <input v-model.number="editStock.current_price" type="number" class="input-field" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>구분</label>
              <div class="type-select">
                <button :class="{ active: editStock.type==='long'  }" @click="editStock.type='long'">📈 장기투자</button>
                <button :class="{ active: editStock.type==='short' }" @click="editStock.type='short'">⚡ 단기투자</button>
              </div>
            </div>
            <div class="form-group">
              <label>메모</label>
              <input v-model="editStock.memo" class="input-field" />
            </div>
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

/* 로그인 */
.login-screen { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #1e3a8a; }
.login-box { background: white; padding: 48px 36px; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; width: 90%; max-width: 360px; }
.login-icon { font-size: 52px; margin-bottom: 12px; }
.login-box h2 { font-size: 20px; color: #1e3a8a; font-weight: 700; margin-bottom: 28px; }
.pw-input { width: 100%; padding: 14px; border: 2px solid #e0e7ff; border-radius: 12px; font-size: 16px; text-align: center; margin-bottom: 16px; }
.pw-input:focus { outline: none; border-color: #2563eb; }

/* 로딩 */
.loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #6b7280; gap: 16px; }
.spinner { width: 40px; height: 40px; border: 3px solid #dbeafe; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 레이아웃 */
.layout { display: flex; min-height: 100vh; }

/* 사이드바 */
.sidebar { width: 240px; flex-shrink: 0; background: #1e3a8a; color: white; display: flex; flex-direction: column; position: fixed; left: 0; top: 0; bottom: 0; z-index: 50; transition: transform 0.25s; }
.sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 24px 20px 20px; font-size: 20px; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.1); }
.logo-text { font-size: 16px; letter-spacing: 1px; }
.sidebar-nav { padding: 16px 12px; flex: 1; display: flex; flex-direction: column; gap: 4px; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; border: none; background: none; color: rgba(255,255,255,0.65); font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; text-align: left; transition: 0.15s; }
.nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
.nav-item.active { background: rgba(255,255,255,0.2); color: white; }
.nav-icon { font-size: 18px; }
.sidebar-summary { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.1); }
.ss-label { font-size: 11px; opacity: 0.6; margin-bottom: 4px; }
.ss-value { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.ss-rate { font-size: 14px; font-weight: 700; }

/* 메인 */
.main { margin-left: 240px; flex: 1; min-height: 100vh; display: flex; flex-direction: column; }

/* 상단 바 */
.top-bar { background: white; border-bottom: 1px solid #e0e7ff; padding: 0 24px; height: 60px; display: flex; align-items: center; gap: 12px; position: sticky; top: 0; z-index: 40; }
.hamburger { display: none; background: none; border: none; font-size: 22px; cursor: pointer; color: #374151; padding: 6px; }
.page-title { font-size: 18px; font-weight: 700; color: #1e3a8a; flex: 1; }
.top-actions { display: flex; gap: 10px; }
.btn-refresh { padding: 8px 16px; border: 1px solid #e0e7ff; border-radius: 8px; background: white; color: #2563eb; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-refresh:hover { background: #eff6ff; }
.btn-refresh:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-add-top { padding: 8px 18px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; }
.btn-add-top:hover { background: #1d4ed8; }

/* 콘텐츠 */
.content { padding: 24px; flex: 1; }
.mt16 { margin-top: 16px; }

/* 토스트 */
.toast { position: fixed; top: 70px; right: 20px; background: white; border-radius: 20px; padding: 8px 18px; font-size: 13px; box-shadow: 0 4px 14px rgba(0,0,0,0.12); opacity: 0; transition: opacity 0.3s; z-index: 300; pointer-events: none; }
.toast.visible { opacity: 1; }

/* 요약 카드 */
.summary-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 16px; }
.summary-card { border-radius: 16px; padding: 20px 24px; color: white; }
.summary-card.total      { background: linear-gradient(135deg, #1d4ed8, #2563eb); }
.summary-card.long-card  { background: linear-gradient(135deg, #0891b2, #0284c7); transition: 0.15s; }
.summary-card.long-card:hover  { transform: translateY(-2px); }
.summary-card.short-card { background: linear-gradient(135deg, #7c3aed, #6d28d9); transition: 0.15s; }
.summary-card.short-card:hover { transform: translateY(-2px); }
.sc-label { font-size: 13px; opacity: 0.8; margin-bottom: 8px; }
.sc-value { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
.sc-value.sm { font-size: 22px; }
.sc-sub { display: flex; justify-content: space-between; font-size: 13px; opacity: 0.85; margin-bottom: 6px; }
.sc-rate { font-weight: 700; }
.sc-pnl { font-size: 16px; font-weight: 700; }

/* 카드 */
.card { background: white; border-radius: 16px; padding: 20px 24px; }
.card-title { font-size: 15px; font-weight: 700; color: #1e3a8a; margin-bottom: 16px; }

/* 투자 헤더 */
.invest-header { display: flex; gap: 16px; }

/* 테이블 */
.table-wrap { overflow-x: auto; }
.stock-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.stock-table th { padding: 10px 12px; background: #f8faff; color: #6b7280; font-weight: 600; text-align: left; border-bottom: 2px solid #e0e7ff; white-space: nowrap; }
.stock-table td { padding: 12px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.stock-table tr:hover td { background: #fafbff; }
.td-name { display: flex; align-items: center; gap: 8px; }
.color-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.name-text { font-weight: 600; color: #111827; }
.ticker-text { font-size: 12px; color: #9ca3af; }
.type-badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
.type-badge.long  { background: #dbeafe; color: #1d4ed8; }
.type-badge.short { background: #ede9fe; color: #6d28d9; }
.price-cell { display: flex; align-items: center; gap: 6px; }
.inline-price-input { width: 80px; padding: 4px 6px; border: 1px solid #e0e7ff; border-radius: 6px; font-size: 12px; }
.inline-price-input:focus { outline: none; border-color: #2563eb; }
.td-actions { display: flex; gap: 4px; }
.btn-sm { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid #e0e7ff; background: white; color: #374151; }
.btn-sm:hover { background: #f9fafb; }
.btn-sm.del { color: #dc2626; border-color: #fecaca; }
.btn-sm.del:hover { background: #fef2f2; }
.empty-td { text-align: center; color: #9ca3af; padding: 40px; }

/* 차트 */
.chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.full-width { grid-column: 1 / -1; }
.chart-wrap { display: flex; align-items: center; gap: 24px; }
.legend { flex: 1; }
.legend-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 13px; }
.leg-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.leg-name { flex: 1; color: #374151; font-weight: 500; }
.leg-pct { font-weight: 700; color: #111827; min-width: 36px; }
.leg-val { font-size: 12px; color: #9ca3af; min-width: 80px; text-align: right; }
.empty-chart { text-align: center; color: #9ca3af; padding: 40px; }

/* 바차트 */
.bar-chart { display: flex; flex-direction: column; gap: 14px; }
.bar-row { display: flex; align-items: center; gap: 12px; }
.bar-label { display: flex; align-items: center; gap: 6px; width: 160px; font-size: 13px; font-weight: 500; flex-shrink: 0; }
.bar-track { flex: 1; height: 20px; background: #f3f4f6; border-radius: 4px; position: relative; overflow: hidden; }
.bar-fill { position: absolute; height: 100%; border-radius: 4px; transition: width 0.4s; }
.bar-center { position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; background: #d1d5db; }
.bar-rate { width: 72px; text-align: right; font-size: 13px; font-weight: 700; flex-shrink: 0; }

/* 모달 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
.modal { background: white; border-radius: 20px; padding: 28px; width: 100%; max-width: 640px; max-height: 90vh; overflow-y: auto; }
.modal h3 { font-size: 18px; font-weight: 700; color: #1e3a8a; margin-bottom: 20px; }
.form-row { display: flex; gap: 16px; margin-bottom: 16px; }
.form-group { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.form-group label { font-size: 12px; font-weight: 600; color: #6b7280; }
.input-field { width: 100%; padding: 11px 13px; border: 1px solid #e0e7ff; border-radius: 10px; font-size: 14px; background: #f8faff; }
.input-field:focus { outline: none; border-color: #2563eb; background: white; }
.type-select { display: flex; gap: 8px; }
.type-select button { flex: 1; padding: 10px; border: 2px solid #e0e7ff; border-radius: 10px; background: white; font-size: 13px; font-weight: 600; cursor: pointer; color: #6b7280; }
.type-select button.active { border-color: #2563eb; background: #eff6ff; color: #2563eb; }
.modal-btns { display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end; }
.btn-cancel { padding: 11px 24px; border: 1px solid #e0e7ff; border-radius: 10px; cursor: pointer; background: white; font-size: 14px; color: #6b7280; }
.btn-primary { padding: 11px 28px; background: #2563eb; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; }
.btn-primary:disabled { opacity: 0.6; }

/* 색상 */
.profit { color: #ef4444; }
.loss   { color: #2563eb; }

/* 모바일 대응 */
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .side-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 49; }
  .main { margin-left: 0; }
  .hamburger { display: block; }
  .summary-grid { grid-template-columns: 1fr; }
  .chart-grid { grid-template-columns: 1fr; }
  .form-row { flex-direction: column; }
  .top-actions { gap: 6px; }
  .btn-refresh { display: none; }
}
</style>
