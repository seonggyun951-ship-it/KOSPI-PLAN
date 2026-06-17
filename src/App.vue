<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://wqahhqssawaxynqigwtr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxYWhocXNzYXdheHlucWlnd3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMjMwMjUsImV4cCI6MjA5Njg5OTAyNX0.b8d5YFUG7XSerEuCX0LygAU-JfOuxxB2T03Jaur0JjQ'
)

const STOCK_COLORS = ['#2563eb','#7c3aed','#0891b2','#059669','#d97706','#dc2626','#db2777','#65a30d','#9333ea','#0284c7','#c2410c','#0f766e']
const APP_PASSWORD = 'tjdrbsalswl123'

// ── 인증 ────────────────────────────────────────────────────
const isAuthorized = ref(false)
const inputPassword = ref('')

// ── 데이터 ──────────────────────────────────────────────────
const stocks = ref([])

// ── UI 상태 ─────────────────────────────────────────────────
const loading    = ref(true)
const saveStatus = ref(null)
const showAdd    = ref(false)
const editStock  = ref(null)

// ── 폼 ──────────────────────────────────────────────────────
const newStock = ref({ name:'', ticker:'', quantity:'', avg_price:'', current_price:'', memo:'' })

let toastTimer = null
const setToast = (s) => {
  saveStatus.value = s
  if (toastTimer) clearTimeout(toastTimer)
  if (s === 'saved' || s === 'error') toastTimer = setTimeout(() => { saveStatus.value = null }, 3000)
}

// ── 로그인 ──────────────────────────────────────────────────
const login = async () => {
  if (inputPassword.value === APP_PASSWORD) { isAuthorized.value = true; await fetchAll() }
  else { alert('비밀번호가 틀렸습니다!'); inputPassword.value = '' }
}

// ── 데이터 불러오기 ──────────────────────────────────────────
const fetchAll = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase.from('stock_items').select('*').order('created_at')
    if (error) throw error
    if (data) stocks.value = data
  } catch (e) {
    console.error('불러오기 실패:', e)
  }
  loading.value = false
}

// ── 종목 추가 ────────────────────────────────────────────────
const addStock = async () => {
  if (!newStock.value.name.trim()) return
  setToast('saving')
  const payload = {
    name:          newStock.value.name.trim(),
    ticker:        newStock.value.ticker.trim(),
    quantity:      Number(newStock.value.quantity)      || 0,
    avg_price:     Number(newStock.value.avg_price)     || 0,
    current_price: Number(newStock.value.current_price) || 0,
    memo:          newStock.value.memo
  }
  const { data, error } = await supabase.from('stock_items').insert(payload).select().single()
  if (!error && data) {
    stocks.value.push(data)
    newStock.value = { name:'', ticker:'', quantity:'', avg_price:'', current_price:'', memo:'' }
    showAdd.value = false
    setToast('saved')
  } else { setToast('error'); alert('추가 실패: ' + error.message) }
}

// ── 종목 수정 ────────────────────────────────────────────────
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

// ── 종목 삭제 ────────────────────────────────────────────────
const deleteStock = async (id) => {
  if (!confirm('삭제할까요?')) return
  setToast('saving')
  const { error } = await supabase.from('stock_items').delete().eq('id', id)
  if (!error) { stocks.value = stocks.value.filter(s => s.id !== id); setToast('saved') }
  else { setToast('error'); alert('삭제 실패: ' + error.message) }
}

// ── 현재가 빠른 수정 ─────────────────────────────────────────
const updatePrice = async (stock, newPrice) => {
  const price = Number(newPrice)
  if (!price || price < 0) return
  const { error } = await supabase.from('stock_items').update({ current_price: price }).eq('id', stock.id)
  if (!error) stock.current_price = price
}

// ── 실시간 동기화 ────────────────────────────────────────────
let channel
onMounted(() => {
  channel = supabase.channel('stock-realtime')
    .on('postgres_changes', { event:'*', schema:'public', table:'stock_items' }, (p) => {
      if (p.eventType==='INSERT') { if (!stocks.value.find(s=>s.id===p.new.id)) stocks.value.push(p.new) }
      else if (p.eventType==='UPDATE') { const i=stocks.value.findIndex(s=>s.id===p.new.id); if(i>=0) stocks.value[i]=p.new }
      else if (p.eventType==='DELETE') stocks.value=stocks.value.filter(s=>s.id!==p.old.id)
    })
    .subscribe()
})
onUnmounted(() => {
  if (channel) supabase.removeChannel(channel)
  if (toastTimer) clearTimeout(toastTimer)
})

// ── 계산 ────────────────────────────────────────────────────
const totalInvest  = computed(() => stocks.value.reduce((s,st) => s + st.quantity * st.avg_price,     0))
const totalValue   = computed(() => stocks.value.reduce((s,st) => s + st.quantity * st.current_price, 0))
const totalPnl     = computed(() => totalValue.value - totalInvest.value)
const totalRate    = computed(() => totalInvest.value ? (totalPnl.value / totalInvest.value * 100) : 0)

const stockPnl  = (s) => s.quantity * (s.current_price - s.avg_price)
const stockRate = (s) => s.avg_price ? ((s.current_price - s.avg_price) / s.avg_price * 100) : 0
const stockValue= (s) => s.quantity * s.current_price

// 파이차트
const pieData = computed(() => {
  const total = totalValue.value; if (!total) return []
  let angle = 0
  return stocks.value.map((s, i) => {
    const val = stockValue(s); if (!val) return null
    const sweep = val / total * 360
    const seg = { name: s.name, val, d: arcPath(100,100,80,angle,angle+sweep), color: STOCK_COLORS[i % STOCK_COLORS.length] }
    angle += sweep; return seg
  }).filter(Boolean)
})
function arcPath(cx,cy,r,sa,ea) {
  if(ea-sa>=360) ea=sa+359.99
  const rad=a=>(a-90)*Math.PI/180
  const x1=cx+r*Math.cos(rad(sa)),y1=cy+r*Math.sin(rad(sa))
  const x2=cx+r*Math.cos(rad(ea)),y2=cy+r*Math.sin(rad(ea))
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${ea-sa>180?1:0} 1 ${x2},${y2} Z`
}

const fmt     = n => Number(n||0).toLocaleString()
const fmtRate = r => (r >= 0 ? '+' : '') + r.toFixed(2) + '%'
</script>

<template>
  <div class="app">
    <!-- 로그인 -->
    <div v-if="!isAuthorized" class="login-screen">
      <div class="login-box">
        <div class="login-icon">📈</div>
        <h2>나만의 주식 포트폴리오</h2>
        <input v-model="inputPassword" type="password" maxlength="20" placeholder="비밀번호 입력" @keyup.enter="login" class="pw-input" />
        <button @click="login" class="btn-primary">입장하기</button>
      </div>
    </div>

    <template v-else>
      <div v-if="loading" class="loading-screen">
        <div class="spinner"></div><p>불러오는 중...</p>
      </div>

      <template v-else>
        <!-- 헤더 -->
        <header class="app-header">
          <div class="header-inner">
            <h1 class="header-title">📈 주식 포트폴리오</h1>
            <div class="header-spacer"></div>
          </div>
        </header>

        <!-- 토스트 -->
        <div class="toast" :class="{ visible: saveStatus }">
          <span v-if="saveStatus==='saving'">💾 저장 중...</span>
          <span v-else-if="saveStatus==='saved'">✅ 저장됨</span>
          <span v-else-if="saveStatus==='error'">❌ 저장 실패</span>
        </div>

        <main class="main-content">
          <!-- 요약 카드 -->
          <div class="summary-card" :class="{ profit: totalPnl >= 0, loss: totalPnl < 0 }">
            <div class="summary-top">
              <div>
                <div class="summary-label">총 평가금액</div>
                <div class="summary-amount">{{ fmt(Math.round(totalValue)) }}원</div>
              </div>
              <div class="rate-badge" :class="totalPnl >= 0 ? 'badge-profit' : 'badge-loss'">
                {{ fmtRate(totalRate) }}
              </div>
            </div>
            <div class="summary-stats">
              <div class="stat-item">
                <div class="stat-label">투자금</div>
                <div class="stat-value">{{ fmt(Math.round(totalInvest)) }}원</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-label">손익</div>
                <div class="stat-value" :class="totalPnl >= 0 ? 'profit-text' : 'loss-text'">
                  {{ totalPnl >= 0 ? '+' : '' }}{{ fmt(Math.round(totalPnl)) }}원
                </div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-label">종목 수</div>
                <div class="stat-value">{{ stocks.length }}개</div>
              </div>
            </div>
          </div>

          <!-- 파이차트 -->
          <div v-if="stocks.length > 0" class="card">
            <p class="section-title">종목별 비중</p>
            <div class="chart-wrap">
              <svg viewBox="0 0 200 200" width="140" height="140">
                <path v-for="seg in pieData" :key="seg.name" :d="seg.d" :fill="seg.color" stroke="white" stroke-width="2.5" />
                <circle cx="100" cy="100" r="44" fill="white" />
                <text x="100" y="96"  text-anchor="middle" font-size="10" fill="#888">평가금액</text>
                <text x="100" y="114" text-anchor="middle" font-size="11" fill="#333" font-weight="bold">{{ Math.round(totalValue/10000) }}만원</text>
              </svg>
              <div class="legend">
                <div v-for="(seg, i) in pieData" :key="seg.name" class="legend-row">
                  <span class="leg-dot" :style="{ background: seg.color }"></span>
                  <span class="leg-name">{{ seg.name }}</span>
                  <span class="leg-pct">{{ Math.round(seg.val/totalValue*100) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 종목 리스트 -->
          <p class="section-title">보유 종목 ({{ stocks.length }}개)</p>
          <div v-for="(stock, i) in stocks" :key="stock.id" class="stock-card">
            <div class="stock-top">
              <div class="stock-left">
                <div class="stock-color-dot" :style="{ background: STOCK_COLORS[i % STOCK_COLORS.length] }"></div>
                <div>
                  <div class="stock-name">{{ stock.name }}</div>
                  <div v-if="stock.ticker" class="stock-ticker">{{ stock.ticker }}</div>
                </div>
              </div>
              <div class="stock-actions">
                <button @click="editStock={ ...stock }" class="btn-icon">✏️</button>
                <button @click="deleteStock(stock.id)" class="btn-icon">🗑️</button>
              </div>
            </div>

            <div class="stock-prices">
              <div class="price-row">
                <span class="price-label">현재가</span>
                <span class="current-price">{{ fmt(stock.current_price) }}원</span>
              </div>
              <div class="price-row">
                <span class="price-label">평균단가</span>
                <span>{{ fmt(stock.avg_price) }}원</span>
              </div>
              <div class="price-row">
                <span class="price-label">수량</span>
                <span>{{ fmt(stock.quantity) }}주</span>
              </div>
            </div>

            <div class="stock-pnl">
              <div class="pnl-item">
                <span class="price-label">평가금액</span>
                <span class="pnl-value">{{ fmt(Math.round(stockValue(stock))) }}원</span>
              </div>
              <div class="pnl-item">
                <span class="price-label">손익</span>
                <span class="pnl-value" :class="stockPnl(stock) >= 0 ? 'profit-text' : 'loss-text'">
                  {{ stockPnl(stock) >= 0 ? '+' : '' }}{{ fmt(Math.round(stockPnl(stock))) }}원
                </span>
              </div>
              <div class="pnl-item">
                <span class="price-label">수익률</span>
                <span class="pnl-value rate-value" :class="stockRate(stock) >= 0 ? 'profit-text' : 'loss-text'">
                  {{ fmtRate(stockRate(stock)) }}
                </span>
              </div>
            </div>

            <!-- 현재가 빠른 수정 -->
            <div class="price-update-row">
              <span class="price-label">현재가 업데이트</span>
              <div class="price-input-wrap">
                <input
                  type="number"
                  :placeholder="String(stock.current_price)"
                  class="price-input"
                  @change="updatePrice(stock, $event.target.value); $event.target.value=''"
                />
                <span class="won-label">원</span>
              </div>
            </div>

            <div v-if="stock.memo" class="stock-memo">{{ stock.memo }}</div>
          </div>

          <div v-if="stocks.length === 0" class="empty-state">
            <div>📊</div>
            <p>보유 종목을 추가해보세요</p>
          </div>
        </main>

        <!-- FAB -->
        <button class="fab" @click="showAdd=true">+</button>

        <!-- ── 종목 추가 모달 ── -->
        <div v-if="showAdd" class="modal-overlay" @click.self="showAdd=false">
          <div class="modal">
            <div class="modal-handle"></div>
            <h3>종목 추가</h3>
            <div class="input-row">
              <input v-model="newStock.name"   placeholder="종목명 *"   class="input-half" />
              <input v-model="newStock.ticker" placeholder="티커 (선택)" class="input-half" />
            </div>
            <div class="input-row">
              <input v-model.number="newStock.quantity"      type="number" placeholder="수량 (주)"  class="input-half" />
              <input v-model.number="newStock.avg_price"     type="number" placeholder="평균단가"   class="input-half" />
            </div>
            <input v-model.number="newStock.current_price" type="number" placeholder="현재가" class="input-field" />
            <textarea v-model="newStock.memo" placeholder="메모 (선택)" class="input-field textarea"></textarea>
            <div class="modal-btns">
              <button @click="showAdd=false" class="btn-cancel">취소</button>
              <button @click="addStock" class="btn-primary flex1" :disabled="saveStatus==='saving'">추가</button>
            </div>
          </div>
        </div>

        <!-- ── 종목 수정 모달 ── -->
        <div v-if="editStock" class="modal-overlay" @click.self="editStock=null">
          <div class="modal">
            <div class="modal-handle"></div>
            <h3>종목 수정</h3>
            <div class="input-row">
              <input v-model="editStock.name"   placeholder="종목명"       class="input-half" />
              <input v-model="editStock.ticker" placeholder="티커 (선택)"  class="input-half" />
            </div>
            <div class="input-row">
              <input v-model.number="editStock.quantity"      type="number" placeholder="수량 (주)"  class="input-half" />
              <input v-model.number="editStock.avg_price"     type="number" placeholder="평균단가"   class="input-half" />
            </div>
            <input v-model.number="editStock.current_price" type="number" placeholder="현재가" class="input-field" />
            <textarea v-model="editStock.memo" placeholder="메모" class="input-field textarea"></textarea>
            <div class="modal-btns">
              <button @click="editStock=null" class="btn-cancel">취소</button>
              <button @click="saveEdit" class="btn-primary flex1" :disabled="saveStatus==='saving'">저장</button>
            </div>
          </div>
        </div>

      </template>
    </template>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.app { max-width: 480px; margin: 0 auto; background: #eef2ff; min-height: 100vh; min-height: 100dvh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

/* 헤더 */
.app-header { position: fixed; top: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; background: white; z-index: 100; border-bottom: 1px solid #e0e7ff; }
.header-inner { display: flex; align-items: center; justify-content: space-between; padding: 0 16px; height: 56px; }
.header-title { font-size: 17px; font-weight: 700; color: #1e3a8a; }
.header-spacer { width: 44px; }

.main-content { padding: 68px 16px 90px; }

/* 토스트 */
.toast { position: fixed; top: 64px; right: 16px; background: white; border-radius: 20px; padding: 7px 16px; font-size: 13px; box-shadow: 0 4px 14px rgba(0,0,0,0.1); opacity: 0; transition: opacity 0.3s; z-index: 200; pointer-events: none; }
.toast.visible { opacity: 1; }

/* 요약 카드 */
.summary-card { border-radius: 20px; padding: 20px; margin-bottom: 12px; color: white; }
.summary-card.profit { background: linear-gradient(135deg, #1d4ed8, #2563eb); }
.summary-card.loss   { background: linear-gradient(135deg, #1e40af, #3730a3); }
.summary-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.summary-label { font-size: 12px; opacity: 0.8; margin-bottom: 4px; }
.summary-amount { font-size: 26px; font-weight: 700; }
.rate-badge { border-radius: 20px; padding: 5px 13px; font-size: 14px; font-weight: 700; }
.badge-profit { background: rgba(16,185,129,0.25); color: #6ee7b7; }
.badge-loss   { background: rgba(239,68,68,0.25);  color: #fca5a5; }
.summary-stats { display: flex; align-items: center; }
.stat-item { flex: 1; text-align: center; }
.stat-label { font-size: 11px; opacity: 0.75; margin-bottom: 3px; }
.stat-value { font-size: 13px; font-weight: 700; }
.stat-divider { width: 1px; height: 28px; background: rgba(255,255,255,0.25); }

/* 카드 */
.card { background: white; border-radius: 16px; padding: 16px; margin-bottom: 12px; }
.section-title { font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 10px; letter-spacing: 0.5px; text-transform: uppercase; }

/* 차트 */
.chart-wrap { display: flex; align-items: center; gap: 16px; }
.legend { flex: 1; }
.legend-row { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; font-size: 13px; }
.leg-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.leg-name { flex: 1; color: #374151; font-weight: 500; }
.leg-pct { font-weight: 700; color: #111827; }

/* 종목 카드 */
.stock-card { background: white; border-radius: 14px; padding: 16px; margin-bottom: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
.stock-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.stock-left { display: flex; align-items: center; gap: 10px; }
.stock-color-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.stock-name { font-weight: 700; font-size: 16px; color: #111827; }
.stock-ticker { font-size: 12px; color: #9ca3af; margin-top: 1px; }
.stock-actions { display: flex; gap: 2px; }

.stock-prices { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #f3f4f6; }
.price-row { display: flex; flex-direction: column; gap: 2px; }
.price-label { font-size: 11px; color: #9ca3af; }
.current-price { font-size: 15px; font-weight: 700; color: #1d4ed8; }

.stock-pnl { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f3f4f6; }
.pnl-item { display: flex; flex-direction: column; gap: 2px; }
.pnl-value { font-size: 13px; font-weight: 700; color: #374151; }
.rate-value { font-size: 14px; }

/* 현재가 업데이트 */
.price-update-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.price-input-wrap { display: flex; align-items: center; gap: 4px; }
.price-input { width: 120px; padding: 8px 10px; border: 1px solid #e0e7ff; border-radius: 8px; font-size: 14px; text-align: right; background: #f8faff; }
.price-input:focus { outline: none; border-color: #2563eb; background: white; }
.won-label { font-size: 13px; color: #9ca3af; }
.stock-memo { font-size: 13px; color: #6b7280; margin-top: 10px; padding: 8px 10px; background: #f9fafb; border-radius: 8px; }

/* 색상 */
.profit-text { color: #ef4444; }
.loss-text   { color: #2563eb; }

/* FAB */
.fab { position: fixed; bottom: calc(24px + env(safe-area-inset-bottom,0px)); right: max(16px, calc(50% - 224px)); width: 54px; height: 54px; border-radius: 50%; background: #2563eb; color: white; font-size: 30px; border: none; cursor: pointer; box-shadow: 0 4px 18px rgba(37,99,235,0.45); display: flex; align-items: center; justify-content: center; z-index: 99; }

/* 폼 */
.input-field { width: 100%; padding: 13px; border: 1px solid #e0e7ff; border-radius: 12px; margin-bottom: 8px; font-size: 15px; background: #f8faff; }
.input-field:focus { outline: none; border-color: #2563eb; background: white; }
.input-row { display: flex; gap: 8px; margin-bottom: 8px; }
.input-half { flex: 1; padding: 13px; border: 1px solid #e0e7ff; border-radius: 12px; font-size: 15px; background: #f8faff; min-width: 0; }
.input-half:focus { outline: none; border-color: #2563eb; background: white; }
.textarea { resize: vertical; min-height: 60px; }

/* 버튼 */
.btn-primary { width: 100%; background: #2563eb; color: white; border: none; padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; }
.btn-primary.flex1 { width: auto; flex: 1; }
.btn-primary:disabled { opacity: 0.6; }
.btn-cancel { flex: 1; padding: 14px; border: 1px solid #e0e7ff; border-radius: 12px; cursor: pointer; background: white; font-size: 15px; color: #6b7280; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 18px; padding: 6px; border-radius: 8px; min-width: 36px; min-height: 36px; display: flex; align-items: center; justify-content: center; }
.btn-icon:active { background: #f3f4f6; }

/* 모달 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; justify-content: center; z-index: 200; }
.modal { background: white; border-radius: 24px 24px 0 0; padding: 20px 20px 32px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
.modal h3 { font-size: 17px; font-weight: 700; margin-bottom: 16px; color: #111827; }
.modal-handle { width: 36px; height: 4px; background: #e5e7eb; border-radius: 2px; margin: 0 auto 20px; }
.modal-btns { display: flex; gap: 10px; margin-top: 8px; }

/* 빈 상태 */
.empty-state { text-align: center; padding: 60px 20px; color: #9ca3af; }
.empty-state div { font-size: 40px; margin-bottom: 12px; }
.empty-state p { font-size: 15px; }

/* 로그인 */
.login-screen { display: flex; align-items: center; justify-content: center; min-height: 100vh; min-height: 100dvh; background: #1e3a8a; }
.login-box { background: white; padding: 40px 28px; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; width: 90%; max-width: 320px; }
.login-icon { font-size: 48px; margin-bottom: 12px; }
.login-box h2 { font-size: 18px; color: #1e3a8a; font-weight: 700; margin-bottom: 24px; }
.pw-input { width: 100%; padding: 14px; border: 1px solid #e0e7ff; border-radius: 12px; font-size: 16px; text-align: center; margin-bottom: 16px; }
.pw-input:focus { outline: none; border-color: #2563eb; }

/* 로딩 */
.loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #6b7280; gap: 16px; }
.spinner { width: 36px; height: 36px; border: 3px solid #dbeafe; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
