'use client'

import { useState } from 'react'
import { AVAILABLE_CREATORS, getCreatorById, CreatorInfo } from '@/lib/knowledge/loader'
import { CreatorDetailModal } from './CreatorDetailModal'

function getInitial(name: string): string {
  return name.charAt(0)
}

interface CreatorIconsProps {
  creatorIds: string[]
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  clickable?: boolean
}

const sizeConfig = {
  sm: { icon: 'w-5 h-5', text: 'text-[10px]', spacing: 10, container: 20 },
  md: { icon: 'w-8 h-8', text: 'text-xs', spacing: 16, container: 32 },
  lg: { icon: 'w-10 h-10', text: 'text-sm', spacing: 20, container: 40 },
}

export function CreatorIcons({
  creatorIds,
  size = 'sm',
  showTooltip = true,
  clickable = true,
}: CreatorIconsProps) {
  const [selectedCreator, setSelectedCreator] = useState<CreatorInfo | null>(null)
  const config = sizeConfig[size]

  const creators = creatorIds
    .map(id => getCreatorById(id))
    .filter((c): c is CreatorInfo => c !== undefined)
    .slice(0, 3)

  const extraCount = creatorIds.length - 3

  if (creators.length === 0) {
    const defaultCreator = AVAILABLE_CREATORS[0]
    return (
      <>
        <div
          className={`${config.icon} rounded-full bg-emerald-600 flex items-center justify-center text-white ${config.text} font-medium shrink-0 ${clickable ? 'cursor-pointer hover:ring-2 hover:ring-emerald-400' : ''}`}
          title={showTooltip ? defaultCreator.name : undefined}
          onClick={clickable ? () => setSelectedCreator(defaultCreator) : undefined}
        >
          {getInitial(defaultCreator.name)}
        </div>
        {selectedCreator && (
          <CreatorDetailModal
            creator={selectedCreator}
            onClose={() => setSelectedCreator(null)}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div
        className="relative flex items-center shrink-0"
        style={{
          width: `${config.container + (creators.length - 1) * config.spacing}px`,
          height: `${config.container}px`,
        }}
      >
        {creators.map((creator, index) => (
          <div
            key={creator.id}
            className={`absolute ${config.icon} rounded-full bg-emerald-600 flex items-center justify-center text-white ${config.text} font-medium border border-[#202123] ${clickable ? 'cursor-pointer hover:ring-2 hover:ring-emerald-400 hover:z-10' : ''} transition-all`}
            style={{
              left: `${index * config.spacing}px`,
              zIndex: 3 - index,
            }}
            title={showTooltip ? creator.name : undefined}
            onClick={clickable ? () => setSelectedCreator(creator) : undefined}
          >
            {creator.imageUrl ? (
              <img
                src={creator.imageUrl}
                alt={creator.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitial(creator.name)
            )}
          </div>
        ))}
        {extraCount > 0 && (
          <div
            className={`absolute ${config.icon} rounded-full bg-gray-600 flex items-center justify-center text-white ${config.text} font-medium border border-[#202123]`}
            style={{
              left: `${creators.length * config.spacing}px`,
              zIndex: 0,
            }}
          >
            +{extraCount}
          </div>
        )}
      </div>
      {selectedCreator && (
        <CreatorDetailModal
          creator={selectedCreator}
          onClose={() => setSelectedCreator(null)}
        />
      )}
    </>
  )
}

// 単一アイコン表示用（MessageItem用）
export function SingleCreatorIcon({
  creatorId,
  size = 'md',
  showTooltip = true,
  clickable = true,
}: {
  creatorId: string
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  clickable?: boolean
}) {
  const [showModal, setShowModal] = useState(false)
  const creator = getCreatorById(creatorId)
  const config = sizeConfig[size]

  if (!creator) {
    return (
      <div className={`${config.icon} rounded-sm bg-emerald-600 flex items-center justify-center text-white ${config.text} font-medium shrink-0`}>
        BT
      </div>
    )
  }

  return (
    <>
      <div
        className={`${config.icon} rounded-sm bg-emerald-600 flex items-center justify-center text-white ${config.text} font-medium shrink-0 ${clickable ? 'cursor-pointer hover:ring-2 hover:ring-emerald-400' : ''} transition-all`}
        title={showTooltip ? creator.name : undefined}
        onClick={clickable ? () => setShowModal(true) : undefined}
      >
        {creator.imageUrl ? (
          <img
            src={creator.imageUrl}
            alt={creator.name}
            className="w-full h-full rounded-sm object-cover"
          />
        ) : (
          getInitial(creator.name)
        )}
      </div>
      {showModal && (
        <CreatorDetailModal
          creator={creator}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
