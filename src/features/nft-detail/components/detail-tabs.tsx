import { EmptyState } from '@/components/feedback/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { NftDetail } from '@/contracts/nft'

const triggerClassName =
  'text-cream pb-1 text-[17px] md:text-[17px] data-[state=active]:border-b-[3px] data-[state=active]:text-primary-light'

const sectionTitleClassName = 'text-cream mt-3 text-[15px] leading-6 font-bold'
const bodyClassName = 'text-foreground text-sm leading-6'

export function DetailTabs({ nft }: { nft: NftDetail }) {
  return (
    <Tabs defaultValue="details" className="gap-0">
      <TabsList className="border-primary/50 gap-9 border-b">
        <TabsTrigger value="details" className={triggerClassName}>
          Detalhes do NFT
        </TabsTrigger>
        <TabsTrigger value="reviews" className={triggerClassName}>
          Avaliações de colecionadores ({nft.rating.count})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="pt-3">
        <div className="flex flex-col gap-6">
          {nft.story.map((paragraph) => (
            <p key={paragraph} className={bodyClassName}>
              {paragraph}
            </p>
          ))}
        </div>
        <h3 className={sectionTitleClassName}>Rede:</h3>
        <p className={bodyClassName}>{nft.networkNote}</p>
        <h3 className={sectionTitleClassName}>Contrato:</h3>
        <p className={bodyClassName}>{nft.contractNote}</p>
        <h3 className={sectionTitleClassName}>Direitos autorais:</h3>
        <p className={bodyClassName}>{nft.royaltyNote}</p>
      </TabsContent>

      <TabsContent value="reviews" className="pt-6">
        <EmptyState
          title="Avaliações indisponíveis"
          description={`As ${nft.rating.count} avaliações de colecionadores ainda não estão disponíveis nesta versão.`}
        />
      </TabsContent>
    </Tabs>
  )
}
