import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">請查收您的信箱</CardTitle>
          <CardDescription>
            我們已發送驗證信至您的電子郵件地址
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            請點擊信件中的連結完成帳號驗證。如果沒有收到信件，請檢查垃圾郵件匣。
          </p>
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/auth/login">返回登入頁面</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
