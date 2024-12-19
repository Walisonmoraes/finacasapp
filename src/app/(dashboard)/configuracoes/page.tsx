import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>
      <Separator />
      <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Perfil</h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="Seu nome" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="seu@email.com" type="email" />
            </div>
            <Button>Salvar Alterações</Button>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Preferências</h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="currency">Moeda</Label>
              <Input id="currency" placeholder="BRL" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dateFormat">Formato de Data</Label>
              <Input id="dateFormat" placeholder="DD/MM/YYYY" />
            </div>
            <Button>Salvar Preferências</Button>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Exportar Dados</h3>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Exporte seus dados financeiros em diferentes formatos
            </p>
            <div className="flex space-x-2">
              <Button variant="outline">Exportar CSV</Button>
              <Button variant="outline">Exportar PDF</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
