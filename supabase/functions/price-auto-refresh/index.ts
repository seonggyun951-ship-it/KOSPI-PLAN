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

const getToken = async (supabase: any) => {
  const { data } = await supabase.from('kis_token').select('*').eq('id', 1).single()
  if (data?.token && Date.now() < data.expires_at) return data.token

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

const getPrice = async (token: string, ticker: string) => {
  if (ticker.includes('.KS') || ticker.includes('.KQ')) {
    const code = ticker.split('.')[0]
    const res = await fetch(BASE + '/uapi/domestic-stock/v1/quotations/inquire-price?fid_cond_mrkt_div_code=J&fid_input_iscd=' + code, {
      headers: { 'Authorization': 'Bearer ' + token, 'appkey': APP_KEY, 'appsecret': APP_SECRET, 'tr_id': 'FHKST01010100', 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    return Number(data?.output?.stck_prpr) || null
  } else {
    const excd = NAS_TICKERS.has(ticker) ? 'NAS' : 'NYS'
    const res = await fetch(BASE + '/uapi/overseas-price/v1/quotations/price?AUTH=&EXCD=' + excd + '&SYMB=' + ticker, {
      headers: { 'Authorization': 'Bearer ' + token, 'appkey': APP_KEY, 'appsecret': APP_SECRET, 'tr_id': 'HHDFS00000300', 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    return Number(data?.output?.last) || null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const token = await getToken(supabase)

    // 티커 목록이 body에 오면 → 가격만 반환 (프론트 수동 조회용)
    let body: any = {}
    try { body = await req.json() } catch {}

    if (body.tickers && Array.isArray(body.tickers) && body.tickers.length > 0) {
      const prices: Record<string, number> = {}
      await Promise.all(body.tickers.map(async (ticker: string) => {
        try {
          const price = await getPrice(token, ticker)
          if (price) prices[ticker] = price
        } catch (e) { console.error(ticker + ' 실패:', e) }
      }))
      return new Response(JSON.stringify(prices), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // 티커 없으면 → DB 전체 갱신 (cron 자동 실행용)
    const { data: stockItems, error } = await supabase
      .from('stock_items')
      .select('id, ticker')
      .not('ticker', 'is', null)
      .neq('ticker', '')

    if (error) throw error
    if (!stockItems?.length) return new Response(JSON.stringify({ ok: true, updated: 0 }), { headers: { ...cors, 'Content-Type': 'application/json' } })

    let updated = 0
    await Promise.all(stockItems.map(async (stock: any) => {
      try {
        const price = await getPrice(token, stock.ticker)
        if (price) {
          await supabase.from('stock_items').update({ current_price: price }).eq('id', stock.id)
          updated++
        }
      } catch (e) { console.error(stock.ticker + ' 실패:', e) }
    }))

    return new Response(JSON.stringify({ ok: true, updated }), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e) {
    console.error('price-auto-refresh error:', e)
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { headers: { ...cors, 'Content-Type': 'application/json' }, status: 500 })
  }
})
