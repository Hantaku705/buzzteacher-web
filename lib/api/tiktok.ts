import { InsightData } from '@/lib/types'
import { extractTikTokId, extractTikTokUsername } from '@/lib/utils/platform'

const RAPIDAPI_KEY = process.env.TIKTOK_RAPIDAPI_KEY

export interface TikTokVideo {
  id: string
  url: string
  desc: string
  createTime: number
  stats: {
    playCount: number
    likeCount: number
    commentCount: number
    shareCount: number
    collectCount: number
  }
  durationSec: number
  thumbnail: string | null
}

export interface TikTokUserVideos {
  username: string
  profileUrl: string
  videos: TikTokVideo[]
}

export async function getTikTokInsight(url: string): Promise<InsightData | null> {
  if (!RAPIDAPI_KEY) {
    console.error('TIKTOK_RAPIDAPI_KEY is not configured')
    return null
  }

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
  if (!RAPIDAPI_KEY) {
    console.error('TIKTOK_RAPIDAPI_KEY is not configured')
    return null
  }

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

export async function getTikTokUserVideos(profileUrl: string, count: number = 10): Promise<TikTokUserVideos | null> {
  if (!RAPIDAPI_KEY) {
    console.error('TIKTOK_RAPIDAPI_KEY is not configured')
    return null
  }

  const username = extractTikTokUsername(profileUrl)
  if (!username) {
    console.error('Failed to extract TikTok username from URL:', profileUrl)
    return null
  }

  try {
    // Get user info first to obtain secUid
    const userRes = await fetch(
      `https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=${username}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'tiktok-api23.p.rapidapi.com',
        },
      }
    )

    if (!userRes.ok) {
      console.error('TikTok user info API error:', userRes.status)
      return null
    }

    const userJson = await userRes.json()
    const userInfo = userJson.userInfo || userJson
    const secUid = userInfo?.user?.secUid || userInfo?.secUid

    if (!secUid) {
      console.error('Failed to get secUid for user:', username)
      return null
    }

    // Get user posts
    const postsRes = await fetch(
      `https://tiktok-api23.p.rapidapi.com/api/user/posts?secUid=${encodeURIComponent(secUid)}&count=${count}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'tiktok-api23.p.rapidapi.com',
        },
      }
    )

    if (!postsRes.ok) {
      console.error('TikTok user posts API error:', postsRes.status)
      return null
    }

    const postsJson = await postsRes.json()
    const items = postsJson.itemList || postsJson.items || []

    const videos: TikTokVideo[] = items.map((item: Record<string, unknown>) => {
      const stats = item.stats as Record<string, number> || {}
      const video = item.video as Record<string, unknown> || {}
      return {
        id: item.id as string,
        url: `https://www.tiktok.com/@${username}/video/${item.id}`,
        desc: (item.desc as string) || '',
        createTime: item.createTime as number || 0,
        stats: {
          playCount: stats.playCount || 0,
          likeCount: stats.diggCount || 0,
          commentCount: stats.commentCount || 0,
          shareCount: stats.shareCount || 0,
          collectCount: stats.collectCount || 0,
        },
        durationSec: (video.duration as number) || 0,
        thumbnail: (video.cover as string) || (video.originCover as string) || null,
      }
    })

    return {
      username,
      profileUrl,
      videos,
    }
  } catch (error) {
    console.error('Failed to get TikTok user videos:', error)
    return null
  }
}
