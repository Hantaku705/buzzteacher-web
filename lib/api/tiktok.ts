import { InsightData } from '@/lib/types'
import { extractTikTokId } from '@/lib/utils/platform'

const RAPIDAPI_KEY = process.env.TIKTOK_RAPIDAPI_KEY || ''

export async function getTikTokInsight(url: string): Promise<InsightData | null> {
  const videoId = extractTikTokId(url)
  if (!videoId) {
    console.error('Failed to extract TikTok video ID from URL:', url)
    return null
  }

  try {
    const res = await fetch(
      `https://tiktok-api23.p.rapidapi.com/api/post/detail?videoId=${videoId}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'tiktok-api23.p.rapidapi.com',
        },
      }
    )

    if (!res.ok) {
      console.error('TikTok API error:', res.status)
      return null
    }

    const json = await res.json()
    const item = json.itemInfo?.itemStruct || json.item || json

    const stats = item.stats || item.video_stats || {}
    return {
      url,
      platform: 'TikTok',
      view: stats.playCount || stats.play_count || null,
      like: stats.diggCount || stats.digg_count || null,
      comment: stats.commentCount || stats.comment_count || null,
      share: stats.shareCount || stats.share_count || null,
      save: stats.collectCount || stats.collect_count || null,
      durationSec: item.video?.duration || item.duration || null,
      thumbnail: item.video?.cover || item.video?.originCover || item.cover || null,
    }
  } catch (error) {
    console.error('Failed to get TikTok insight:', error)
    return null
  }
}

export async function downloadTikTokVideo(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(
      `https://tiktok-video-downloader-api.p.rapidapi.com/media?videoUrl=${encodeURIComponent(url)}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'tiktok-video-downloader-api.p.rapidapi.com',
        },
      }
    )

    if (!res.ok) {
      console.error('TikTok download API error:', res.status)
      return null
    }

    const json = await res.json()
    const videoUrl =
      json.videoUrl ||
      json.video_url ||
      json.downloadUrl ||
      json.download_url ||
      json.hdVideoUrl ||
      json.data?.videoUrl ||
      json.data?.video_url

    if (!videoUrl) {
      console.error('No video URL in response')
      return null
    }

    const videoRes = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!videoRes.ok) {
      console.error('Failed to download video:', videoRes.status)
      return null
    }

    return Buffer.from(await videoRes.arrayBuffer())
  } catch (error) {
    console.error('Failed to download TikTok video:', error)
    return null
  }
}
