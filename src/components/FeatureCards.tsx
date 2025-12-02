import { Truck, Headphones, Shield, CreditCard } from 'lucide-react'

interface FeatureCard {
  id: string
  title: string
  titleBn: string
  description?: string | null
  descriptionBn?: string | null
  icon: string
}

interface FeatureCardsProps {
  cards: FeatureCard[]
}

const iconMap: { [key: string]: any } = {
  truck: Truck,
  headphones: Headphones,
  shield: Shield,
  'credit-card': CreditCard,
}

export default function FeatureCards({ cards }: FeatureCardsProps) {
  if (cards.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(card => {
            const IconComponent = iconMap[card.icon] || Shield

            return (
              <div
                key={card.id}
                className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <IconComponent className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {card.titleBn}
                </h3>
                {card.descriptionBn && (
                  <p className="text-sm text-gray-600">{card.descriptionBn}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
