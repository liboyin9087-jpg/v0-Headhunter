import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">驗證錯誤</CardTitle>
          <CardDescription>
            驗證過程中發生錯誤
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            驗證連結可能已過期或無效。請嘗試重新註冊或聯繫客服。
          </p>
          <div className="flex justify-center gap-2">
            <Button asChild variant="outline">
              <Link href="/auth/login">返回登入</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">重新註冊</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
