import { InsightData } from '@/lib/types'
import { extractInstagramShortcode } from '@/lib/utils/platform'

const RAPIDAPI_KEY = process.env.INSTAGRAM_RAPIDAPI_KEY

export async function getInstagramInsight(url: string): Promise<InsightData | null> {
  if (!RAPIDAPI_KEY) {
    console.error('INSTAGRAM_RAPIDAPI_KEY is not configured')
    return null
  }

  const shortcode = extractInstagramShortcode(url)
  if (!shortcode) {
    console.error('Failed to extract Instagram shortcode from URL:', url)
    return null
  }

  try {
    // Instagram Scraper API2 を使用してリール情報を取得
    const res = await fetch(
      `https://instagram-scraper-api2.p.rapidapi.com/v1/post_info?code_or_id_or_url=${encodeURIComponent(shortcode)}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com',
        },
      }
    )

    if (!res.ok) {
      console.error('Instagram API error:', res.status)
      return null
    }

    const json = await res.json()
    const data = json.data || json

    return {
      url,
      platform: 'Instagram',
      view: data.play_count || data.view_count || null,
      like: data.like_count || null,
      comment: data.comment_count || null,
      share: data.reshare_count || null,
      save: null, // Instagram APIでは取得不可
      durationSec: data.video_duration || null,
      thumbnail: data.thumbnail_url || data.image_versions2?.candidates?.[0]?.url || null,
    }
  } catch (error) {
    console.error('Failed to get Instagram insight:', error)
    return null
  }
}

export async function downloadInstagramVideo(url: string): Promise<Buffer | null> {
  if (!RAPIDAPI_KEY) {
    console.error('INSTAGRAM_RAPIDAPI_KEY is not configured')
    return null
  }

  try {
    // Instagram Scraper Stable API を使用して動画URLを取得
    const res = await fetch(
      `https://instagram-scraper-stable-api.p.rapidapi.com/get_media_data.php?reel_post_code_or_url=${encodeURIComponent(url)}&type=reel`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'instagram-scraper-stable-api.p.rapidapi.com',
        },
      }
    )

    if (!res.ok) {
      console.error('Instagram download API error:', res.status)
      return null
    }

    const json = await res.json()

    // 動画URLを取得（複数のパスを試行）
    const videoUrl =
      json.video_url ||
      json.data?.video_url ||
      json.video_versions?.[0]?.url ||
      json.media?.video_versions?.[0]?.url

    if (!videoUrl) {
      console.error('No video URL in Instagram API response')
      return null
    }

    // 動画をダウンロード
    const videoRes = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        'Referer': 'https://www.instagram.com/',
      },
    })

    if (!videoRes.ok) {
      console.error('Failed to download Instagram video:', videoRes.status)
      return null
    }

    return Buffer.from(await videoRes.arrayBuffer())
  } catch (error) {
    console.error('Failed to download Instagram video:', error)
    return null
  }
}
