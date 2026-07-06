import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

const APP_KEY    = 'PSvGVGKNkvC9QV0FKZIczIdkG8W2sGEmDgIs'
const APP_SECRET = 'lnzw8S6Vr1qNIRJST1Lq8pjWlmIKKXvOuNnp2mgaENS9BuT+h1S5fcWi7x5itkvvebukB8Ccg+gtcIpJMiHg4dKkCESo9mn/++zGOFoNbQ5pYmG114x8whyK6Z9NxWVHtnamJi8arhaDARg2umu2fpJ/uB+P+0EB5oKSWcs1BlKPvBxtmPY='
const BASE = 'https://openapi.koreainvestment.com:9443'

const NAS_TICKERS = new Set(['TSLA','AAPL','NVDA','MSFT','AMZN','GOOGL','META','NFLX','AMD','PLTR','AVGO','ARM','COIN','SNOW','SMCI','PANW','CRWD','NOW','CRM','QCOM','INTC'])

const getToken = async (supabase) => {
  const { data } = await supabase.from('kis_token').select('*').eq('id', 1).single()
  if (data && data.token && Date.now() < data.expires_at) return data.token

  const res = await fetch(`${BASE}/oauth2/tokenP`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', appkey: APP_KEY, appsecret: APP_SECRET })
  })
  const d = await res.json()
  if (!d.access_token) throw new Error('토큰 실패: ' + JSON.stringify(d))

  await supabase.from('kis_token').upsert({ id: 1, token: d.access_token, expires_at: Date.now() + (d.expires_in - 300) * 1000 })
  return d.access_token
}

const getPrice = async (token, ticker) => {
  if (ticker.includes('.KS') || ticker.includes('.KQ')) {
    const code = ticker.split('.')[0]
    const res = await fetch(BASE + '/uapi/domestic-stock/v1/quotations/inquire-price?fid_cond_mrkt_div_code=J&fid_input_iscd=' + code, {
      headers: { 'Authorization': 'Bearer ' + token, 'appkey': APP_KEY, 'appsecret': APP_SECRET, 'tr_id': 'FHKST01010100', 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    return Number(data && data.output && data.output.stck_prpr) || null
  } else {
    const excd = NAS_TICKERS.has(ticker) ? 'NAS' : 'NYS'
    const res = await fetch(BASE + '/uapi/overseas-price/v1/quotations/price?AUTH=&EXCD=' + excd + '&SYMB=' + ticker, {
      headers: { 'Authorization': 'Bearer ' + token, 'appkey': APP_KEY, 'appsecret': APP_SECRET, 'tr_id': 'HHDFS00000300', 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    return Number(data && data.output && data.output.last) || null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
    const token = await getToken(supabase)

    // 티커 목록이 body에 오면 → 가격만 반환 (프론트 수동 조회용)
    let body = {}
    try { body = await req.json() } catch {}

    if (body.tickers && Array.isArray(body.tickers) && body.tickers.length > 0) {
      const prices = {}
      await Promise.all(body.tickers.map(async (ticker) => {
        try {
          const price = await getPrice(token, ticker)
          if (price) prices[ticker] = price
        } catch (e) { console.error(ticker + ' 실패:', e) }
      }))
      return new Response(JSON.stringify(prices), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // 티커 없으면 → DB 전체 갱신 + 조건 체크 (cron 자동 실행용)
    const [stockRes, condRes] = await Promise.all([
      supabase.from('stock_items').select('id, name, ticker, avg_price, target_price, target_type, target_notified').not('ticker', 'is', null).neq('ticker', ''),
      supabase.from('trade_conditions').select('*').eq('active', true).is('notified_at', null)
    ])

    if (stockRes.error) throw stockRes.error

    const stockItems = stockRes.data || []
    const conditions = condRes.data || []

    // 필요한 모든 티커 수집 (포트폴리오 + 조건)
    const tickerSet = new Set()
    stockItems.forEach((s) => { if (s.ticker) tickerSet.add(s.ticker) })
    conditions.forEach((c) => { if (c.ticker) tickerSet.add(c.ticker) })

    // 전체 가격 한번에 조회
    const priceMap = {}
    await Promise.all([...tickerSet].map(async (ticker) => {
      try {
        const price = await getPrice(token, ticker)
        if (price) priceMap[ticker] = price
      } catch (e) { console.error(ticker + ' 실패:', e) }
    }))

    // 포트폴리오 현재가 업데이트
    let updated = 0
    await Promise.all(stockItems.map(async (stock) => {
      const price = priceMap[stock.ticker]
      if (price) {
        await supabase.from('stock_items').update({ current_price: price }).eq('id', stock.id)
        updated++
      }
    }))

    const DISCORD_WEBHOOK = Deno.env.get('DISCORD_WEBHOOK')

    // 모의투자 자동매매 조건 체크 (파란색 embed)
    if (conditions.length > 0 && DISCORD_WEBHOOK) {
      await Promise.all(conditions.map(async (c) => {
        const price = priceMap[c.ticker]
        if (!price) return
        const triggered = c.condition_type === 'buy' ? price <= c.target_price : price >= c.target_price
        if (!triggered) return

        const emoji = c.condition_type === 'buy' ? '📈' : '📉'
        const label = c.condition_type === 'buy' ? '매수' : '매도'
        await fetch(DISCORD_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🎮 **[모의투자]** ${emoji} ${label} 조건 도달`,
            embeds: [{
              description: `종목: **${c.name}**\n현재가: **${price.toLocaleString()}원**\n목표가: ${c.target_price.toLocaleString()}원\n수량: ${c.quantity}주`,
              color: 3447003,
              footer: { text: '모의투자 · KOSPI-PLAN' }
            }]
          })
        })
        await supabase.from('trade_conditions').update({ notified_at: new Date().toISOString() }).eq('id', c.id)
      }))
    }

    // 실투자 목표가 알림 (황금색 embed)
    if (DISCORD_WEBHOOK) {
      const realTargets = stockItems.filter(s => s.target_price && !s.target_notified)
      await Promise.all(realTargets.map(async (s) => {
        const price = priceMap[s.ticker]
        if (!price) return
        const isBuy = s.target_type === 'buy'
        const triggered = isBuy ? price <= s.target_price : price >= s.target_price
        if (!triggered) return

        const emoji = isBuy ? '📈' : '📉'
        const label = isBuy ? '매수 목표가 도달' : '매도 목표가 도달'
        await fetch(DISCORD_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `💰 **[실투자]** ${emoji} ${label}`,
            embeds: [{
              description: `종목: **${s.name}**\n현재가: **${price.toLocaleString()}원**\n목표가: ${s.target_price.toLocaleString()}원`,
              color: 16766720,
              footer: { text: '실투자 · KOSPI-PLAN' }
            }]
          })
        })
        await supabase.from('stock_items').update({ target_notified: true }).eq('id', s.id)
      }))
    }

    return new Response(JSON.stringify({ ok: true, updated }), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e) {
    console.error('price-auto-refresh error:', e)
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { headers: { ...cors, 'Content-Type': 'application/json' }, status: 500 })
  }
})
